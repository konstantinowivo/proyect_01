import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateUnitSchema = z.object({
  number: z.string().min(1).max(10).optional(),
  floor: z.number().int().min(0).optional(),
  size: z.number().positive().optional().nullable(),
  status: z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE']).optional(),
});

/**
 * GET /api/units/[id]
 * Get a specific unit by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth();
    const { id } = params;

    const whereClause: any = { id };

    if (session.role === 'ADMIN') {
      whereClause.building = {
        adminId: session.userId,
      };
    } else if (session.role === 'TENANT') {
      whereClause.tenants = {
        some: {
          userId: session.userId,
          isActive: true,
        },
      };
    }

    const unit = await prisma.unit.findFirst({
      where: whereClause,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        tenants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            payments: true,
            documents: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unidad no encontrada',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: unit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching unit:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No autorizado',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al obtener unidad',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/units/[id]
 * Update a unit
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth();

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Solo administradores pueden actualizar unidades',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateUnitSchema.parse(body);

    // Verify the unit belongs to the admin's building
    const existingUnit = await prisma.unit.findFirst({
      where: {
        id,
        building: {
          adminId: session.userId,
        },
      },
      include: {
        building: true,
      },
    });

    if (!existingUnit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unidad no encontrada',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // If changing the unit number, check for duplicates
    if (validatedData.number && validatedData.number !== existingUnit.number) {
      const duplicate = await prisma.unit.findUnique({
        where: {
          buildingId_number: {
            buildingId: existingUnit.buildingId,
            number: validatedData.number,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Ya existe una unidad con este número en el edificio',
              code: 'DUPLICATE_UNIT',
            },
          },
          { status: 400 }
        );
      }
    }

    const updatedUnit = await prisma.unit.update({
      where: { id },
      data: validatedData,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUnit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating unit:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Datos inválidos',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No autorizado',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al actualizar unidad',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/units/[id]
 * Delete a unit
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth();

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Solo administradores pueden eliminar unidades',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verify the unit belongs to the admin's building
    const unit = await prisma.unit.findFirst({
      where: {
        id,
        building: {
          adminId: session.userId,
        },
      },
      include: {
        _count: {
          select: {
            tenants: true,
            payments: true,
            tasks: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unidad no encontrada',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if unit has active tenants
    if (unit._count.tenants > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No se puede eliminar una unidad con inquilinos asignados',
            code: 'UNIT_HAS_TENANTS',
          },
        },
        { status: 400 }
      );
    }

    await prisma.unit.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Unidad eliminada exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting unit:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No autorizado',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al eliminar unidad',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTenantSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/tenants/[id]
 * Get a specific tenant by ID
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
      whereClause.userId = session.userId;
    }

    const tenant = await prisma.tenant.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
            size: true,
            status: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
            paidAt: true,
          },
          orderBy: {
            dueDate: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Inquilino no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: tenant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tenant:', error);

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
          message: 'Error al obtener inquilino',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenants/[id]
 * Update a tenant
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
            message: 'Solo administradores pueden actualizar inquilinos',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateTenantSchema.parse(body);

    // Verify the tenant belongs to the admin's building
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        id,
        building: {
          adminId: session.userId,
        },
      },
      include: {
        unit: true,
      },
    });

    if (!existingTenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Inquilino no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }

    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }

    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;

      // Update unit status based on tenant active status
      if (validatedData.isActive !== existingTenant.isActive) {
        // Check if there are other active tenants in this unit
        const otherActiveTenants = await prisma.tenant.count({
          where: {
            unitId: existingTenant.unitId,
            id: { not: id },
            isActive: true,
          },
        });

        // If deactivating and no other active tenants, set unit to VACANT
        if (!validatedData.isActive && otherActiveTenants === 0) {
          await prisma.unit.update({
            where: { id: existingTenant.unitId },
            data: { status: 'VACANT' },
          });
        }

        // If activating, set unit to OCCUPIED
        if (validatedData.isActive) {
          await prisma.unit.update({
            where: { id: existingTenant.unitId },
            data: { status: 'OCCUPIED' },
          });
        }
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
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
        data: updatedTenant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tenant:', error);

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
          message: 'Error al actualizar inquilino',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenants/[id]
 * Delete a tenant
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
            message: 'Solo administradores pueden eliminar inquilinos',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verify the tenant belongs to the admin's building
    const tenant = await prisma.tenant.findFirst({
      where: {
        id,
        building: {
          adminId: session.userId,
        },
      },
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Inquilino no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if tenant has payments
    if (tenant._count.payments > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No se puede eliminar un inquilino con pagos registrados. Desactívalo en su lugar.',
            code: 'TENANT_HAS_PAYMENTS',
          },
        },
        { status: 400 }
      );
    }

    // Check if there are other active tenants in this unit
    const otherActiveTenants = await prisma.tenant.count({
      where: {
        unitId: tenant.unitId,
        id: { not: id },
        isActive: true,
      },
    });

    // If no other active tenants, set unit to VACANT
    if (otherActiveTenants === 0) {
      await prisma.unit.update({
        where: { id: tenant.unitId },
        data: { status: 'VACANT' },
      });
    }

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Inquilino eliminado exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tenant:', error);

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
          message: 'Error al eliminar inquilino',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

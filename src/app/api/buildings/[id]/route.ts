import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateBuildingSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';

// GET /api/buildings/[id] - Get a specific building
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAdmin();
    const { id } = params;

    const building = await prisma.building.findFirst({
      where: {
        id,
        adminId: session.userId,
      },
      include: {
        units: true,
        _count: {
          select: {
            units: true,
            tenants: true,
            tasks: true,
            payments: true,
          },
        },
      },
    });

    if (!building) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Edificio no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: building,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get building error:', error);

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
          message: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/buildings/[id] - Update a building
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAdmin();
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = updateBuildingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Datos inválidos',
            code: 'VALIDATION_ERROR',
            field: validation.error.errors[0]?.path[0],
          },
        },
        { status: 400 }
      );
    }

    // Check if building exists and belongs to the admin
    const existing = await prisma.building.findFirst({
      where: {
        id,
        adminId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Edificio no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Update building
    const building = await prisma.building.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(
      {
        success: true,
        data: building,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update building error:', error);

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
          message: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/buildings/[id] - Delete a building
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAdmin();
    const { id } = params;

    // Check if building exists and belongs to the admin
    const existing = await prisma.building.findFirst({
      where: {
        id,
        adminId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Edificio no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Delete building (cascade will handle related records)
    await prisma.building.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Edificio eliminado exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete building error:', error);

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
          message: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

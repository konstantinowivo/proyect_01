import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createBuildingSchema } from '@/lib/validators';
import { getBuildingTenantFilter } from '@/lib/tenant-context';
import prisma from '@/lib/prisma';

// GET /api/buildings - Get all buildings for the authenticated admin
export async function GET() {
  try {
    const session = requireAdmin();

    // Get tenant filter using centralized helper (MULTI-TENANT SECURITY)
    const whereClause = getBuildingTenantFilter(session);

    const buildings = await prisma.building.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            units: true,
            tenants: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: buildings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get buildings error:', error);

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

// POST /api/buildings - Create a new building
export async function POST(request: NextRequest) {
  try {
    const session = requireAdmin();
    const body = await request.json();

    // Validate input
    const validation = createBuildingSchema.safeParse(body);
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

    // Create building
    const building = await prisma.building.create({
      data: {
        ...validation.data,
        adminId: session.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: building,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create building error:', error);

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

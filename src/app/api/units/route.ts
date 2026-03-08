import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUnitTenantFilter, verifyBuildingOwnership } from '@/lib/tenant-context';
import { z } from 'zod';

// Validation schema
const createUnitSchema = z.object({
  buildingId: z.string().uuid(),
  number: z.string().min(1).max(10),
  floor: z.number().int().min(0),
  size: z.number().positive().optional(),
  status: z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE']).optional(),
});

/**
 * GET /api/units
 * Get all units for the authenticated admin's buildings
 * Query params:
 *   - buildingId: Filter by building (optional)
 *   - status: Filter by status (optional)
 */
export async function GET(request: Request) {
  try {
    const session = requireAuth();
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const status = searchParams.get('status');

    // Get tenant filter using centralized helper (MULTI-TENANT SECURITY)
    const whereClause: any = getUnitTenantFilter(session);

    // Apply additional filters
    if (buildingId) {
      whereClause.buildingId = buildingId;
    }

    if (status && ['OCCUPIED', 'VACANT', 'MAINTENANCE'].includes(status)) {
      whereClause.status = status;
    }

    const units = await prisma.unit.findMany({
      where: whereClause,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        _count: {
          select: {
            tenants: true,
          },
        },
      },
      orderBy: [
        { building: { name: 'asc' } },
        { floor: 'asc' },
        { number: 'asc' },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: units,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching units:', error);

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
          message: 'Error al obtener unidades',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/units
 * Create a new unit
 */
export async function POST(request: Request) {
  try {
    const session = requireAuth();

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Solo administradores pueden crear unidades',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUnitSchema.parse(body);

    // Verify the building belongs to the admin (MULTI-TENANT SECURITY)
    await verifyBuildingOwnership(prisma, validatedData.buildingId, session.userId);

    // Check if unit number already exists in this building
    const existingUnit = await prisma.unit.findUnique({
      where: {
        buildingId_number: {
          buildingId: validatedData.buildingId,
          number: validatedData.number,
        },
      },
    });

    if (existingUnit) {
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

    const unit = await prisma.unit.create({
      data: {
        buildingId: validatedData.buildingId,
        number: validatedData.number,
        floor: validatedData.floor,
        size: validatedData.size,
        status: validatedData.status || 'VACANT',
      },
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
        data: unit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating unit:', error);

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
          message: 'Error al crear unidad',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

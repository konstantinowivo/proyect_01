import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTenantRecordFilter, verifyBuildingOwnership, verifyUnitOwnership } from '@/lib/tenant-context';
import { z } from 'zod';

// Validation schema
const createTenantSchema = z.object({
  userId: z.string().uuid(),
  unitId: z.string().uuid(),
  buildingId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/tenants
 * Get all tenants for the authenticated admin's buildings
 * Query params:
 *   - buildingId: Filter by building (optional)
 *   - unitId: Filter by unit (optional)
 *   - isActive: Filter by active status (optional)
 */
export async function GET(request: Request) {
  try {
    const session = requireAuth();
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const unitId = searchParams.get('unitId');
    const isActive = searchParams.get('isActive');

    // Get tenant filter using centralized helper (MULTI-TENANT SECURITY)
    const whereClause: any = getTenantRecordFilter(session);

    // Apply additional filters
    if (buildingId) {
      whereClause.buildingId = buildingId;
    }

    if (unitId) {
      whereClause.unitId = unitId;
    }

    if (isActive !== null && (isActive === 'true' || isActive === 'false')) {
      whereClause.isActive = isActive === 'true';
    }

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
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
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { startDate: 'desc' },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: tenants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tenants:', error);

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
          message: 'Error al obtener inquilinos',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants
 * Create a new tenant assignment
 */
export async function POST(request: Request) {
  try {
    const session = requireAuth();

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Solo administradores pueden asignar inquilinos',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createTenantSchema.parse(body);

    // Verify the building and unit belong to the admin (MULTI-TENANT SECURITY)
    await verifyBuildingOwnership(prisma, validatedData.buildingId, session.userId);
    await verifyUnitOwnership(prisma, validatedData.unitId, session.userId);

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Usuario no encontrado',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if user is already a tenant for this unit
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        userId: validatedData.userId,
        unitId: validatedData.unitId,
        isActive: true,
      },
    });

    if (existingTenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Este usuario ya es inquilino activo de esta unidad',
            code: 'DUPLICATE_TENANT',
          },
        },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        userId: validatedData.userId,
        unitId: validatedData.unitId,
        buildingId: validatedData.buildingId,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isActive: validatedData.isActive ?? true,
      },
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

    // Update unit status to OCCUPIED if tenant is active
    if (tenant.isActive) {
      await prisma.unit.update({
        where: { id: validatedData.unitId },
        data: { status: 'OCCUPIED' },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: tenant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tenant:', error);

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
          message: 'Error al crear inquilino',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

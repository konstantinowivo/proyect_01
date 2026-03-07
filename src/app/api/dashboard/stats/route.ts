import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/dashboard/stats?buildingId=xxx
 * Get dashboard statistics for a specific building or all buildings
 */
export async function GET(request: NextRequest) {
  try {
    const session = requireAdmin();
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    // Base where clause
    const whereClause: any = buildingId
      ? { buildingId }
      : { building: { adminId: session.userId } };

    // Get statistics
    const [
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      activeTenants,
      pendingTasks,
      urgentTasks,
      pendingPayments,
      overduePayments,
    ] = await Promise.all([
      // Total units
      prisma.unit.count({
        where: buildingId
          ? { buildingId }
          : { building: { adminId: session.userId } },
      }),

      // Occupied units
      prisma.unit.count({
        where: {
          ...whereClause,
          status: 'OCCUPIED',
        },
      }),

      // Vacant units
      prisma.unit.count({
        where: {
          ...whereClause,
          status: 'VACANT',
        },
      }),

      // Maintenance units
      prisma.unit.count({
        where: {
          ...whereClause,
          status: 'MAINTENANCE',
        },
      }),

      // Active tenants
      prisma.tenant.count({
        where: {
          ...whereClause,
          isActive: true,
        },
      }),

      // Pending tasks
      prisma.task.count({
        where: {
          ...whereClause,
          status: 'PENDING',
        },
      }),

      // Urgent tasks
      prisma.task.count({
        where: {
          ...whereClause,
          status: 'PENDING',
          priority: 'URGENT',
        },
      }),

      // Pending payments
      prisma.payment.count({
        where: {
          ...whereClause,
          status: 'PENDING',
        },
      }),

      // Overdue payments
      prisma.payment.count({
        where: {
          ...whereClause,
          status: 'OVERDUE',
        },
      }),
    ]);

    // Calculate total revenue and collection rate
    const payments = await prisma.payment.findMany({
      where: buildingId
        ? { buildingId }
        : { building: { adminId: session.userId } },
      select: {
        amount: true,
        status: true,
      },
    });

    const totalRevenue = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);

    const collectionRate =
      totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;

    const stats = {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      activeTenants,
      pendingTasks,
      urgentTasks,
      pendingPayments,
      overduePayments,
      totalRevenue,
      collectionRate: Math.round(collectionRate * 100) / 100,
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);

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

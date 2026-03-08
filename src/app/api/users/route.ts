import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users
 * Get all users (for ADMIN role only)
 * Query params:
 *   - role: Filter by role (optional)
 */
export async function GET(request: Request) {
  try {
    const session = requireAuth();

    // Only admins can list users
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Solo administradores pueden listar usuarios',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const whereClause: any = {};

    // Filter by role if provided
    if (role && ['ADMIN', 'TENANT'].includes(role)) {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);

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
          message: 'Error al obtener usuarios',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

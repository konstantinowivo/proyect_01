import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: 'Sesión cerrada exitosamente',
        },
      },
      { status: 200 }
    );

    // Delete cookie directly on the response
    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Error al cerrar sesión',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

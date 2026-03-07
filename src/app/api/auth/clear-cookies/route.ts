import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Clear all auth cookies - useful for debugging redirect loops
 * GET /api/auth/clear-cookies
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');

    return NextResponse.json({
      success: true,
      message: 'Cookies cleared successfully. You can now go to /login'
    });
  } catch (error) {
    console.error('Error clearing cookies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
}

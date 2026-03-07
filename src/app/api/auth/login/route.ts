import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { comparePasswords, generateToken, setAuthCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
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

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Email o contraseña incorrectos',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Email o contraseña incorrectos',
            code: 'INVALID_CREDENTIALS',
          },
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      },
      { status: 200 }
    );

    // Set cookie directly on the response
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
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

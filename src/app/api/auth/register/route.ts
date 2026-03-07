import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validators';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    const { email, password, name, phone, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'El email ya está registrado',
            code: 'EMAIL_EXISTS',
            field: 'email',
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
      },
    });

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
      { status: 201 }
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
    console.error('Register error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'El email ya está registrado',
              code: 'EMAIL_EXISTS',
            },
          },
          { status: 409 }
        );
      }
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

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { UserRole } from '@/types';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a password with its hash
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log('🔐 Verifying token with SECRET:', JWT_SECRET?.substring(0, 10) + '...');
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('✅ Token verified successfully for:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Get the current session from cookies
 */
export function getSession(): JWTPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Set the auth token in cookies
 */
export function setAuthCookie(token: string): void {
  const cookieStore = cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear the auth token from cookies
 */
export function clearAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete('token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getSession();
  return session !== null;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const session = getSession();
  return session?.role === UserRole.ADMIN;
}

/**
 * Require authentication middleware
 */
export function requireAuth(): JWTPayload {
  const session = getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require admin role middleware
 */
export function requireAdmin(): JWTPayload {
  const session = requireAuth();

  if (session.role !== UserRole.ADMIN) {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

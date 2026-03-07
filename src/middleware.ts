import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public routes
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // All other routes require authentication (just check if token exists)
  // Token validation will be done in layouts with Node.js runtime
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access - full token verification and role checks are handled in layouts
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};

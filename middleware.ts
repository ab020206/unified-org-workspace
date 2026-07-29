import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/maintenance',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Create base response and set Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Maintenance Mode redirect
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  if (isMaintenanceMode && pathname !== '/maintenance' && !pathname.startsWith('/api/platform')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // Public path bypass
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path);
  if (isPublic) {
    return response;
  }

  // Tenant Context forwarding
  const orgHeader = request.headers.get('x-organization-id');
  const requestHeaders = new Headers(request.headers);
  if (orgHeader) {
    requestHeaders.set('x-organization-id', orgHeader);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

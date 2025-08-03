import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/', 
  '/login', 
  '/sign-up', 
  '/api/tests', 
  '/api/protected-tests', 
  '/ptests',
  '/api/auth',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

const API_PATHS = [
  '/api/create-invoice',
  '/api/profile/purchased-courses',
  '/api/purchase',
  '/api/purchase/check',
  '/api/qpay',
  '/api/qpay-callback'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  
  // If not authenticated, redirect to login (except for public paths)
  if (!token) {
    // Allow access to public paths without authentication
    if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.next();
    }
    
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For other routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icon files (PWA icons)
     * - api/auth (authentication endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-|api/auth).*)',
  ],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Only protect specific API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/create-invoice',
  '/api/profile/purchased-courses',
  '/api/purchase',
  '/api/purchase/check',
  '/api/qpay',
  '/api/qpay-callback',
  '/api/profile/me',
  '/api/profile/update',
  '/api/profile/purchase-history'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check authentication for protected API routes
  if (PROTECTED_API_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only apply middleware to protected API routes
    '/api/create-invoice',
    '/api/profile/:path*',
    '/api/purchase/:path*',
    '/api/qpay/:path*',
  ],
}; 
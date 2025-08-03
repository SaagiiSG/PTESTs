import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Always allow static files and public assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/manifest.json') ||
    request.nextUrl.pathname.startsWith('/icon-') ||
    request.nextUrl.pathname.startsWith('/bg-') ||
    request.nextUrl.pathname.startsWith('/google_icon.png') ||
    request.nextUrl.pathname.startsWith('/ppnim_logo.svg') ||
    request.nextUrl.pathname.startsWith('/thumbnail_') ||
    request.nextUrl.pathname.startsWith('/vercel.svg') ||
    request.nextUrl.pathname.startsWith('/next.svg') ||
    request.nextUrl.pathname.startsWith('/file.svg') ||
    request.nextUrl.pathname.startsWith('/globe.svg') ||
    request.nextUrl.pathname.startsWith('/window.svg') ||
    request.nextUrl.pathname.includes('.png') ||
    request.nextUrl.pathname.includes('.jpg') ||
    request.nextUrl.pathname.includes('.jpeg') ||
    request.nextUrl.pathname.includes('.gif') ||
    request.nextUrl.pathname.includes('.svg') ||
    request.nextUrl.pathname.includes('.ico') ||
    request.nextUrl.pathname.includes('.css') ||
    request.nextUrl.pathname.includes('.js')
  ) {
    return NextResponse.next();
  }

  // Allow public API routes (these should bypass Vercel Authentication)
  if (
    request.nextUrl.pathname.startsWith('/api/public/') ||
    request.nextUrl.pathname.startsWith('/api/courses') ||
    request.nextUrl.pathname.startsWith('/api/protected-tests') ||
    request.nextUrl.pathname.startsWith('/api/debug-env') ||
    request.nextUrl.pathname.startsWith('/api/test-connection') ||
    request.nextUrl.pathname.startsWith('/api/test-invoice') ||
    request.nextUrl.pathname.startsWith('/api/test-qpay')
  ) {
    return NextResponse.next();
  }

  // For protected API routes, let them handle their own authentication
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // For all other routes, continue with normal processing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - public files (icons, images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-|bg-|google_icon.png|ppnim_logo.svg|thumbnail_|vercel.svg|next.svg|file.svg|globe.svg|window.svg).*)',
  ],
}; 
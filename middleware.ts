import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TEMPORARY: Allow everything to bypass Vercel Authentication issues
  console.log('Middleware: Allowing access to:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Temporarily disable all middleware matching
    // '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-|bg-|google_icon.png|ppnim_logo.svg|thumbnail_|vercel.svg|next.svg|file.svg|globe.svg|window.svg).*)',
  ],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/', '/login', '/sign-up', '/api/tests', '/api/protected-tests', '/ptests'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Use getToken to check for a valid session (no DB access)
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// }; 
export const config = {
  matcher: [],
}; 
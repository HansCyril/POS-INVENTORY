import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the user is logged in via cookie
  const session = request.cookies.get('pos_session');
  const isLoggedIn = session && session.value === 'active';

  // Define public paths that don't require authentication
  const isPublicPath = pathname === '/login';

  // Redirect logic
  if (!isLoggedIn && !isPublicPath) {
    // Redirect to login if not logged in and trying to access a protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && isPublicPath) {
    // Redirect to dashboard if logged in and trying to access login page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Proxy logic to handle both route protection and authenticated redirection.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('csrf_access_token')
  const { pathname } = request.nextUrl

  // Define route groups
  const protectedRoutes = ['/dashboard', '/profile', '/generate-options', '/generate-questions']
  const publicOnlyRoutes = ['/', '/login', '/signup']

  // 1. Protection: If accessing a protected route without a token
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. Reroute: If accessing landing/login/signup with a valid token
  if (publicOnlyRoutes.includes(pathname)) {
    if (authCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

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
}
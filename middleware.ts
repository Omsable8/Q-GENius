import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for the CSRF access token as a proxy for being logged in
  const authCookie = request.cookies.get('csrf_access_token')
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/generate-options', '/generate-questions']

  // If the path is protected and no cookie exists, redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!authCookie) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configures which paths the middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/generate-options/:path*',
    '/generate-questions/:path*',
  ],
}
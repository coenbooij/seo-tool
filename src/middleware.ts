import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    console.log('Middleware running for:', req.nextUrl.pathname);
    console.log('Token:', req.nextauth.token);

    // If the user is authenticated and trying to access auth pages, redirect to dashboard
    if (req.nextUrl.pathname.startsWith('/auth/') && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Authorization check for:', req.nextUrl.pathname);
        console.log('Token present:', !!token);
        
        // Allow access to auth pages without authentication
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        // Require authentication for dashboard and API routes
        return !!token
      }
    }
  }
)

// Protect all dashboard and API routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/projects/:path*',
    '/api/dashboard/:path*'
  ]
}

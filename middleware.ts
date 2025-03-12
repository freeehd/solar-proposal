import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for auth cookie
  const authCookie = request.cookies.get('authjs.session-token')?.value
  
  // Check if the user is authenticated based on cookie presence
  if (!authCookie) {
    // Redirect to login if accessing protected routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                             request.nextUrl.pathname.startsWith('/admin') ||
                             request.nextUrl.pathname.startsWith('/proposals')
    
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    // Redirect authenticated users away from auth pages
    const isAuthPage = request.nextUrl.pathname === '/login'
    
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/proposals/:path*', '/login'],
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from './lib/supabase'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/callback', '/api/auth/callback']
  
  // Admin routes that require admin role
  const adminRoutes = ['/admin']
  
  // Member routes that require member role or above
  const memberRoutes = ['/feed', '/post/new', '/chats', '/notifications', '/library', '/profile', '/settings']

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get session token from cookies
  const token = request.cookies.get('supabase-auth-token')?.value

  if (!token) {
    // No token - redirect to landing page
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    // Verify token and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      // Invalid token - redirect to landing page
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Get user profile to check role and status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // No profile - redirect to landing page
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if user is pending approval
    if (profile.status === 'pending') {
      // Pending users can only access landing page
      if (!publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Check if user is banned
    if (profile.status === 'banned') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (profile.role !== 'Admin') {
        // Non-admin trying to access admin route
        return NextResponse.redirect(new URL('/feed', request.url))
      }
    }

    // Check member routes
    if (memberRoutes.some(route => pathname.startsWith(route))) {
      const allowedRoles = ['Member', 'Leader', 'Admin']
      if (!allowedRoles.includes(profile.role)) {
        // Non-member trying to access member route
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', profile.role)
    response.headers.set('x-user-status', profile.status)

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    // Error verifying token - redirect to landing page
    return NextResponse.redirect(new URL('/', request.url))
  }
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
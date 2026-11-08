import { NextResponse, type NextRequest } from 'next/server'

// Allowed roles per route
const ROLE_ROUTES: Record<string, string[]> = {
  '/kitchen': ['kitchen', 'admin'],
  '/waiter':  ['waiter', 'admin'],
  '/billing': ['cashier', 'admin'],
  '/admin':   ['admin'],
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Customer table routes pass freely
  if (pathname.startsWith('/t/')) {
    const token = pathname.split('/')[2]
    if (!token) {
      return NextResponse.redirect(new URL('/invalid-table', request.url))
    }
    return NextResponse.next()
  }

  // Check staff routes
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      // 1. Check quick PIN role cookie
      const roleCookie = request.cookies.get('vispute_role')?.value

      if (roleCookie && allowedRoles.includes(roleCookie)) {
        return NextResponse.next()
      }

      // If no valid role cookie, redirect to fast login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

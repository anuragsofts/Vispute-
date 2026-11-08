import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require specific roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/kitchen': ['kitchen', 'admin'],
  '/waiter':  ['waiter', 'admin'],
  '/billing': ['cashier', 'admin'],
  '/admin':   ['admin'],
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check protected staff routes
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!user) {
        // Redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check role in DB
      const { data: staffData } = await supabase
        .from('staff')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (!staffData || !allowedRoles.includes(staffData.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // Customer table route – no auth needed, just validate token exists
  if (pathname.startsWith('/t/')) {
    const token = pathname.split('/')[2]
    if (!token) {
      return NextResponse.redirect(new URL('/invalid-table', request.url))
    }
    // Token validation happens in the page itself
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

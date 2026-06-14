import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Routes that never need auth checks
  const publicPaths = ['/signin', '/signup', '/landing', '/check-email', '/auth/callback']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p))
  const isApi = pathname.startsWith('/api/')
  const isStatic = pathname.startsWith('/_next/') || pathname.includes('.')

  // Root always goes to landing
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
  }

  // For public + static routes, skip auth but check if authed user hits auth pages
  if (isPublic || isApi || isStatic) {
    // If visiting signin/signup/landing while already logged in, go to app
    if (isPublic && !isApi) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() { return request.cookies.getAll() },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                  supabaseResponse.cookies.set(name, value, options)
                )
              },
            },
          }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user && (pathname === '/signin' || pathname === '/signup' || pathname === '/landing')) {
          const url = request.nextUrl.clone()
          url.pathname = '/discover'
          return NextResponse.redirect(url)
        }
      } catch {
        // Supabase unreachable - just serve the page
      }
    }
    return supabaseResponse
  }

  // Protected routes - require auth
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    // Supabase unreachable - redirect to signin
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

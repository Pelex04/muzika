import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // ── Maintenance mode ─────────────────────────────────────────────
  // Toggle: set MAINTENANCE_MODE=true in Vercel env vars (server only,
  // no NEXT_PUBLIC_ prefix). Then redeploy — or use Vercel's
  // "Instant Rollback" / env var override to avoid a full rebuild.
  const maintenance = process.env.MAINTENANCE_MODE === 'true'
  const isAsset = pathname.startsWith('/_next/') || pathname.includes('.')
  const isMaintenancePage = pathname === '/maintenance'

  if (maintenance && !isMaintenancePage && !isAsset) {
    const secret = process.env.ADMIN_BYPASS_SECRET

    // Bypass method 1: URL param ?bypass=<secret>
    // Visit https://muziqa.vercel.app/?bypass=<your-secret> to set the cookie, then browse freely
    const urlBypass = request.nextUrl.searchParams.get('bypass')
    if (secret && urlBypass === secret) {
      // Set cookie and let them through
      const url = request.nextUrl.clone()
      url.searchParams.delete('bypass')
      const res = url.pathname === '/maintenance'
        ? NextResponse.redirect(new URL('/discover', request.url))
        : NextResponse.redirect(url)
      res.cookies.set('muzika_admin_bypass', secret, {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
      })
      return res
    }

    // Bypass method 2: cookie set by method 1
    const cookieBypass = request.cookies.get('muzika_admin_bypass')?.value
    const isAdminBypass = secret && cookieBypass === secret

    if (!isAdminBypass) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.redirect(url)
    }
  }
  if (isMaintenancePage && !maintenance) {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
  }
  if (isMaintenancePage) return NextResponse.next({ request })

  const publicPaths = ['/signin', '/signup', '/landing', '/check-email', '/auth/callback', '/suspended']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p))
  const isApi = pathname.startsWith('/api/')
  const isStatic = pathname.startsWith('/_next/') || pathname.includes('.')

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
  }

  if (isPublic || isApi || isStatic) {
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
      } catch {}
    }
    return supabaseResponse
  }

  // Protected routes — require auth
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

    // ── Role + suspension check via service-role (cannot be spoofed) ──
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await admin
      .from('profiles')
      .select('role, suspended_at')
      .eq('id', user.id)
      .single()

    // Suspended users → kick to /suspended page
    if (profile?.suspended_at && pathname !== '/suspended') {
      const url = request.nextUrl.clone()
      url.pathname = '/suspended'
      return NextResponse.redirect(url)
    }

    // /admin routes — only admins allowed
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/discover'
      return NextResponse.redirect(url)
    }

    // Non-admin users hitting signin after login → discover
    // Admin users hitting /discover after login → /admin
    if (pathname === '/discover' && profile?.role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

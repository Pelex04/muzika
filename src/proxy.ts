import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Concurrent requests (e.g. several fire at once when a backgrounded tab
  // resumes) can race on refreshing a near-expiry session token. Supabase
  // refresh tokens are single-use, so the request that loses the race sees
  // an invalid session and redirects toward signin while another request
  // still holding the valid cookie redirects the other way -- these can
  // bounce off each other into a real ERR_TOO_MANY_REDIRECTS. This counts
  // hops per navigation chain via a short-lived cookie and, if we're about
  // to redirect for the 3rd+ time in the same chain, stops and just serves
  // the page as-is instead of adding another hop.
  const hopCount = parseInt(request.cookies.get('_rg')?.value ?? '0', 10)
  const redirectTo = (url: URL | string) => {
    if (hopCount >= 3) return supabaseResponse
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => res.cookies.set(cookie))
    res.cookies.set('_rg', String(hopCount + 1), { maxAge: 5, path: '/' })
    return res
  }

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
        ? redirectTo(new URL('/discover', request.url))
        : redirectTo(url)
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
      return redirectTo(url)
    }
  }
  if (isMaintenancePage && !maintenance) {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return redirectTo(url)
  }
  if (isMaintenancePage) return NextResponse.next({ request })

  // ── Auth rate limiting ───────────────────────────────────────────
  // 4 attempts per IP per 15 minutes on auth endpoints.
  // This limits brute-force attacks on login/signup without Redis.
  const isAuthEndpoint =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname.startsWith('/api/auth/')

  if (isAuthEndpoint) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    const result = rateLimit(`auth:${ip}`, 4, 15 * 60 * 1000)

    if (!result.allowed) {
      const retryAfterSec = Math.ceil(result.resetInMs / 1000)

      // For API calls return JSON
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSec),
              'X-RateLimit-Limit': '4',
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }

      // For page visits redirect to signin with error param
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('error', 'too_many_attempts')
      url.searchParams.set('retry_after', String(retryAfterSec))
      return redirectTo(url)
    }
  }

  const publicPaths = ['/signin', '/signup', '/landing', '/check-email', '/auth/callback', '/suspended', '/forgot-password', '/reset-password', '/app-launch']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p))
  const isApi = pathname.startsWith('/api/')
  const isStatic = pathname.startsWith('/_next/') || pathname.includes('.')

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return redirectTo(url)
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
          return redirectTo(url)
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
      return redirectTo(url)
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
      return redirectTo(url)
    }

    // /studio routes — only artists allowed
    if (pathname.startsWith('/studio')) {
      const { data: artistCheck } = await admin
        .from('artists')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!artistCheck) {
        const url = request.nextUrl.clone()
        url.pathname = '/become-artist'
        return redirectTo(url)
      }
    }

    // /admin routes — only admins allowed
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/discover'
      return redirectTo(url)
    }

    // Non-admin users hitting signin after login → discover
    // Admin users hitting /discover after login → /admin
    if (pathname === '/discover' && profile?.role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return redirectTo(url)
    }

    return supabaseResponse
  } catch {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return redirectTo(url)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

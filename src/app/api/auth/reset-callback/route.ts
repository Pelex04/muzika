import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Dedicated callback for password recovery links. Kept separate from
// /api/auth/callback (used for OAuth) because Supabase's Redirect URL
// allow-list requires an exact match for non-wildcard entries -- appending
// a `?next=...` query param to that shared route broke the match and
// caused Supabase to silently fall back to the Site URL instead. This
// route takes no query params, so it can be allow-listed exactly as-is.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`)
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=reset_failed`)
}

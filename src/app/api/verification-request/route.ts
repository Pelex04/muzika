import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase.from('artists').select('id, verified, social_links').eq('profile_id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { data } = await supabase.from('verification_requests').select('*').eq('artist_id', artist.id).single()
  return NextResponse.json({ request: data ?? null, verified: artist.verified ?? false, socialLinks: artist.social_links ?? {} })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase.from('artists').select('id, verified').eq('profile_id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })
  if (artist.verified) return NextResponse.json({ error: 'You are already verified' }, { status: 400 })

  const { legalName, pressLink, message } = await req.json() as {
    legalName?: string
    pressLink?: string | null
    message?: string | null
  }

  if (!legalName?.trim()) {
    return NextResponse.json({ error: 'Legal name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .upsert({
      artist_id: artist.id,
      legal_name: legalName.trim(),
      press_link: pressLink?.trim() || null,
      message: message ?? null,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'artist_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ request: data })
}

export async function DELETE() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase.from('artists').select('id').eq('profile_id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { error } = await supabase.from('verification_requests').delete().eq('artist_id', artist.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}

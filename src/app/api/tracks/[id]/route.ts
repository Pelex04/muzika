import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// PATCH — update track metadata (lyrics, producers, featured artists, title)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: track } = await supabase
    .from('tracks')
    .select('artist_id')
    .eq('id', id)
    .single()

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('id', track.artist_id)
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['title', 'lyrics', 'producers', 'featured_artists', 'genre', 'episode_number']
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const admin = getAdmin()
  const { data, error } = await admin.from('tracks').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ track: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Step 1: verify the user is logged in
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Step 2: fetch the track (user client — RLS lets published tracks be read)
  const { data: track } = await supabase
    .from('tracks')
    .select('audio_path, cover_url, artist_id')
    .eq('id', id)
    .single()

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Step 3: verify the caller owns this track
  const { data: artist } = await supabase
    .from('artists')
    .select('id, track_count')
    .eq('id', track.artist_id)
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Step 4: use a raw admin client built directly from env vars
  // This guarantees service-role access regardless of how the cookie client is configured
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Step 5: delete audio from storage
  if (track.audio_path) {
    await admin.storage.from('tracks').remove([track.audio_path])
  }

  // Step 6: delete cover from storage
  if (track.cover_url) {
    try {
      const url = new URL(track.cover_url)
      const match = url.pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await admin.storage.from('covers').remove([match[1]])
    } catch {}
  }

  // Step 7: hard delete the track record
  const { error: deleteErr } = await admin
    .from('tracks')
    .delete()
    .eq('id', id)

  if (deleteErr) {
    console.error('[DELETE track] DB error:', deleteErr)
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  // Step 8: decrement artist track_count
  await admin
    .from('artists')
    .update({ track_count: Math.max(0, (artist.track_count ?? 1) - 1) })
    .eq('id', track.artist_id)

  return NextResponse.json({ deleted: true })
}


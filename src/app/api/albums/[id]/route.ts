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

// DELETE — artist deletes their own album (published or still scheduled)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Step 1: verify the user is logged in
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  // Step 2: fetch the album via the admin client — this must work
  // regardless of published/is_scheduled state, since RLS would otherwise
  // hide unpublished/scheduled albums from their own owner in some paths.
  const { data: album } = await admin
    .from('albums')
    .select('id, cover_url, artist_id')
    .eq('id', id)
    .single()

  if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 })

  // Step 3: verify the caller owns this album
  const { data: artist } = await admin
    .from('artists')
    .select('id, track_count')
    .eq('id', album.artist_id)
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Step 4: fetch all tracks on this album (any status — published or scheduled)
  const { data: tracks } = await admin
    .from('tracks')
    .select('id, audio_path, cover_url')
    .eq('album_id', id)

  // Step 5: delete all track audio files from storage
  const audioPaths = (tracks ?? []).map((t: any) => t.audio_path).filter(Boolean)
  if (audioPaths.length) await admin.storage.from('tracks').remove(audioPaths)

  // Step 6: delete album cover from storage
  if (album.cover_url) {
    try {
      const match = new URL(album.cover_url).pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await admin.storage.from('covers').remove([match[1]])
    } catch {}
  }

  // Step 7: delete all track records for this album
  if ((tracks ?? []).length) {
    await admin.from('tracks').delete().eq('album_id', id)
  }

  // Step 8: delete the album record itself
  const { error: deleteErr } = await admin.from('albums').delete().eq('id', id)
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 })

  // Step 9: decrement artist track_count by however many tracks were removed
  const removed = (tracks ?? []).length
  await admin
    .from('artists')
    .update({ track_count: Math.max(0, (artist.track_count ?? removed) - removed) })
    .eq('id', album.artist_id)

  return NextResponse.json({ deleted: true })
}

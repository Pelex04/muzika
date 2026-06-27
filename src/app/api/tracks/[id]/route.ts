import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: track, error: trackErr } = await supabase
    .from('tracks')
    .select('audio_path, cover_url, artist_id')
    .eq('id', id)
    .single()

  if (trackErr || !track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  const { data: artist, error: artistErr } = await supabase
    .from('artists')
    .select('id, track_count')
    .eq('id', track.artist_id)
    .eq('profile_id', user.id)
    .single()

  if (artistErr || !artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await createServiceClient() as any

  if (track.audio_path) {
    await admin.storage.from('tracks').remove([track.audio_path])
  }

  if (track.cover_url) {
    try {
      const url = new URL(track.cover_url)
      const match = url.pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await admin.storage.from('covers').remove([match[1]])
    } catch {}
  }

  const { error: deleteErr } = await admin.from('tracks').delete().eq('id', id)
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 })

  await admin
    .from('artists')
    .update({ track_count: Math.max(0, (artist.track_count ?? 1) - 1) })
    .eq('id', track.artist_id)

  return NextResponse.json({ deleted: true })
}

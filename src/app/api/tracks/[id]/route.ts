import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the track with its storage path
  const { data: track } = await supabase
    .from('tracks')
    .select('audio_path, cover_url, artist_id')
    .eq('id', id)
    .single()

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Verify the caller owns this track
  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('id', track.artist_id)
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Delete audio from storage
  if (track.audio_path) {
    await supabase.storage.from('tracks').remove([track.audio_path])
  }

  // Delete cover from storage — cover_url is a public URL, extract the path
  if (track.cover_url) {
    try {
      const url = new URL(track.cover_url)
      // Supabase public URL format: .../storage/v1/object/public/covers/<path>
      const match = url.pathname.match(/\/public\/covers\/(.+)$/)
      if (match) {
        await supabase.storage.from('covers').remove([match[1]])
      }
    } catch {
      // Non-fatal — continue with DB delete
    }
  }

  // Delete the track record (cascades to purchases, saved_tracks, playlist_tracks)
  const { error } = await supabase.from('tracks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Decrement artist track_count
  const { data: artistData } = await supabase
    .from('artists')
    .select('track_count')
    .eq('id', track.artist_id)
    .single()

  await supabase
    .from('artists')
    .update({ track_count: Math.max(0, (artistData?.track_count ?? 1) - 1) })
    .eq('id', track.artist_id)

  return NextResponse.json({ deleted: true })
}

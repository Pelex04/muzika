import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('[DELETE] track id:', id)

  // User client — auth + ownership check
  const supabase = await createClient() as any
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  console.log('[DELETE] user:', user?.id, 'authErr:', authErr)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the track
  const { data: track, error: trackErr } = await supabase
    .from('tracks')
    .select('audio_path, cover_url, artist_id')
    .eq('id', id)
    .single()
  console.log('[DELETE] track:', track, 'trackErr:', trackErr)

  if (trackErr || !track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Verify ownership
  const { data: artist, error: artistErr } = await supabase
    .from('artists')
    .select('id, track_count')
    .eq('id', track.artist_id)
    .eq('profile_id', user.id)
    .single()
  console.log('[DELETE] artist:', artist, 'artistErr:', artistErr)

  if (artistErr || !artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Service-role client for actual deletes
  const admin = await createServiceClient() as any

  // Verify service client is actually different
  const { data: testTrack, error: testErr } = await admin
    .from('tracks')
    .select('id, title')
    .eq('id', id)
    .single()
  console.log('[DELETE] admin can see track:', testTrack, 'testErr:', testErr)

  // Delete audio from storage
  if (track.audio_path) {
    const { error: audioErr } = await admin.storage.from('tracks').remove([track.audio_path])
    console.log('[DELETE] audio storage remove error:', audioErr)
  }

  // Delete the track DB record
  const { error: deleteErr, data: deleteData } = await admin
    .from('tracks')
    .delete()
    .eq('id', id)
    .select()
  console.log('[DELETE] delete result data:', deleteData, 'deleteErr:', deleteErr)

  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 })

  // Decrement track_count
  await admin
    .from('artists')
    .update({ track_count: Math.max(0, (artist.track_count ?? 1) - 1) })
    .eq('id', track.artist_id)

  console.log('[DELETE] success')
  return NextResponse.json({ deleted: true })
}

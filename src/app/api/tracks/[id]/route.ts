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

  // Verify ownership
  const { data: track } = await supabase
    .from('tracks')
    .select('audio_path, cover_url, artist_id')
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

  // Delete audio file from storage
  if (track.audio_path) {
    await supabase.storage.from('tracks').remove([track.audio_path])
  }

  // Delete track record (cascades to purchases, saved_tracks)
  const { error } = await supabase.from('tracks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: true })
}

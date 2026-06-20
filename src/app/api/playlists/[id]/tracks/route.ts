import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playlistId } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { track_id } = await req.json()
  if (!track_id) return NextResponse.json({ error: 'track_id is required' }, { status: 400 })

  // Verify ownership of playlist
  const { data: playlist } = await supabase
    .from('playlists')
    .select('user_id')
    .eq('id', playlistId)
    .single()

  if (!playlist || playlist.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check if already in playlist
  const { data: existing } = await supabase
    .from('playlist_tracks')
    .select('id')
    .eq('playlist_id', playlistId)
    .eq('track_id', track_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Track already in playlist' }, { status: 409 })
  }

  // Get current max position
  const { data: maxPos } = await supabase
    .from('playlist_tracks')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (maxPos?.position ?? -1) + 1

  const { error } = await supabase
    .from('playlist_tracks')
    .insert({ playlist_id: playlistId, track_id, position: nextPosition })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ added: true }, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: playlist, error: pErr } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single()

  if (pErr || !playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
  if (playlist.user_id !== user.id && !playlist.is_public) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: playlistTracks } = await supabase
    .from('playlist_tracks')
    .select(`
      id, position, added_at,
      track:tracks(*, artist:artists(stage_name, genre, location, verified))
    `)
    .eq('playlist_id', id)
    .order('position', { ascending: true })

  return NextResponse.json({
    playlist,
    tracks: (playlistTracks ?? []).map((pt: any) => pt.track).filter(Boolean),
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: playlist } = await supabase
    .from('playlists')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!playlist || playlist.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('playlists').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: playlist } = await supabase
    .from('playlists')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!playlist || playlist.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  if (body.is_public !== undefined) updates.is_public = body.is_public

  const { data: updated, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ playlist: updated })
}

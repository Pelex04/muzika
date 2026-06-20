import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: playlists, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_tracks(count)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const withCounts = (playlists ?? []).map((p: any) => ({
    ...p,
    track_count: p.playlist_tracks?.[0]?.count ?? 0,
    playlist_tracks: undefined,
  }))

  return NextResponse.json({ playlists: withCounts })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 })

  const { data: playlist, error } = await supabase
    .from('playlists')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ playlist }, { status: 201 })
}

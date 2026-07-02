import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Powers the scrollable Now Playing page: artist details + follow
// state, more tracks from the same artist, and related tracks by genre
// -- all fetched together so the page only needs one request.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackId } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: track } = await supabase
    .from('tracks')
    .select('id, artist_id, genre, lyrics, producers, featured_artists')
    .eq('id', trackId)
    .single()

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  const [artistRes, moreByArtistRes, relatedRes] = await Promise.all([
    supabase
      .from('artists')
      .select('*, profile:profiles(full_name, avatar_url)')
      .eq('id', track.artist_id)
      .single(),
    supabase
      .from('tracks')
      .select('*, artist:artists(stage_name, genre, location, verified)')
      .eq('artist_id', track.artist_id)
      .eq('published', true)
      .neq('id', trackId)
      .order('play_count', { ascending: false })
      .limit(10),
    supabase
      .from('tracks')
      .select('*, artist:artists(stage_name, genre, location, verified)')
      .eq('genre', track.genre)
      .eq('published', true)
      .neq('id', trackId)
      .neq('artist_id', track.artist_id)
      .order('play_count', { ascending: false })
      .limit(10),
  ])

  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from('artist_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('artist_id', track.artist_id)
      .single()
    isFollowing = !!follow
  }

  return NextResponse.json({
    artist: artistRes.data ? { ...artistRes.data, is_following: isFollowing } : null,
    moreByArtist: moreByArtistRes.data ?? [],
    related: relatedRes.data ?? [],
    lyrics: track.lyrics ?? null,
    producers: track.producers ?? [],
    featuredArtists: track.featured_artists ?? [],
  })
}

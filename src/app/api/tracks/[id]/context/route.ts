import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { matchFeaturedArtists } from '@/lib/api/artists'

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

  // ── Resolve featured-artist names against real Playback accounts ──
  // featured_artists is free-text (whatever the uploader typed), so we
  // match it against existing stage names case-insensitively. Anyone
  // matched gets tagged with a real profile link + Follow button;
  // anyone not matched (not on Playback, or a typo) shows as plain text.
  const featuredNames: string[] = track.featured_artists ?? []
  let matchedFeatured: any[] = []
  if (featuredNames.length > 0) {
    const matches = await matchFeaturedArtists(supabase, featuredNames)
    const matchIds = matches.map(m => m.id)

    let enriched: any[] = []
    if (matchIds.length) {
      const { data } = await supabase
        .from('artists')
        .select('id, stage_name, avatar_url, verified')
        .in('id', matchIds)
      enriched = data ?? []
    }

    let followedIds: string[] = []
    if (user && matchIds.length) {
      const { data: follows } = await supabase
        .from('artist_follows')
        .select('artist_id')
        .eq('user_id', user.id)
        .in('artist_id', matchIds)
      followedIds = (follows ?? []).map((f: any) => f.artist_id)
    }

    matchedFeatured = featuredNames.map(name => {
      const match = enriched.find((m: any) => m.stage_name.toLowerCase() === name.toLowerCase())
      return match
        ? { name: match.stage_name, artist_id: match.id, avatar_url: match.avatar_url, verified: match.verified, is_following: followedIds.includes(match.id) }
        : { name, artist_id: null }
    })
  }

  return NextResponse.json({
    artist: artistRes.data ? { ...artistRes.data, is_following: isFollowing } : null,
    moreByArtist: moreByArtistRes.data ?? [],
    related: relatedRes.data ?? [],
    lyrics: track.lyrics ?? null,
    producers: track.producers ?? [],
    featuredArtists: matchedFeatured,
  })
}

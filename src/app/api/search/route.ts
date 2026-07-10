import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json({ tracks: [], artists: [], albums: [] })
  }

  const supabase = await createClient() as any

  const [tracksRes, artistsRes, albumsRes] = await Promise.all([
    supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(id, stage_name, genre, location, verified)
      `)
      .eq('published', true)
      .eq('content_type', 'track')
      .ilike('title', `%${q}%`)
      .limit(20),
    supabase
      .from('artists')
      .select('*')
      .or(`stage_name.ilike.%${q}%,genre.ilike.%${q}%,location.ilike.%${q}%`)
      .limit(20),
    supabase
      .from('albums')
      .select('*, artist:artists(id, stage_name, genre, location, verified)')
      .eq('published', true)
      .ilike('title', `%${q}%`)
      .limit(20),
  ])

  // Also search tracks/albums by artist name (separate query since we
  // can't filter joined columns with ilike directly)
  const { data: artistMatches } = await supabase
    .from('artists')
    .select('id')
    .ilike('stage_name', `%${q}%`)

  let tracksByArtist: any[] = []
  let albumsByArtist: any[] = []
  if (artistMatches && artistMatches.length > 0) {
    const artistIds = artistMatches.map((a: any) => a.id)
    const [tracksData, albumsData] = await Promise.all([
      supabase
        .from('tracks')
        .select(`*, artist:artists(id, stage_name, genre, location, verified)`)
        .eq('published', true)
        .eq('content_type', 'track')
        .in('artist_id', artistIds)
        .limit(20),
      supabase
        .from('albums')
        .select('*, artist:artists(id, stage_name, genre, location, verified)')
        .eq('published', true)
        .in('artist_id', artistIds)
        .limit(20),
    ])
    tracksByArtist = tracksData.data ?? []
    albumsByArtist = albumsData.data ?? []
  }

  // Merge and dedupe
  const allTracks = [...(tracksRes.data ?? []), ...tracksByArtist]
  const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.id, t])).values())

  const allAlbums = [...(albumsRes.data ?? []), ...albumsByArtist]
  const uniqueAlbums = Array.from(new Map(allAlbums.map(a => [a.id, a])).values())

  return NextResponse.json({
    tracks: uniqueTracks,
    artists: artistsRes.data ?? [],
    albums: uniqueAlbums,
  })
}

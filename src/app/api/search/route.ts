import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json({ tracks: [], artists: [] })
  }

  const supabase = await createClient() as any

  const [tracksRes, artistsRes] = await Promise.all([
    supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(id, stage_name, genre, location, verified)
      `)
      .eq('published', true)
      .ilike('title', `%${q}%`)
      .limit(20),
    supabase
      .from('artists')
      .select('*')
      .or(`stage_name.ilike.%${q}%,genre.ilike.%${q}%,location.ilike.%${q}%`)
      .limit(20),
  ])

  // Also search tracks by artist name (separate query since we can't filter joined columns with ilike directly)
  const { data: artistMatches } = await supabase
    .from('artists')
    .select('id')
    .ilike('stage_name', `%${q}%`)

  let tracksByArtist: any[] = []
  if (artistMatches && artistMatches.length > 0) {
    const artistIds = artistMatches.map((a: any) => a.id)
    const { data } = await supabase
      .from('tracks')
      .select(`*, artist:artists(id, stage_name, genre, location, verified)`)
      .eq('published', true)
      .in('artist_id', artistIds)
      .limit(20)
    tracksByArtist = data ?? []
  }

  // Merge and dedupe tracks
  const allTracks = [...(tracksRes.data ?? []), ...tracksByArtist]
  const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.id, t])).values())

  return NextResponse.json({
    tracks: uniqueTracks,
    artists: artistsRes.data ?? [],
  })
}

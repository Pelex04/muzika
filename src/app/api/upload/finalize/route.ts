import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called AFTER the browser has already uploaded the audio (and optional
// cover) directly to Supabase Storage via the signed URL from
// /api/upload/signed-url. This route only ever receives small JSON --
// paths and text fields -- never the file itself, so it can never hit
// Vercel's serverless body-size limit no matter how large the track is.
export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { title, genre, audioPath, coverPath, albumId, producers, featuredArtists, lyrics, releaseDate } = await req.json() as {
    title: string
    genre: string
    audioPath: string
    coverPath?: string | null
    albumId?: string | null
    producers?: string[]
    featuredArtists?: string[]
    lyrics?: string | null
    releaseDate?: string | null
  }

  if (!title?.trim() || !genre || !audioPath) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isScheduled = !!(releaseDate && new Date(releaseDate) > new Date())

  let coverUrl: string | null = null
  if (coverPath) {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath)
    coverUrl = publicUrl
  }

  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .insert({
      artist_id: artist.id,
      title: title.trim(),
      genre,
      price_mwk: 0,
      audio_path: audioPath,
      cover_url: coverUrl,
      album_id: albumId ?? null,
      producers: producers ?? [],
      featured_artists: featuredArtists ?? [],
      lyrics: lyrics ?? null,
      release_date: releaseDate ?? null,
      is_scheduled: isScheduled,
      published: !isScheduled,
    })
    .select()
    .single()

  if (trackError) return NextResponse.json({ error: trackError.message }, { status: 500 })

  // Properly increment the artist's track count (previous version passed
  // an un-awaited RPC Promise object directly as the field value, which
  // would have silently corrupted this column)
  const { data: currentArtist } = await supabase
    .from('artists')
    .select('track_count')
    .eq('id', artist.id)
    .single()

  await supabase
    .from('artists')
    .update({ track_count: (currentArtist?.track_count ?? 0) + 1 })
    .eq('id', artist.id)

  return NextResponse.json({ track }, { status: 201 })
}

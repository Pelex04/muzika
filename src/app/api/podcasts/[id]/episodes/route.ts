import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: podcastId } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase
    .from('artists')
    .select('id, creator_type')
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Podcast creator profile required' }, { status: 403 })
  if (artist.creator_type !== 'podcast_creator') {
    return NextResponse.json({ error: 'Only podcast creators can upload episodes' }, { status: 403 })
  }

  // Confirm this artist actually owns the podcast show being added to
  const { data: podcast } = await supabase
    .from('podcasts')
    .select('id, artist_id, category')
    .eq('id', podcastId)
    .eq('artist_id', artist.id)
    .single()

  if (!podcast) return NextResponse.json({ error: 'Podcast not found or not yours' }, { status: 404 })

  const { title, description, audioPath, coverPath, episodeNumber, releaseDate } = await req.json() as {
    title: string
    description?: string | null
    audioPath: string
    coverPath?: string | null
    episodeNumber?: number | null
    releaseDate?: string | null
  }

  if (!title?.trim() || !audioPath) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isScheduled = !!(releaseDate && new Date(releaseDate) > new Date())

  let coverUrl: string | null = null
  if (coverPath) {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath)
    coverUrl = publicUrl
  }

  const { data: episode, error } = await supabase
    .from('tracks')
    .insert({
      artist_id: artist.id,
      podcast_id: podcastId,
      content_type: 'podcast_episode',
      title: title.trim(),
      lyrics: description?.trim() || null, // repurposed as episode show-notes -- tracks has no separate description column
      genre: podcast.category || 'Podcast',
      price_mwk: 0,
      audio_path: audioPath,
      cover_url: coverUrl,
      episode_number: episodeNumber ?? null,
      release_date: releaseDate ?? null,
      is_scheduled: isScheduled,
      published: !isScheduled,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ episode }, { status: 201 })
}

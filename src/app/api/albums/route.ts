import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = rateLimit(`album-create:${user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })

  const { data: artist } = await supabase
    .from('artists')
    .select('id, creator_type')
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })
  if (artist.creator_type === 'podcast_creator') {
    return NextResponse.json({ error: 'Podcast creators cannot create albums' }, { status: 403 })
  }

  const { title, genre, coverPath, releaseDate, releaseType } = await req.json() as {
    title: string
    genre: string
    coverPath?: string | null
    releaseDate?: string | null
    releaseType?: 'album' | 'ep'
  }

  if (!title?.trim() || !genre) {
    return NextResponse.json({ error: 'Album title and genre are required' }, { status: 400 })
  }

  const isScheduled = !!(releaseDate && new Date(releaseDate) > new Date())

  let coverUrl: string | null = null
  if (coverPath) {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath)
    coverUrl = publicUrl
  }

  const { data: album, error } = await supabase
    .from('albums')
    .insert({
      artist_id: artist.id,
      title: title.trim(),
      genre,
      cover_url: coverUrl,
      release_date: releaseDate ?? null,
      release_type: releaseType === 'ep' ? 'ep' : 'album',
      is_scheduled: isScheduled,
      published: !isScheduled,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ album }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const { searchParams } = new URL(req.url)
  const artistId = searchParams.get('artist_id')

  let query = supabase
    .from('albums')
    .select('*, artist:artists(stage_name, genre, location, verified)')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (artistId) query = query.eq('artist_id', artistId)

  const { data: albums, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ albums })
}

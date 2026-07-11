import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const { searchParams } = new URL(req.url)
  const artistId = searchParams.get('artist_id')

  let query = supabase
    .from('podcasts')
    .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url), episodes:tracks(count)')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (artistId) query = query.eq('artist_id', artistId)

  const { data: podcasts, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ podcasts })
}

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: 'Only podcast creators can create podcast shows. Artists cannot also be podcast creators.' }, { status: 403 })
  }

  const { title, description, coverPath, category } = await req.json() as {
    title: string
    description?: string | null
    coverPath?: string | null
    category?: string | null
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Podcast title is required' }, { status: 400 })
  }

  let coverUrl: string | null = null
  if (coverPath) {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath)
    coverUrl = publicUrl
  }

  const { data: podcast, error } = await supabase
    .from('podcasts')
    .insert({
      artist_id: artist.id,
      title: title.trim(),
      description: description?.trim() || null,
      cover_url: coverUrl,
      category: category ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ podcast }, { status: 201 })
}

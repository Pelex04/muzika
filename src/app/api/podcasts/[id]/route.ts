import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any

  const { data: podcast } = await supabase
    .from('podcasts')
    .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url)')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!podcast) return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })

  const { data: episodes } = await supabase
    .from('tracks')
    .select('*, artist:artists(stage_name, genre, location, verified)')
    .eq('podcast_id', id)
    .eq('published', true)
    .order('episode_number', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  return NextResponse.json({ podcast, episodes: episodes ?? [] })
}

// Artist deletes their own podcast show (and all its episodes)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()

  const { data: podcast } = await admin
    .from('podcasts')
    .select('id, artist_id, cover_url')
    .eq('id', id)
    .single()

  if (!podcast) return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })

  const { data: artist } = await admin
    .from('artists')
    .select('id')
    .eq('id', podcast.artist_id)
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: episodes } = await admin
    .from('tracks')
    .select('id, audio_path')
    .eq('podcast_id', id)

  const audioPaths = (episodes ?? []).map((e: any) => e.audio_path).filter(Boolean)
  if (audioPaths.length) await admin.storage.from('tracks').remove(audioPaths)

  if (podcast.cover_url) {
    try {
      const match = new URL(podcast.cover_url).pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await admin.storage.from('covers').remove([match[1]])
    } catch {}
  }

  if ((episodes ?? []).length) await admin.from('tracks').delete().eq('podcast_id', id)

  const { error } = await admin.from('podcasts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: true })
}

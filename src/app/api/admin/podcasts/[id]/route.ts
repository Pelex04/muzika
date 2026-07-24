import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction, getAdminClient } from '@/lib/admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const { reason } = await req.json().catch(() => ({ reason: undefined }))
  const db = getAdminClient()

  // Fetch podcast + all its episodes
  const { data: podcast } = await db
    .from('podcasts')
    .select('id, cover_url, artist_id, title')
    .eq('id', id)
    .single()

  if (!podcast) return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })

  const { data: episodes } = await db
    .from('tracks')
    .select('id, audio_path, cover_url')
    .eq('podcast_id', id)

  // Delete all episode audio files
  const audioPaths = (episodes ?? []).map((e: any) => e.audio_path).filter(Boolean)
  if (audioPaths.length) await db.storage.from('tracks').remove(audioPaths)

  // Delete podcast cover
  if (podcast.cover_url) {
    try {
      const match = new URL(podcast.cover_url).pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await db.storage.from('covers').remove([match[1]])
    } catch {}
  }

  // Delete all episode records (cascades to saves/purchases)
  if ((episodes ?? []).length) {
    await db.from('tracks').delete().eq('podcast_id', id)
  }

  // Delete podcast record
  const { error } = await db.from('podcasts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update artist track_count
  const { data: artist } = await db.from('artists').select('track_count').eq('id', podcast.artist_id).single()
  if (artist) {
    const removed = (episodes ?? []).length
    await db.from('artists').update({ track_count: Math.max(0, (artist.track_count ?? removed) - removed) }).eq('id', podcast.artist_id)
  }

  await logAdminAction(user.id, 'delete_podcast', id, 'podcast', reason)
  return NextResponse.json({ deleted: true })
}

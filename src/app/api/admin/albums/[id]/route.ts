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

  // Fetch album + all its tracks
  const { data: album } = await db
    .from('albums')
    .select('id, cover_url, artist_id, title')
    .eq('id', id)
    .single()

  if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 })

  const { data: tracks } = await db
    .from('tracks')
    .select('id, audio_path, cover_url')
    .eq('album_id', id)

  // Delete all track audio files
  const audioPaths = (tracks ?? []).map((t: any) => t.audio_path).filter(Boolean)
  if (audioPaths.length) await db.storage.from('tracks').remove(audioPaths)

  // Delete album cover
  if (album.cover_url) {
    try {
      const match = new URL(album.cover_url).pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await db.storage.from('covers').remove([match[1]])
    } catch {}
  }

  // Delete all track records (cascades to saves/purchases)
  if ((tracks ?? []).length) {
    await db.from('tracks').delete().eq('album_id', id)
  }

  // Delete album record
  const { error } = await db.from('albums').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update artist track_count
  const { data: artist } = await db.from('artists').select('track_count').eq('id', album.artist_id).single()
  if (artist) {
    const removed = (tracks ?? []).length
    await db.from('artists').update({ track_count: Math.max(0, (artist.track_count ?? removed) - removed) }).eq('id', album.artist_id)
  }

  await logAdminAction(user.id, 'delete_album', id, 'album', reason)
  return NextResponse.json({ deleted: true })
}

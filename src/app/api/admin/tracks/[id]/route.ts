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

  const { data: track } = await db
    .from('tracks')
    .select('audio_path, cover_url, artist_id, title')
    .eq('id', id)
    .single()

  if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  if (track.audio_path) await db.storage.from('tracks').remove([track.audio_path])
  if (track.cover_url) {
    try {
      const match = new URL(track.cover_url).pathname.match(/\/public\/covers\/(.+)$/)
      if (match) await db.storage.from('covers').remove([match[1]])
    } catch {}
  }

  const { error } = await db.from('tracks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Decrement track_count
  const { data: artist } = await db.from('artists').select('track_count').eq('id', track.artist_id).single()
  if (artist) await db.from('artists').update({ track_count: Math.max(0, (artist.track_count ?? 1) - 1) }).eq('id', track.artist_id)

  await logAdminAction(user.id, 'delete_track', id, 'track', reason)
  return NextResponse.json({ deleted: true })
}

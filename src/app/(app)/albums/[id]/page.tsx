import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import AlbumDetailClient from './AlbumDetailClient'

export const dynamic = 'force-dynamic'

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  // Use the admin client here (not the RLS-scoped one) because scheduled/
  // unpublished albums should still be viewable as a "coming soon" page --
  // just without their tracks exposed.
  const db = getAdminClient()
  const { data: album } = await db
    .from('albums')
    .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url)')
    .eq('id', id)
    .single()

  const isViewable = album && (album.published || (album.is_scheduled && album.release_date))
  if (!isViewable) notFound()

  // Tracks can release on their own schedule ahead of the album itself
  // (e.g. a single dropping before the full album) -- so fetch every track
  // regardless of the album's own publish state, in correct track_number
  // order, and only expose full metadata for the ones actually published.
  // Unpublished ones are stripped down to just their position, so nothing
  // about them (title, features, etc.) leaks before their own release_date.
  const { data: allTracks } = await db
    .from('tracks')
    .select('*, artist:artists(stage_name, genre, location, verified)')
    .eq('album_id', id)
    .order('track_number', { ascending: true })

  const tracks = (allTracks ?? []).map((t: any) =>
    t.published ? t : { id: t.id, track_number: t.track_number, published: false }
  )

  return (
    <AlbumDetailClient
      album={album}
      tracks={tracks ?? []}
      userId={user?.id ?? null}
      isScheduled={!album.published && !!album.is_scheduled}
    />
  )
}

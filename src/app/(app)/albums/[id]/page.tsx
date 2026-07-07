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

  // Only fetch tracks for albums that are actually published -- scheduled
  // album tracks must stay hidden until release, per the earlier fix.
  const tracks = album.published
    ? (await db
        .from('tracks')
        .select('*, artist:artists(stage_name, genre, location, verified)')
        .eq('album_id', id)
        .eq('published', true)
        .order('track_number', { ascending: true })
      ).data
    : []

  return (
    <AlbumDetailClient
      album={album}
      tracks={tracks ?? []}
      userId={user?.id ?? null}
      isScheduled={!album.published && !!album.is_scheduled}
    />
  )
}

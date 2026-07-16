import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioPodcastEpisodesClient from './StudioPodcastEpisodesClient'

export const dynamic = 'force-dynamic'

export default async function StudioPodcastEpisodesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()

  const { data: artist } = await db.from('artists').select('id, creator_type').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')

  const { data: podcast } = await db
    .from('podcasts')
    .select('id, title, cover_url, artist_id')
    .eq('id', id)
    .eq('artist_id', artist.id) // ownership check
    .single()

  if (!podcast) notFound()

  const { data: episodes } = await db
    .from('tracks')
    .select('id, title, cover_url, lyrics, episode_number, play_count, published, is_scheduled, release_date, created_at')
    .eq('podcast_id', id)
    .order('episode_number', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  return <StudioPodcastEpisodesClient podcast={podcast} episodes={episodes ?? []} />
}

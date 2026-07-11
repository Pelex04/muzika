import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioPodcastsClient from './StudioPodcastsClient'

export const dynamic = 'force-dynamic'

export default async function StudioPodcastsPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db.from('artists').select('id, creator_type').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')
  if (artist.creator_type !== 'podcast_creator') redirect('/studio/tracks')

  const { data: podcasts } = await db
    .from('podcasts')
    .select('id, title, description, cover_url, category, published, created_at, episodes:tracks(count)')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false })

  return <StudioPodcastsClient podcasts={podcasts ?? []} />
}

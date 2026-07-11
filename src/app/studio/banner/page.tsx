import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioBannerClient from './StudioBannerClient'

export default async function StudioBannerPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db.from('artists').select('id, creator_type').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')
  if (artist.creator_type === 'podcast_creator') redirect('/studio/podcasts')

  const { data: request } = await db.from('banner_requests').select('*').eq('artist_id', artist.id).single()

  return <StudioBannerClient bannerRequest={request ?? null} />
}

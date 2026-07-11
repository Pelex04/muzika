import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioAlbumsClient from './StudioAlbumsClient'

export const dynamic = 'force-dynamic'

export default async function StudioAlbumsPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db.from('artists').select('id, creator_type').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')
  if (artist.creator_type === 'podcast_creator') redirect('/studio/podcasts')

  const { data: albums } = await db
    .from('albums')
    .select('id, title, genre, cover_url, published, is_scheduled, release_date, created_at, tracks:tracks(count)')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false })

  return <StudioAlbumsClient albums={albums ?? []} />
}

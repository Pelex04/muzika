import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioScheduledClient from './StudioScheduledClient'

export default async function StudioScheduledPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db.from('artists').select('id').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')

  const [tracksRes, albumsRes] = await Promise.all([
    db.from('tracks').select('id, title, genre, cover_url, release_date, created_at').eq('artist_id', artist.id).eq('is_scheduled', true).order('release_date', { ascending: true }),
    db.from('albums').select('id, title, genre, cover_url, release_date, created_at').eq('artist_id', artist.id).eq('is_scheduled', true).order('release_date', { ascending: true }),
  ])

  return (
    <StudioScheduledClient
      scheduledTracks={tracksRes.data ?? []}
      scheduledAlbums={albumsRes.data ?? []}
    />
  )
}

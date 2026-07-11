import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioTracksClient from './StudioTracksClient'

export default async function StudioTracksPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db.from('artists').select('id, creator_type').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')
  if (artist.creator_type === 'podcast_creator') redirect('/studio/podcasts')

  const { data: tracks } = await db
    .from('tracks')
    .select('id, title, genre, cover_url, play_count, download_count, published, created_at, producers, featured_artists, lyrics')
    .eq('artist_id', artist.id)
    .eq('content_type', 'track')
    .eq('is_scheduled', false)
    .order('created_at', { ascending: false })

  return <StudioTracksClient tracks={tracks ?? []} artistId={artist.id} />
}

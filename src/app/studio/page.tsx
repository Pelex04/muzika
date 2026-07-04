import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioDashboardClient from './StudioDashboardClient'

export default async function StudioPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db
    .from('artists')
    .select('id, stage_name, avatar_url, track_count, follower_count, genre, location, bio, social_links')
    .eq('profile_id', user.id)
    .single()

  if (!artist) redirect('/become-artist')

  const [tracksRes, playsRes, followersRes, earningsRes] = await Promise.all([
    db.from('tracks').select('id, title, cover_url, play_count, download_count, created_at, genre').eq('artist_id', artist.id).eq('published', true).order('play_count', { ascending: false }).limit(5),
    db.from('tracks').select('play_count').eq('artist_id', artist.id).eq('published', true),
    db.from('artist_follows').select('id', { count: 'exact' }).eq('artist_id', artist.id),
    db.from('purchases').select('amount_mwk').eq('artist_id', artist.id).eq('payment_status', 'completed'),
  ])

  const totalPlays = (playsRes.data ?? []).reduce((s: number, t: any) => s + (t.play_count ?? 0), 0)
  const totalFollowers = followersRes.count ?? 0
  const totalEarnings = (earningsRes.data ?? []).reduce((s: number, p: any) => s + (p.amount_mwk ?? 0), 0)

  return (
    <StudioDashboardClient
      artist={artist}
      topTracks={tracksRes.data ?? []}
      stats={{ totalPlays, totalFollowers, totalEarnings, totalTracks: artist.track_count ?? 0 }}
    />
  )
}

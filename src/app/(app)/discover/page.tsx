import { createClient } from '@/lib/supabase/server'
import { getTracks } from '@/lib/api/tracks'
import { getArtists } from '@/lib/api/artists'
import DiscoverClient from './DiscoverClient'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tracks, artists, trendingTracks, popularTracks] = await Promise.all([
    getTracks({ limit: 12, orderBy: 'created_at' }),   // new releases
    getArtists({ limit: 12 }),
    getTracks({ limit: 7, orderBy: 'play_count' }),     // hero + now playing slider (up to 7)
    getTracks({ limit: 8, orderBy: 'play_count' }),     // trending now section
  ])

  let purchasedIds: string[] = []
  let savedIds: string[] = []
  let profile: any = null

  if (user) {
    const [purchasesRes, savedRes, profileRes] = await Promise.all([
      supabase.from('purchases').select('track_id').eq('user_id', user.id).eq('payment_status', 'completed'),
      supabase.from('saved_tracks').select('track_id').eq('user_id', user.id),
      supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single(),
    ])
    purchasedIds = (purchasesRes.data ?? []).map((p: any) => p.track_id)
    savedIds = (savedRes.data ?? []).map((s: any) => s.track_id)
    profile = profileRes.data
  }

  const withState = (ts: typeof tracks) => ts.map(t => ({
    ...t,
    is_purchased: purchasedIds.includes(t.id),
    is_saved: savedIds.includes(t.id),
  }))

  return (
    <DiscoverClient
      trendingTracks={withState(trendingTracks)}
      tracks={withState(tracks)}
      artists={artists}
      popularTracks={withState(popularTracks)}
      userId={user?.id ?? null}
      profile={profile}
    />
  )
}

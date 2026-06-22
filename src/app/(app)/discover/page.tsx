import { createClient } from '@/lib/supabase/server'
import { getTracks } from '@/lib/api/tracks'
import { getArtists } from '@/lib/api/artists'
import DiscoverClient from './DiscoverClient'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tracks, artists] = await Promise.all([
    getTracks({ limit: 8, orderBy: 'created_at' }),
    getArtists({ limit: 8 }),
  ])

  // Get top 3 trending tracks for the rotating hero banner
  const trendingTracks = await getTracks({ limit: 3, orderBy: 'play_count' })

  // Get purchased track IDs for this user
  let purchasedIds: string[] = []
  let savedIds: string[] = []
  if (user) {
    const [purchasesRes, savedRes] = await Promise.all([
      supabase.from('purchases').select('track_id').eq('user_id', user.id).eq('payment_status', 'completed'),
      supabase.from('saved_tracks').select('track_id').eq('user_id', user.id),
    ])
    purchasedIds = (purchasesRes.data ?? []).map((p: any) => p.track_id)
    savedIds = (savedRes.data ?? []).map((s: any) => s.track_id)
  }

  const tracksWithState = tracks.map(t => ({
    ...t,
    is_purchased: purchasedIds.includes(t.id),
    is_saved: savedIds.includes(t.id),
  }))

  return (
    <DiscoverClient
      trendingTracks={trendingTracks}
      tracks={tracksWithState}
      artists={artists}
      userId={user?.id ?? null}
    />
  )
}

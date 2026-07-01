import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import { getTracks } from '@/lib/api/tracks'
import { getArtists } from '@/lib/api/artists'
import DiscoverClient from './DiscoverClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover · Muzika',
  description: "Discover trending Malawian music, new releases, and featured artists — all in one place.",
}

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  const [tracks, artists, trendingTracks, popularTracks] = await Promise.all([
    getTracks({ limit: 12, orderBy: 'created_at' }),
    getArtists({ limit: 12 }),
    getTracks({ limit: 7, orderBy: 'play_count' }),
    getTracks({ limit: 8, orderBy: 'play_count' }),
  ])

  // Fetch active promotion — use admin client so RLS doesn't interfere
  const db = getAdminClient()
  const { data: promoRows } = await db
    .from('promotions')
    .select('*')
    .eq('published', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)

  const promotion = promoRows?.[0] ?? null

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
      promotion={promotion}
    />
  )
}

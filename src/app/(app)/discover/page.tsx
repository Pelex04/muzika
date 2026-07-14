import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import { getTracks } from '@/lib/api/tracks'
import { getArtists } from '@/lib/api/artists'
import DiscoverClient from './DiscoverClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover · Playback',
  description: 'Discover trending Malawian music, new releases, and featured artists — all in one place.',
}

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date().toISOString()
  const db = getAdminClient()

  const [tracks, artists, trendingTracks, popularTracks, podcastCreators, recentEpisodesRaw] = await Promise.all([
    getTracks({ limit: 12, orderBy: 'created_at' }),
    getArtists({ limit: 12 }),
    getTracks({ limit: 7, orderBy: 'play_count' }),
    getTracks({ limit: 8, orderBy: 'play_count' }),
    getArtists({ limit: 12, creatorType: 'podcast_creator' }),
    db
      .from('tracks')
      .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url)')
      .eq('published', true)
      .eq('content_type', 'podcast_episode')
      .order('created_at', { ascending: false })
      .limit(10),
  ])
  const recentEpisodes = (recentEpisodesRaw as any)?.data ?? []


  // Fetch active promotion
  const { data: promoRows } = await db
    .from('promotions')
    .select('*')
    .eq('published', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)

  const promotion = promoRows?.[0] ?? null

  // ── TOP ALBUMS — ranked by aggregate plays across their tracks ──
  const { data: topAlbumsRaw } = await db.rpc('get_top_albums', { limit_count: 10 })
  let topAlbums: any[] = []
  if (topAlbumsRaw?.length) {
    const albumIds = topAlbumsRaw.map((a: any) => a.id)
    const { data: albumsWithArtist } = await db
      .from('albums')
      .select('id, title, genre, cover_url, created_at, artist:artists(id, stage_name, avatar_url)')
      .in('id', albumIds)
    const byId = new Map((albumsWithArtist ?? []).map((a: any) => [a.id, a]))
    topAlbums = albumIds.map((id: string) => byId.get(id)).filter(Boolean)
  }

  // ── TOP PLAYLISTS — public playlists, ranked by track count ──
  const { data: playlistsRaw } = await db
    .from('playlists')
    .select('id, name, cover_url, description, owner:profiles(full_name, avatar_url), tracks:playlist_tracks(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(30)
  const topPlaylists = (playlistsRaw ?? [])
    .sort((a: any, b: any) => (b.tracks?.[0]?.count ?? 0) - (a.tracks?.[0]?.count ?? 0))
    .slice(0, 10)

  let purchasedIds: string[] = []
  let savedIds: string[] = []
  let profile: any = null
  let recommendedTracks: typeof tracks = []
  let continueListening: any[] = []
  let isCreator = false

  if (user) {
    const [purchasesRes, savedRes, profileRes, historyRes, artistCheckRes] = await Promise.all([
      supabase.from('purchases').select('track_id').eq('user_id', user.id).eq('payment_status', 'completed'),
      supabase.from('saved_tracks').select('track_id').eq('user_id', user.id),
      supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single(),
      db.from('listening_history')
        .select('last_played_at, track:tracks(*, artist:artists(id, stage_name, genre, location, verified, avatar_url))')
        .eq('user_id', user.id)
        .order('last_played_at', { ascending: false })
        .limit(10),
      supabase.from('artists').select('id').eq('profile_id', user.id).single(),
    ])
    purchasedIds = (purchasesRes.data ?? []).map((p: any) => p.track_id)
    savedIds    = (savedRes.data    ?? []).map((s: any) => s.track_id)
    profile     = profileRes.data
    continueListening = (historyRes.data ?? []).map((h: any) => h.track).filter(Boolean)
    isCreator = !!artistCheckRes.data

    // ── Real recommendations ─────────────────────────────────────────
    // Signal: genres of tracks the user has saved or purchased
    const interactedIds = [...new Set([...purchasedIds, ...savedIds])]

    if (interactedIds.length > 0) {
      const { data: interactedTracks } = await supabase
        .from('tracks')
        .select('genre')
        .in('id', interactedIds)

      // Count genre frequency
      const genreCounts: Record<string, number> = {}
      for (const t of (interactedTracks ?? []) as { genre: string }[]) {
        if (t.genre) genreCounts[t.genre] = (genreCounts[t.genre] ?? 0) + 1
      }

      // Top 2 genres by frequency
      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([g]) => g)

      if (topGenres.length > 0) {
        // Fetch popular tracks in those genres that the user hasn't touched
        const exclude = interactedIds.map(id => `'${id}'`).join(',')
        const { data: recs } = await db
          .from('tracks')
          .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url)')
          .eq('published', true)
          .eq('content_type', 'track')
          .in('genre', topGenres)
          .not('id', 'in', `(${exclude})`)
          .order('play_count', { ascending: false })
          .limit(10)

        recommendedTracks = recs ?? []
      }
    }

    // Fallback: if not enough recs, pad with popular tracks user hasn't saved
    if (recommendedTracks.length < 4) {
      const shown = new Set([...savedIds, ...purchasedIds, ...recommendedTracks.map(t => t.id)])
      const extras = popularTracks.filter(t => !shown.has(t.id))
      recommendedTracks = [...recommendedTracks, ...extras].slice(0, 10)
    }
  } else {
    // Logged out — popular tracks as recommendations
    recommendedTracks = popularTracks.slice(0, 10)
  }

  const withState = (ts: typeof tracks) => ts.map(t => ({
    ...t,
    is_purchased: purchasedIds.includes(t.id),
    is_saved:     savedIds.includes(t.id),
  }))

  return (
    <DiscoverClient
      trendingTracks={withState(trendingTracks)}
      tracks={withState(tracks)}
      artists={artists}
      podcastCreators={podcastCreators}
      recentEpisodes={withState(recentEpisodes)}
      popularTracks={withState(popularTracks)}
      recommendedTracks={withState(recommendedTracks)}
      continueListening={withState(continueListening)}
      topAlbums={topAlbums}
      topPlaylists={topPlaylists}
      userId={user?.id ?? null}
      profile={profile}
      promotion={promotion}
      isCreator={isCreator}
    />
  )
}

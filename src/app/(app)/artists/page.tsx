import { createClient } from '@/lib/supabase/server'
import { getArtists, getUserFollowedArtists } from '@/lib/api/artists'
import ArtistsClient from './ArtistsClient'

export default async function ArtistsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const artists = await getArtists({ limit: 50 })
  const followedIds = user ? await getUserFollowedArtists(user.id) : []

  const artistsWithState = artists.map(a => ({
    ...a,
    is_following: followedIds.includes(a.id),
  }))

  return <ArtistsClient artists={artistsWithState} userId={user?.id ?? null} />
}

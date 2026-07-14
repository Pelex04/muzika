import { createClient } from '@/lib/supabase/server'
import { getArtists, getUserFollowedArtists } from '@/lib/api/artists'
import ArtistsClient from './ArtistsClient'

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const isPodcast = type === 'podcast'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const artists = await getArtists({ limit: 50, creatorType: isPodcast ? 'podcast_creator' : 'artist' })
  const followedIds = user ? await getUserFollowedArtists(user.id) : []

  const artistsWithState = artists.map(a => ({
    ...a,
    is_following: followedIds.includes(a.id),
  }))

  return <ArtistsClient artists={artistsWithState} userId={user?.id ?? null} isPodcast={isPodcast} />
}

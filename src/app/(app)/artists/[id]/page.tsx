import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getArtistById, getArtistTracks } from '@/lib/api/artists'
import ArtistDetailClient from './ArtistDetailClient'

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const artist = await getArtistById(id)
  if (!artist) notFound()

  const tracks = await getArtistTracks(id)

  // Attach the artist back onto each track so TrackRow/TrackCard have
  // what they need for display (stage name, genre, location, verified)
  const tracksWithArtist = tracks.map(t => ({ ...t, artist }))

  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from('artist_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('artist_id', id)
      .single()
    isFollowing = !!follow
  }

  const { data: albums } = await supabase
    .from('albums')
    .select('*, tracks:tracks(count)')
    .eq('artist_id', id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <ArtistDetailClient
      artist={{ ...artist, is_following: isFollowing }}
      tracks={tracksWithArtist}
      albums={albums ?? []}
      userId={user?.id ?? null}
    />
  )
}

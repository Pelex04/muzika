import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getArtistById, getArtistTracks } from '@/lib/api/artists'
import ArtistDetailClient from './ArtistDetailClient'
import type { Metadata } from 'next'

const BASE_URL = 'https://muziqa.vercel.app'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const artist = await getArtistById(id)
  if (!artist) return { title: 'Artist not found' }

  const title = `${artist.stage_name} · Muzika`
  const description = artist.bio
    ? artist.bio.slice(0, 155)
    : `Stream and download music by ${artist.stage_name} on Muzika — Malawi's music platform.`
  const image = artist.avatar_url ?? `${BASE_URL}/og-default.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/artists/${id}`,
      images: [{ url: image, width: 800, height: 800, alt: artist.stage_name }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

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

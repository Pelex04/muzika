import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
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
  const title = `${artist.stage_name} · Playback`
  const description = artist.bio?.slice(0, 155) ?? (
    artist.creator_type === 'podcast_creator'
      ? `Listen to podcasts by ${artist.stage_name} on Playback.`
      : `Stream and download music by ${artist.stage_name} on Playback.`
  )
  const image = artist.avatar_url ?? `${BASE_URL}/og-default.png`
  return {
    title, description,
    openGraph: { title, description, url: `${BASE_URL}/artists/${id}`, images: [{ url: image, width: 800, height: 800, alt: artist.stage_name }], type: 'profile' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const artist = await getArtistById(id)
  if (!artist) notFound()

  const tracks = await getArtistTracks(id)
  const tracksWithArtist = tracks.map(t => ({ ...t, artist }))

  // Check if viewer is this artist
  const db = getAdminClient()
  const isOwnProfile = user
    ? !!(await supabase.from('artists').select('id').eq('id', id).eq('profile_id', user.id).single()).data
    : false

  let isFollowing = false
  if (user && !isOwnProfile) {
    const { data: follow } = await supabase.from('artist_follows').select('id').eq('user_id', user.id).eq('artist_id', id).single()
    isFollowing = !!follow
  }

  // Published albums (artists) or podcast shows (podcast creators)
  const isPodcastCreator = artist.creator_type === 'podcast_creator'
  let albums: any[] = []
  let podcasts: any[] = []
  if (isPodcastCreator) {
    const { data } = await supabase
      .from('podcasts')
      .select('*, episodes:tracks(count)')
      .eq('artist_id', id)
      .eq('published', true)
      .order('created_at', { ascending: false })
    podcasts = data ?? []
  } else {
    const { data } = await supabase
      .from('albums')
      .select('*, tracks:tracks(count)')
      .eq('artist_id', id)
      .eq('published', true)
      .order('created_at', { ascending: false })
    albums = data ?? []
  }

  // Scheduled releases (only visible to own artist)
  let scheduledTracks: any[] = []
  let scheduledAlbums: any[] = []
  let bannerRequest: any = null

  if (isOwnProfile) {
    const [stRes, saRes, brRes] = await Promise.all([
      db.from('tracks').select('id, title, cover_url, release_date, genre').eq('artist_id', id).eq('is_scheduled', true).order('release_date', { ascending: true }),
      db.from('albums').select('id, title, cover_url, release_date').eq('artist_id', id).eq('is_scheduled', true).order('release_date', { ascending: true }),
      db.from('banner_requests').select('*').eq('artist_id', id).single(),
    ])
    scheduledTracks = stRes.data ?? []
    scheduledAlbums = saRes.data ?? []
    bannerRequest = brRes.data ?? null
  }

  return (
    <ArtistDetailClient
      artist={{ ...artist, is_following: isFollowing }}
      tracks={tracksWithArtist}
      albums={albums}
      podcasts={podcasts}
      scheduledTracks={scheduledTracks}
      scheduledAlbums={scheduledAlbums}
      bannerRequest={bannerRequest}
      isOwnProfile={isOwnProfile}
      userId={user?.id ?? null}
    />
  )
}

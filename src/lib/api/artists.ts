import { createClient } from '@/lib/supabase/server'
import type { Artist, Track } from '@/types'

export async function getArtists({
  limit = 20,
  offset = 0,
}: { limit?: number; offset?: number } = {}): Promise<Artist[]> {
  const supabase = await createClient() as any
  const { data, error } = await supabase
    .from('artists')
    .select(`*, profile:profiles(full_name, email, avatar_url)`)
    .order('follower_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data as Artist[]) ?? []
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const supabase = await createClient() as any
  const { data, error } = await supabase
    .from('artists')
    .select(`*, profile:profiles(full_name, email, avatar_url)`)
    .eq('id', id)
    .single()

  if (error) return null
  return data as Artist
}

export async function getArtistTracks(artistId: string): Promise<Track[]> {
  const supabase = await createClient() as any
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artistId)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Track[]) ?? []
}

export async function getUserFollowedArtists(userId: string): Promise<string[]> {
  const supabase = await createClient() as any
  const { data } = await supabase
    .from('artist_follows')
    .select('artist_id')
    .eq('user_id', userId)

  return data?.map((f: any) => f.artist_id as string) ?? []
}

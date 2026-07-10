import { createClient } from '@/lib/supabase/server'
import type { Artist, Track } from '@/types'

/**
 * Matches free-text featured-artist names (whatever an uploader typed)
 * against real artist accounts by stage name, case-insensitive. Used both
 * to render "tagged" credits on Now Playing and to notify a matched
 * artist that they were credited. Any db client works (user-scoped or
 * admin) since this only reads the artists table.
 */
export async function matchFeaturedArtists(db: any, names: string[]): Promise<{ id: string; stage_name: string; profile_id: string }[]> {
  if (!names.length) return []
  const orFilter = names.map(n => `stage_name.ilike.${n.replace(/[,()]/g, '')}`).join(',')
  const { data } = await db.from('artists').select('id, stage_name, profile_id').or(orFilter)
  const nameSet = new Set(names.map(n => n.toLowerCase()))
  return (data ?? []).filter((a: any) => nameSet.has(a.stage_name.toLowerCase()))
}

export async function getArtists({
  limit = 20,
  offset = 0,
}: { limit?: number; offset?: number } = {}): Promise<Artist[]> {
  const supabase = await createClient() as any
  const { data, error } = await supabase
    .from('artists')
    .select(`*, profile:profiles(full_name, email, avatar_url)`)
    .order('verified', { ascending: false })
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
    .eq('content_type', 'track')
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

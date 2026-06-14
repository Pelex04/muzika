import { createClient } from '@/lib/supabase/server'
import type { Track } from '@/types'

export async function getTracks({
  genre,
  limit = 20,
  offset = 0,
  orderBy = 'play_count',
}: {
  genre?: string
  limit?: number
  offset?: number
  orderBy?: 'play_count' | 'created_at' | 'price_mwk'
} = {}): Promise<Track[]> {
  const supabase = await createClient() as any

  let query = supabase
    .from('tracks')
    .select(`
      *,
      artist:artists(
        id, stage_name, genre, location, verified, avatar_url,
        profile:profiles(full_name, avatar_url)
      )
    `)
    .eq('published', true)
    .order(orderBy, { ascending: false })
    .range(offset, offset + limit - 1)

  if (genre) query = query.eq('genre', genre)

  const { data, error } = await query
  if (error) throw error
  return (data as Track[]) ?? []
}

export async function getTrackById(id: string): Promise<Track | null> {
  const supabase = await createClient() as any
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      artist:artists(
        id, stage_name, genre, location, verified, avatar_url,
        profile:profiles(full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error) return null
  return data as Track
}

export async function getSignedAudioUrl(audioPath: string): Promise<string | null> {
  const supabase = await createClient() as any
  const { data, error } = await supabase
    .storage
    .from('tracks')
    .createSignedUrl(audioPath, 3600) // 1 hour

  if (error) return null
  return data.signedUrl
}

export async function incrementPlayCount(trackId: string) {
  const supabase = await createClient() as any
  await supabase.rpc('increment_play_count', { track_id: trackId })
}

export async function getUserPurchases(userId: string): Promise<string[]> {
  const supabase = await createClient() as any
  const { data } = await supabase
    .from('purchases')
    .select('track_id')
    .eq('user_id', userId)
    .eq('payment_status', 'completed')

  return data?.map((p: any) => p.track_id as string) ?? []
}

export async function getUserSavedTracks(userId: string): Promise<string[]> {
  const supabase = await createClient() as any
  const { data } = await supabase
    .from('saved_tracks')
    .select('track_id')
    .eq('user_id', userId)

  return data?.map((s: any) => s.track_id as string) ?? []
}

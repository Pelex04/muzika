import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LibraryClient from './LibraryClient'

export default async function LibraryPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: savedTracks } = await supabase
    .from('saved_tracks')
    .select('*, track:tracks(*, artist:artists(stage_name, genre, location, verified))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: playlists } = await supabase
    .from('playlists')
    .select('*, playlist_tracks(count)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const playlistsWithCount = (playlists ?? []).map((p: any) => ({
    ...p,
    track_count: p.playlist_tracks?.[0]?.count ?? 0,
  }))

  return (
    <LibraryClient
      savedTracks={(savedTracks ?? []).map((s: any) => s.track).filter(Boolean)}
      playlists={playlistsWithCount}
      userId={user.id}
    />
  )
}

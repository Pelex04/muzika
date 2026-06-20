import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PlaylistDetailClient from './PlaylistDetailClient'

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ playlistId: string }>
}) {
  const { playlistId } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: playlist } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single()

  if (!playlist) notFound()
  if (playlist.user_id !== user.id && !playlist.is_public) notFound()

  const { data: playlistTracks } = await supabase
    .from('playlist_tracks')
    .select(`
      id, position,
      track:tracks(*, artist:artists(stage_name, genre, location, verified))
    `)
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })

  const tracks = (playlistTracks ?? []).map((pt: any) => pt.track).filter(Boolean)
  const isOwner = playlist.user_id === user.id

  return <PlaylistDetailClient playlist={playlist} tracks={tracks} isOwner={isOwner} />
}

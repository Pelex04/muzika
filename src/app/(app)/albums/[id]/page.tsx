import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AlbumDetailClient from './AlbumDetailClient'

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: album } = await supabase
    .from('albums')
    .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url)')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!album) notFound()

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*, artist:artists(stage_name, genre, location, verified)')
    .eq('album_id', id)
    .eq('published', true)
    .order('track_number', { ascending: true })

  return (
    <AlbumDetailClient
      album={album}
      tracks={tracks ?? []}
      userId={user?.id ?? null}
    />
  )
}

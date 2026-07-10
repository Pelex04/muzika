import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import PodcastDetailClient from './PodcastDetailClient'

export const dynamic = 'force-dynamic'

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const db = getAdminClient()
  const { data: podcast } = await db
    .from('podcasts')
    .select('*, artist:artists(id, stage_name, genre, location, verified, avatar_url)')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!podcast) notFound()

  const { data: episodes } = await db
    .from('tracks')
    .select('*, artist:artists(stage_name, genre, location, verified)')
    .eq('podcast_id', id)
    .eq('published', true)
    .order('episode_number', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  return <PodcastDetailClient podcast={podcast} episodes={episodes ?? []} userId={user?.id ?? null} />
}

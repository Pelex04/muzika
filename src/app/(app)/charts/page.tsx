import { createClient } from '@/lib/supabase/server'
import { getTracks } from '@/lib/api/tracks'
import ChartsClient from './ChartsClient'

export default async function ChartsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tracks = await getTracks({ limit: 100, orderBy: 'play_count' })

  return <ChartsClient tracks={tracks} userId={user?.id ?? null} />
}

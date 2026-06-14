import { createClient } from '@/lib/supabase/server'
import { getTracks, getUserPurchases } from '@/lib/api/tracks'
import SongsClient from './SongsClient'

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>
}) {
  const { genre } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tracks = await getTracks({
    genre,
    limit: 50,
    orderBy: 'play_count',
  })

  const purchasedIds = user ? await getUserPurchases(user.id) : []
  const tracksWithState = tracks.map(t => ({
    ...t,
    is_purchased: purchasedIds.includes(t.id),
  }))

  return <SongsClient tracks={tracksWithState} userId={user?.id ?? null} activeGenre={genre} />
}

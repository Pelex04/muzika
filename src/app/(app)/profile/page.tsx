import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: artist } = await supabase
    .from('artists')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  let tracks: any[] = []
  let totalEarnings = 0
  let totalPlays = 0

  if (artist) {
    const { data: t } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', artist.id)
      .order('created_at', { ascending: false })

    tracks = t ?? []
    totalPlays = tracks.reduce((sum: number, t: any) => sum + (t.play_count || 0), 0)

    const { data: purchases } = await supabase
      .from('purchases')
      .select('artist_payout_mwk')
      .in('track_id', tracks.map((t: any) => t.id))
      .eq('payment_status', 'completed')

    totalEarnings = (purchases ?? []).reduce((sum: number, p: any) => sum + (p.artist_payout_mwk || 0), 0)
  }

  const { data: savedTracks } = await supabase
    .from('saved_tracks')
    .select('*, track:tracks(*, artist:artists(stage_name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, track:tracks(*, artist:artists(stage_name))')
    .eq('user_id', user.id)
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <ProfileClient
      profile={profile}
      artist={artist}
      tracks={tracks}
      totalEarnings={totalEarnings}
      totalPlays={totalPlays}
      savedTracks={savedTracks ?? []}
      purchases={purchases ?? []}
    />
  )
}

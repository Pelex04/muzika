import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioProfileClient from './StudioProfileClient'

export default async function StudioProfilePage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db
    .from('artists')
    .select('id, stage_name, genre, location, bio, avatar_url, social_links')
    .eq('profile_id', user.id)
    .single()

  if (!artist) redirect('/become-artist')

  const { data: profile } = await db.from('profiles').select('full_name, email, avatar_url').eq('id', user.id).single()

  return <StudioProfileClient artist={artist} profile={profile} />
}

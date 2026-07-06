import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioVerificationClient from './StudioVerificationClient'

export default async function StudioVerificationPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: artist } = await db.from('artists').select('id, verified, social_links').eq('profile_id', user.id).single()
  if (!artist) redirect('/become-artist')

  const { data: profile } = await db.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: request } = await db.from('verification_requests').select('*').eq('artist_id', artist.id).single()

  return (
    <StudioVerificationClient
      verificationRequest={request ?? null}
      verified={artist.verified ?? false}
      socialLinks={artist.social_links ?? {}}
      defaultLegalName={profile?.full_name ?? ''}
    />
  )
}

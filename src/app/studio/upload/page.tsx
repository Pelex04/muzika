import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadForm from '@/app/(app)/upload/UploadForm'

export default async function StudioUploadPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: artist } = await supabase
    .from('artists')
    .select('id, creator_type')
    .eq('profile_id', user.id)
    .single()

  if (!artist) redirect('/become-artist')

  const { data: podcasts } = await supabase
    .from('podcasts')
    .select('id, title, cover_url, category')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false })

  return <UploadForm existingPodcasts={podcasts ?? []} creatorType={artist.creator_type ?? 'artist'} />
}

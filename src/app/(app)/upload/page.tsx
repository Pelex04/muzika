import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadForm from './UploadForm'

// Only artists can upload tracks. This check now happens server-side,
// BEFORE the page renders anything -- the old version was a client
// component that painted the full upload UI first, then ran an async
// check afterwards and redirected once it resolved, causing a visible
// flash of the upload form for listeners before bouncing them to
// /become-artist. Checking here means a listener never sees the
// upload UI at all.
export default async function UploadPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!artist) redirect('/become-artist')

  return <UploadForm />
}

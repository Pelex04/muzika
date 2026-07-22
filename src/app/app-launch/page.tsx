import { createClient } from '@/lib/supabase/server'
import AppLaunchSplash from './AppLaunchSplash'

// This is the PWA manifest's start_url -- it's what opens whenever someone
// launches the installed app from their home screen. It never appears for
// regular browser visitors (they still land on /landing via / as before).
// Session state is resolved here on the server so the splash never has to
// wait on or flash based on a client-side auth check.
export const dynamic = 'force-dynamic'

export default async function AppLaunchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <AppLaunchSplash hasSession={!!user} />
}

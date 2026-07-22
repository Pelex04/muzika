import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import MiniPlayer from '@/components/player/MiniPlayer'
import BottomTabs from '@/components/layout/BottomTabs'
import InstallPWABanner from '@/components/pwa/InstallPWABanner'
import ScrollRestoration from '@/components/layout/ScrollRestoration'
import { ProfileProvider } from '@/lib/profile-context'
import StudioSwitcher from '@/components/layout/StudioSwitcher'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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
    .select('avatar_url, id')
    .eq('profile_id', user.id)
    .single()

  const isArtist = !!(artist?.id)
  const avatarUrl = profile?.avatar_url ?? artist?.avatar_url ?? null
  const avatarInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <ProfileProvider avatarUrl={avatarUrl} avatarInitial={avatarInitial}>
      <ScrollRestoration />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#121212' }}>
        <style>{`
          .muzika-main { padding-bottom: 76px; }
          @media (max-width: 768px) { .muzika-main { padding-bottom: 138px; } }
          /* MiniPlayer hides itself on /now-playing, but BottomTabs doesn't --
             only drop MiniPlayer's share of the reserved space (76px desktop,
             the same 76px out of 138px on mobile), not the BottomTabs part. */
          .muzika-main.now-playing-route { padding-bottom: 0 !important; }
          @media (max-width: 768px) {
            .muzika-main.now-playing-route { padding-bottom: 62px !important; }
          }
        `}</style>
        <Sidebar profile={profile} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <main className="muzika-main" style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
          <MiniPlayer />
        </div>
        <InstallPWABanner />
        <BottomTabs />
        {isArtist && <StudioSwitcher />}
      </div>
    </ProfileProvider>
  )
}

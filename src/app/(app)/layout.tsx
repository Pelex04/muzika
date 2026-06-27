import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import MiniPlayer from '@/components/player/MiniPlayer'
import BottomTabs from '@/components/layout/BottomTabs'
import { ProfileProvider } from '@/lib/profile-context'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const avatarUrl = profile?.avatar_url ?? null
  const avatarInitial = profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <ProfileProvider avatarUrl={avatarUrl} avatarInitial={avatarInitial}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#121212' }}>
        <style>{`
          .muzika-main { padding-bottom: 76px; }
          @media (max-width: 768px) { .muzika-main { padding-bottom: 138px; } }
        `}</style>
        <Sidebar profile={profile} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <main className="muzika-main" style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
          <MiniPlayer />
        </div>
        <BottomTabs />
      </div>
    </ProfileProvider>
  )
}

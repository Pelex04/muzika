import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import MiniPlayer from '@/components/player/MiniPlayer'
import BottomTabs from '@/components/layout/BottomTabs'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F6FB' }}>
      <Sidebar profile={profile} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '76px' }}>
          {children}
        </main>
        <MiniPlayer />
      </div>
      <BottomTabs />
    </div>
  )
}

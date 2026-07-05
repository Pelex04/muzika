import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import StudioNav from './StudioNav'

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // Must be an artist
  const db = getAdminClient()
  const { data: artist } = await db
    .from('artists')
    .select('id, stage_name, avatar_url, track_count, follower_count')
    .eq('profile_id', user.id)
    .single()

  if (!artist) redirect('/become-artist')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d0d0d', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .studio-main { scrollbar-width: thin; scrollbar-color: #2a2a2a transparent; }
        .studio-main::-webkit-scrollbar { width: 4px; }
        .studio-main::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        @media (max-width: 768px) { .studio-main { padding-bottom: 80px; } }
      `}</style>
      <StudioNav artist={artist} />
      <main className="studio-main" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // Hard server-side check — service role, cannot be spoofed
  const db = getAdminClient()
  const { data: profile } = await db
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/discover')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{
        height: '56px', background: '#111', borderBottom: '1px solid #1f1f1f',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 900, color: '#fff',
          }}>M</div>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>
            Muzika <span style={{ color: '#2563eb' }}>Admin</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#717171' }}>{profile.email}</span>
          <a href="/discover" style={{
            fontSize: '13px', color: '#60a5fa', textDecoration: 'none', fontWeight: 600,
          }}>← Back to App</a>
        </div>
      </div>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </div>
    </div>
  )
}

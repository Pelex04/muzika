import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import SignOutButton from './SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const db = getAdminClient()
  const { data: profile } = await db
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/discover')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .admin-topbar {
          height: 52px; background: #111; border-bottom: 1px solid #1f1f1f;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px; position: sticky; top: 0; z-index: 50;
        }
        .admin-topbar-brand { display: flex; align-items: center; gap: 8px; }
        .admin-topbar-brand-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .admin-topbar-title { font-weight: 800; font-size: 14px; letter-spacing: -0.3px; }
        .admin-topbar-right { display: flex; align-items: center; gap: 8px; }
        .admin-topbar-email { font-size: 12px; color: #555; display: none; }
        @media (min-width: 640px) { .admin-topbar-email { display: block; } }
        .admin-signout {
          font-size: 13px; color: #717171; background: none; border: none;
          cursor: pointer; font-family: inherit; font-weight: 600; padding: 0;
        }
        .admin-signout:hover { color: #ef4444; }
        .admin-subnav { display: flex; gap: 2px; padding: 0 16px; border-bottom: 1px solid #1a1a1a; overflow-x: auto; scrollbar-width: none; }
        .admin-subnav::-webkit-scrollbar { display: none; }
        .admin-subnav-link { font-size: 13px; font-weight: 600; color: #555; text-decoration: none; padding: 10px 12px; white-space: nowrap; border-bottom: 2px solid transparent; transition: color .15s; display: block; }
        .admin-subnav-link:hover { color: #b3b3b3; }
        .admin-content { max-width: 1100px; margin: 0 auto; padding: 20px 14px 40px; }
        @media (min-width: 640px) { .admin-content { padding: 28px 24px 60px; } }
        @media (min-width: 1024px) { .admin-content { padding: 32px 24px 60px; } }
      `}</style>

      <div className="admin-topbar">
        <div className="admin-topbar-brand">
          <div className="admin-topbar-brand-icon">M</div>
          <span className="admin-topbar-title">
            Muzika <span style={{ color: '#2563eb' }}>Admin</span>
          </span>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-topbar-email">{profile.email}</span>
          <a href="/discover" style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>← App</a>
          <SignOutButton />
        </div>
      </div>

      {/* Secondary nav */}
      <div className="admin-subnav">
        <a href="/admin" className="admin-subnav-link">Dashboard</a>
        <a href="/admin/promotions" className="admin-subnav-link">Promotions</a>
        <a href="/blog/new" className="admin-subnav-link">Write Post</a>
      </div>

      <div className="admin-content">
        {children}
      </div>
    </div>
  )
}

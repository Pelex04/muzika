'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Upload, Music2, Disc3, Calendar, Megaphone, UserCircle, LogOut, Headphones } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/studio',              label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/studio/upload',       label: 'Upload',     icon: Upload },
  { href: '/studio/tracks',       label: 'My Tracks',  icon: Music2 },
  { href: '/studio/albums',       label: 'My Albums',  icon: Disc3 },
  { href: '/studio/scheduled',    label: 'Scheduled',  icon: Calendar },
  { href: '/studio/banner',       label: 'Banner',     icon: Megaphone },
  { href: '/studio/profile',      label: 'My Profile', icon: UserCircle },
]

interface Props {
  artist: { id: string; stage_name: string; avatar_url: string | null; track_count: number; follower_count: number }
}

export default function StudioNav({ artist }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/signin')
  }

  return (
    <>
      <style>{`
        .studio-sidebar { display: flex; flex-direction: column; width: 220px; min-width: 220px; background: #111; border-right: 1px solid #1f1f1f; padding: 0; overflow-y: auto; }
        @media (max-width: 768px) { .studio-sidebar { display: none; } }
        .studio-mobile-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 300; height: 62px; background: #111; border-top: 1px solid #1f1f1f; }
        @media (max-width: 768px) { .studio-mobile-bar { display: grid; grid-template-columns: repeat(5, 1fr); } }
        .snav-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; margin: 1px 8px; font-size: 13.5px; font-weight: 500; text-decoration: none; transition: all .15s; color: rgba(255,255,255,0.45); }
        .snav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
        .snav-item.active { color: #fff; background: rgba(37,99,235,0.15); }
        .snav-item.active svg { color: #60a5fa; }
      `}</style>

      {/* Desktop sidebar */}
      <div className="studio-sidebar">
        {/* Brand */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>M</div>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff', letterSpacing: '-0.3px' }}>Studio</span>
          </div>
          {/* Artist card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#1a2f5e', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
              {artist.avatar_url
                ? <img src={artist.avatar_url} alt={artist.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{artist.stage_name.charAt(0)}</span>
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist.stage_name}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>{artist.track_count ?? 0} tracks · {artist.follower_count ?? 0} followers</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href} className={cn('snav-item', isActive(href, exact) && 'active')}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link href="/discover" className="snav-item" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <Headphones size={15} />
            Switch to Listener
          </Link>
          <button onClick={signOut} className="snav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontFamily: 'inherit' }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="studio-mobile-bar">
        {[
          { href: '/studio',           icon: LayoutDashboard, label: 'Dash',    exact: true },
          { href: '/studio/upload',    icon: Upload,          label: 'Upload' },
          { href: '/studio/tracks',    icon: Music2,          label: 'Tracks' },
          { href: '/studio/albums',    icon: Disc3,           label: 'Albums' },
          { href: '/studio/profile',   icon: UserCircle,      label: 'Profile' },
        ].map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '3px', textDecoration: 'none',
              fontSize: '10px', fontWeight: 600,
              color: active ? '#fff' : '#555',
            }}>
              <Icon size={19} />
              {label}
            </Link>
          )
        })}
      </div>
    </>
  )
}

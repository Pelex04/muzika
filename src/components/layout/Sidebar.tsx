'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Music, BarChart2, Users, Newspaper, Upload, Play, Music2, LogOut, BookOpen, Search, Disc3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const NAV = [
  { href: '/discover', label: 'Home',        icon: Home },
  { href: '/search',   label: 'Search',      icon: Search },
  { href: '/songs',    label: 'Songs',       icon: Music },
  { href: '/albums',   label: 'Albums',      icon: Disc3 },
  { href: '/charts',   label: 'Charts',      icon: BarChart2 },
  { href: '/library',  label: 'Library',     icon: BookOpen },
  { href: '/artists',  label: 'Artists',     icon: Users },
  { href: '/blog',     label: 'Blog & News', icon: Newspaper },
]

const ARTIST_NAV = [
  { href: '/upload',      label: 'Upload Track', icon: Upload },
  { href: '/now-playing', label: 'Now Playing',  icon: Play },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const navItem = (href: string, label: string, Icon: any) => (
    <Link
      key={href}
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '11px',
        padding: '9px 12px', borderRadius: '8px', marginBottom: '1px',
        fontSize: '13.5px', fontWeight: 500, textDecoration: 'none',
        background: isActive(href) ? 'rgba(59,130,246,0.2)' : 'transparent',
        color: isActive(href) ? '#fff' : 'rgba(255,255,255,0.5)',
        transition: 'all .15s',
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, color: isActive(href) ? '#60A5FA' : 'inherit' }} />
      {label}
    </Link>
  )

  return (
    <>
      <style>{`
        .muzika-sidebar { display: flex; }
        @media (max-width: 768px) { .muzika-sidebar { display: none !important; } }
      `}</style>
      <aside className="muzika-sidebar" style={{
        width: '228px', background: '#0D1B3E',
        flexDirection: 'column', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>

        {/* Logo */}
        <Link href="/discover" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '26px 22px 22px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#3B82F6,#1d4ed8)', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(59,130,246,.35)', flexShrink: 0 }}>
            <Music2 size={18} color="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            MUZI<span style={{ color: '#60A5FA' }}>KA</span>
          </span>
        </Link>

        {/* Main nav */}
        <nav style={{ flex: 1, padding: '0 10px 16px', overflowY: 'auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.1px', color: 'rgba(255,255,255,0.28)', padding: '16px 12px 7px', textTransform: 'uppercase' }}>Menu</p>
          {NAV.map(({ href, label, icon }) => navItem(href, label, icon))}

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.1px', color: 'rgba(255,255,255,0.28)', padding: '20px 12px 7px', textTransform: 'uppercase' }}>Artist</p>
          {profile?.role === 'artist' || profile?.role === 'admin' ? (
            <Link
              href="/studio"
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '9px 12px', borderRadius: '8px', marginBottom: '1px',
                fontSize: '13.5px', fontWeight: 600, textDecoration: 'none',
                background: 'rgba(37,99,235,0.12)',
                color: '#60a5fa', transition: 'all .15s',
              }}
            >
              <Music2 size={16} style={{ flexShrink: 0 }} />
              Switch to Studio
            </Link>
          ) : (
            navItem('/become-artist', 'Become an Artist', Upload)
          )}
        </nav>

        {/* User row */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px' }}>
            <Link href="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1C2E55', display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700 }}>
                      {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                }
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile?.full_name ?? 'User'}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                  {profile?.role ?? 'listener'}
                </p>
              </div>
            </Link>
            <button
              onClick={signOut}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            >
              <LogOut size={15} color="rgba(255,255,255,0.4)" />
            </button>
          </div>
        </div>

      </aside>
    </>
  )
}

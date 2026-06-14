'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Music, BarChart2, Users, FileText, Upload, Play, Music2, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/discover',     label: 'Home',        icon: Home },
  { href: '/songs',        label: 'Songs',       icon: Music },
  { href: '/charts',       label: 'Charts',      icon: BarChart2 },
  { href: '/artists',      label: 'Artists',     icon: Users },
  { href: '/blog',         label: 'Blog & News', icon: FileText },
]

const ARTIST_NAV = [
  { href: '/upload',       label: 'Upload Track', icon: Upload },
  { href: '/now-playing',  label: 'Now Playing',  icon: Play },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <>
      <style>{`
        .muzika-sidebar { display: flex; }
        @media (max-width: 768px) { .muzika-sidebar { display: none !important; } }
      `}</style>
      <aside className="muzika-sidebar" style={{ width: '228px', background: '#0D1B3E', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Logo */}
      <Link href="/discover" className="flex items-center gap-2.5 px-5 py-6 pb-5">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-blue-500 to-blue-700 grid place-items-center shadow-md">
          <Music2 className="w-[18px] h-[18px] text-white" />
        </div>
        <span className="text-[18px] font-black text-white tracking-tight">
          MUZI<span className="text-blue-400">KA</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2.5 pb-4">
        <p className="text-[10px] font-bold text-white/28 uppercase tracking-[1.1px] px-3 pt-4 pb-1.5">Menu</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all mb-0.5',
                active
                  ? 'bg-blue-500/20 text-white'
                  : 'text-white/50 hover:bg-white/6 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-blue-400')} />
              {label}
            </Link>
          )
        })}

        <p className="text-[10px] font-bold text-white/28 uppercase tracking-[1.1px] px-3 pt-5 pb-1.5">Artist</p>
        {ARTIST_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all mb-0.5',
                active
                  ? 'bg-blue-500/20 text-white'
                  : 'text-white/50 hover:bg-white/6 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-blue-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3.5 border-t border-white/7">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/6 cursor-pointer group">
          <div className="w-[34px] h-[34px] rounded-full bg-[#1C2E55] grid place-items-center flex-shrink-0">
            <span className="text-white/50 text-sm font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-[11px] text-white/40 capitalize">{profile?.role ?? 'listener'}</p>
          </div>
          <button onClick={signOut} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4 text-white/40 hover:text-white/70" />
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}
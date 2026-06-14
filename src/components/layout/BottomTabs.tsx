'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/discover', label: 'Home',    icon: Home },
  { href: '/songs',    label: 'Search',  icon: Search },
  { href: '/artists',  label: 'Library', icon: BookOpen },
  { href: '/profile',  label: 'Profile', icon: User },
]

export default function BottomTabs() {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .muzika-bottom-tabs { display: none; }
        @media (max-width: 768px) { .muzika-bottom-tabs { display: grid; } }
      `}</style>
      <div className="muzika-bottom-tabs" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        height: '62px', background: '#fff',
        borderTop: '1.5px solid #E2E5F0',
        gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
              active ? 'text-[#0D1B3E]' : 'text-[#8B95A8]'
            )}
          >
            <Icon className="w-[22px] h-[22px]" />
            {label}
          </Link>
        )
      })}
      </div>
    </>
  )
}

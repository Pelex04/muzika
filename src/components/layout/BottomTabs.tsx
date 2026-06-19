'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Music, BarChart2, Newspaper } from 'lucide-react'

const TABS = [
  { href: '/discover', label: 'Home',   icon: Home },
  { href: '/songs',    label: 'Songs',  icon: Music },
  { href: '/charts',   label: 'Charts', icon: BarChart2 },
  { href: '/blog',     label: 'Blog',   icon: Newspaper },
]

export default function BottomTabs() {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .muzika-bottom-tabs { display: none; }
        @media (max-width: 768px) { .muzika-bottom-tabs { display: grid; } }
      `}</style>
      <div
        className="muzika-bottom-tabs"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
          height: '62px', background: '#fff',
          borderTop: '1.5px solid #E2E5F0',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', textDecoration: 'none',
                fontSize: '11px', fontWeight: 600,
                color: active ? '#0D1B3E' : '#8B95A8',
                transition: 'color .15s',
              }}
            >
              <Icon size={22} />
              {label}
            </Link>
          )
        })}
      </div>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Music, Disc3, BookOpen } from 'lucide-react'

const TABS = [
  { href: '/discover', label: 'Home',    icon: Home },
  { href: '/search',   label: 'Search',  icon: Search },
  { href: '/songs',    label: 'Songs',   icon: Music },
  { href: '/albums',   label: 'Albums',  icon: Disc3 },
  { href: '/library',  label: 'Library', icon: BookOpen },
]

export default function BottomTabs() {
  const pathname = usePathname()

  // Footer taps can fire before the debounced scroll-save in
  // ScrollRestoration has had a chance to run (e.g. tapping right after
  // scrolling, or without scrolling again first). Flush the current
  // position for the page we're leaving synchronously on click, using the
  // same sessionStorage key ScrollRestoration reads from, so it's always
  // accurate by the time we come back to this page.
  const flushScrollPosition = () => {
    const main = document.querySelector('.muzika-main') as HTMLElement | null
    if (!main) return
    sessionStorage.setItem(`scrollpos:${pathname}`, String(main.scrollTop))
  }

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
          height: '62px', background: '#121212',
          borderTop: '1.5px solid #2a2a2a',
          gridTemplateColumns: 'repeat(5, 1fr)',
        }}
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={flushScrollPosition}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', textDecoration: 'none',
                fontSize: '10.5px', fontWeight: 600,
                color: active ? '#ffffff' : '#717171',
                transition: 'color .15s',
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </div>
    </>
  )
}

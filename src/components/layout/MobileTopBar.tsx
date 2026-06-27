'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  eyebrow: string
  title: string
  rightSlot?: React.ReactNode
  avatarUrl?: string | null
  avatarInitial?: string
}

export default function MobileTopBar({ eyebrow, title, rightSlot, avatarUrl, avatarInitial }: Props) {
  const pathname = usePathname()
  const onSearchPage = pathname === '/search'

  return (
    <div
      className="md:hidden"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: '#121212',
        borderBottom: '1px solid #2a2a2a',
        position: 'sticky', top: 0, zIndex: 50,
      }}
    >
      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.7px' }}>
          {eyebrow}
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px' }}>
          {title}
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {rightSlot}
        {!onSearchPage && (
          <Link
            href="/search"
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#181818', display: 'grid', placeItems: 'center',
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
        )}
        <Link
          href="/profile"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#0D1B3E', display: 'grid', placeItems: 'center',
            textDecoration: 'none', flexShrink: 0, overflow: 'hidden',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : avatarInitial ? (
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: 700 }}>
              {avatarInitial}
            </span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
        </Link>
      </div>
    </div>
  )
}

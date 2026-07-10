'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfile } from '@/lib/profile-context'
import NotificationBell from './NotificationBell'

interface Props {
  eyebrow: string
  title: string
  rightSlot?: React.ReactNode
}

export default function MobileTopBar({ eyebrow, title, rightSlot }: Props) {
  const pathname = usePathname()
  const onSearchPage = pathname === '/search'
  const { avatarUrl, avatarInitial } = useProfile()

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
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '.7px' }}>
          {eyebrow}
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px' }}>
          {title}
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {rightSlot}
        <NotificationBell size={36} />
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
            <img
              src={avatarUrl}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: 700 }}>
              {avatarInitial}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}

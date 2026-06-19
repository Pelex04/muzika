'use client'

import Link from 'next/link'

interface Props {
  eyebrow: string
  title: string
  rightSlot?: React.ReactNode  // optional extra button (e.g. Write, Filter) shown left of avatar
}

export default function MobileTopBar({ eyebrow, title, rightSlot }: Props) {
  return (
    <div
      className="md:hidden"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: '#fff',
        borderBottom: '1px solid #E2E5F0',
        position: 'sticky', top: 0, zIndex: 50,
      }}
    >
      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.7px' }}>
          {eyebrow}
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B3E', letterSpacing: '-0.4px' }}>
          {title}
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {rightSlot}
        <Link
          href="/profile"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#0D1B3E', display: 'grid', placeItems: 'center',
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

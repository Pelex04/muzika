'use client'

import Link from 'next/link'
import { Music2 } from 'lucide-react'

interface Props {
  headline: React.ReactNode
  sub: string
  footer?: React.ReactNode
}

// Real concert photography (Unsplash License — free for commercial use,
// no attribution required) instead of generated/abstract artwork.
// Photo: blue-lit stage, crowd silhouettes — chosen to match Playback's
// navy/blue palette rather than a generic warm-toned festival shot.
const PHOTO_URL = 'https://images.unsplash.com/photo-1546707012-c46675f12716?auto=format&fit=crop&w=1400&q=80'

export default function AuthVisualPanel({ headline, sub, footer }: Props) {
  return (
    <>
      {/* Background photo */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${PHOTO_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }}
      />

      {/* Navy gradient overlay for legibility + brand tint */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(180deg,
              rgba(8,15,36,0.88) 0%,
              rgba(13,27,62,0.65) 28%,
              rgba(13,27,62,0.55) 55%,
              rgba(8,15,36,0.92) 100%
            )`,
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(13,27,62,0.35) 0%, rgba(37,99,235,0.18) 50%, rgba(8,15,36,0.45) 100%)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', padding: '44px', boxSizing: 'border-box' }}>
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#1d4ed8)', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(59,130,246,.4)' }}>
            <Music2 size={18} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-.4px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
            PLAY<span style={{ color: '#60A5FA' }}>BACK</span>
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-1.6px', lineHeight: 1.12, marginBottom: '14px', textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}>
            {headline}
          </h2>
          <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.7)', lineHeight: 1.65, marginBottom: footer ? '24px' : 0, textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
            {sub}
          </p>
          {footer}
        </div>
      </div>
    </>
  )
}

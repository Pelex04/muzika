'use client'

import Link from 'next/link'
import { Music2 } from 'lucide-react'

// Genre-based gradients + sunburst pattern reused from the rest of the app
// (Now Playing, Discover hero, blog covers) so the auth screens feel like
// part of the same product rather than a bolted-on template.
const CARDS = [
  { from: '#065f46', to: '#022c22', stroke: '#34d399', rotate: -9, x: -64, y: 18,  z: 1, size: 150 },
  { from: '#1e3a8a', to: '#0d1b3e', stroke: '#60a5fa', rotate: 6,  x: 58,  y: -28, z: 3, size: 190 },
  { from: '#7f1d1d', to: '#450a0a', stroke: '#fca5a5', rotate: -4, x: 78,  y: 96,  z: 2, size: 140 },
]

function AlbumCard({ from, to, stroke, rotate, x, y, z, size, delay }: typeof CARDS[number] & { delay: number }) {
  const gradId = `auth-card-grad-${stroke.replace('#', '')}`
  return (
    <div
      style={{
        position: 'absolute',
        width: size, height: size,
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        zIndex: z,
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        animation: `floatCard${z} 7s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill={`url(#${gradId})`} />
        <g stroke={stroke} strokeWidth="1.4" opacity="0.55">
          <line x1="100" y1="0" x2="20" y2="200" />
          <line x1="100" y1="0" x2="55" y2="200" />
          <line x1="100" y1="0" x2="100" y2="200" />
          <line x1="100" y1="0" x2="145" y2="200" />
          <line x1="100" y1="0" x2="180" y2="200" />
        </g>
        <circle cx="100" cy="80" r="26" fill={stroke} opacity="0.18" />
      </svg>
      <style>{`
        @keyframes floatCard${z} {
          0%, 100% { transform: translate(-50%, -50%) rotate(${rotate}deg) translateY(0px); }
          50%      { transform: translate(-50%, -50%) rotate(${rotate}deg) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

interface Props {
  headline: React.ReactNode
  sub: string
  footer?: React.ReactNode
}

export default function AuthVisualPanel({ headline, sub, footer }: Props) {
  return (
    <>
      <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#1d4ed8)', display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(59,130,246,.4)' }}>
          <Music2 size={18} color="white" />
        </div>
        <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-.4px' }}>
          MUZI<span style={{ color: '#60A5FA' }}>KA</span>
        </span>
      </Link>

      {/* Floating album card scene */}
      <div style={{ position: 'relative', flex: 1, minHeight: '220px', margin: '12px 0' }}>
        {CARDS.map((c, i) => (
          <AlbumCard key={i} {...c} delay={i * 0.6} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-1.6px', lineHeight: 1.12, marginBottom: '14px' }}>
          {headline}
        </h2>
        <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.55)', lineHeight: 1.65, marginBottom: footer ? '24px' : 0 }}>
          {sub}
        </p>
        {footer}
      </div>
    </>
  )
}

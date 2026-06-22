'use client'

import { useState, useEffect, useRef } from 'react'
import { Play } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Track } from '@/types'

const ROTATE_MS = 6000

// Distinct gradient + sunburst tint per slide so the rotation is visually
// obvious even before the title changes — addresses "dots imply changing
// background" by actually changing the background.
const SLIDE_THEMES = [
  { from: '#0D1B3E', mid: '#152b6e', to: '#1e4a9e', ray: '#d4af37', glow: 'rgba(59,130,246,0.18)' },
  { from: '#1b1033', mid: '#3a1d6e', to: '#5b2a9e', ray: '#c9a8ff', glow: 'rgba(139,92,246,0.20)' },
  { from: '#062018', mid: '#0d4a35', to: '#127a52', ray: '#6ee7b7', glow: 'rgba(16,185,129,0.18)' },
]

export default function HeroBanner({ tracks }: { tracks: Track[] }) {
  const { play } = usePlayerStore()
  const router = useRouter()
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (tracks.length <= 1) return
    timerRef.current = setInterval(() => {
      setActive(i => (i + 1) % tracks.length)
    }, ROTATE_MS)
    return () => clearInterval(timerRef.current)
  }, [tracks.length])

  const track = tracks[active]
  const theme = SLIDE_THEMES[active % SLIDE_THEMES.length]

  const handlePlay = async () => {
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url })
    router.push('/now-playing')
  }

  const goTo = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setActive(i)
    clearInterval(timerRef.current)
    if (tracks.length > 1) {
      timerRef.current = setInterval(() => setActive(p => (p + 1) % tracks.length), ROTATE_MS)
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-7 min-h-[164px] flex items-end justify-between p-7 cursor-pointer group"
      style={{
        background: `linear-gradient(130deg, ${theme.from} 0%, ${theme.mid} 55%, ${theme.to} 100%)`,
        transition: 'background 0.6s ease',
      }}
      onClick={handlePlay}
    >
      {/* Decorative art — re-tinted per slide */}
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{ transition: 'opacity 0.6s ease' }}>
        <svg viewBox="0 0 600 200" className="absolute right-0 top-0 h-full w-1/2" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={`hg-${active}`} cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor={theme.to} stopOpacity=".35"/>
              <stop offset="100%" stopColor={theme.from} stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="600" height="200" fill={`url(#hg-${active})`}/>
          <g stroke={theme.ray} strokeWidth="1.5" opacity=".6">
            {[30, 90, 150, 200, 260, 310, 370].map((x, i) => (
              <line key={i} x1="200" y1="0" x2={x} y2="200"/>
            ))}
          </g>
          <circle cx="200" cy="80" r="55" fill={theme.glow}/>
          <circle cx="200" cy="80" r="32" fill={theme.glow}/>
        </svg>
      </div>

      {/* Cover image overlay if exists */}
      {track.cover_url && (
        <div className="absolute inset-0 opacity-20">
          <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <p className="text-[11px] font-bold text-blue-300/90 uppercase tracking-[0.12em] mb-2">
          Most played this week
        </p>
        <h2 className="text-[22px] font-black text-white tracking-tight leading-tight mb-1">
          {track.title}
        </h2>
        <p className="text-[13px] text-white/65 mb-3">
          {track.artist?.stage_name}
          {typeof track.play_count === 'number' && track.play_count > 0 && (
            <span className="text-white/40"> · {track.play_count.toLocaleString()} plays</span>
          )}
        </p>
        {tracks.length > 1 && (
          <div className="flex gap-1.5 mt-1">
            {tracks.map((_, i) => (
              <button
                key={i}
                onClick={(e) => goTo(i, e)}
                aria-label={`Show track ${i + 1}`}
                className="transition-all"
                style={{
                  width: i === active ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === active ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Play button */}
      <button
        className="relative z-10 w-[52px] h-[52px] rounded-full bg-white flex-shrink-0 grid place-items-center shadow-xl group-hover:scale-105 transition-transform"
        onClick={(e) => { e.stopPropagation(); handlePlay() }}
      >
        <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
      </button>
    </div>
  )
}

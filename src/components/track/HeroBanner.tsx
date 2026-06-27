'use client'

import { useState, useEffect, useRef } from 'react'
import { Play } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { useRouter } from 'next/navigation'
import { notify } from '@/components/ui/notify'
import type { Track } from '@/types'

const ROTATE_MS = 5000

// Fallback gradient themes when there's no cover art
const SLIDE_THEMES = [
  { from: '#0D1B3E', to: '#1e4a9e' },
  { from: '#1b1033', to: '#5b2a9e' },
  { from: '#062018', to: '#127a52' },
  { from: '#1f0a00', to: '#7c2d12' },
  { from: '#0a0a1f', to: '#1e3a8a' },
  { from: '#0f1a0a', to: '#14532d' },
  { from: '#1a0a1a', to: '#6b21a8' },
]

export default function HeroBanner({ tracks }: { tracks: Track[] }) {
  const { play } = usePlayerStore()
  const router = useRouter()
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const startTimer = () => {
    clearInterval(timerRef.current)
    if (tracks.length <= 1) return
    timerRef.current = setInterval(() => {
      setActive(i => (i + 1) % tracks.length)
    }, ROTATE_MS)
  }

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [tracks.length])

  const track = tracks[active]
  const theme = SLIDE_THEMES[active % SLIDE_THEMES.length]

  const handlePlay = async () => {
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { notify.error('Could not load track'); return }
    play({ ...track, audio_url: data.url }, tracks)
    router.push('/now-playing')
  }

  const goTo = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setActive(i)
    startTimer()
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-7 cursor-pointer group"
      style={{ minHeight: '180px' }}
      onClick={handlePlay}
    >
      {/* Background: artwork if available, else gradient */}
      <div className="absolute inset-0 transition-all duration-700">
        {track.cover_url ? (
          <>
            <img
              src={track.cover_url}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.45) saturate(1.2)' }}
            />
            {/* Subtle gradient overlay so text stays readable */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 100%)' }} />
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(130deg, ${theme.from} 0%, ${theme.to} 100%)` }}
          />
        )}
      </div>

      {/* Decorative rays (only shown when no cover) */}
      {!track.cover_url && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg viewBox="0 0 600 200" className="absolute right-0 top-0 h-full w-1/2" preserveAspectRatio="xMidYMid slice">
            <g stroke="white" strokeWidth="1.5" opacity=".5">
              {[30, 90, 150, 200, 260, 310, 370].map((x, i) => (
                <line key={i} x1="200" y1="0" x2={x} y2="200"/>
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-end justify-between p-6 md:p-7" style={{ minHeight: '180px' }}>
        <div>
          <p className="text-[11px] font-bold text-blue-300/90 uppercase tracking-[0.12em] mb-2">
            Most played this week
          </p>
          <h2 className="text-[22px] font-black text-white tracking-tight leading-tight mb-1 drop-shadow-lg">
            {track.title}
          </h2>
          <p className="text-[13px] text-white/70 mb-3 drop-shadow">
            {track.artist?.stage_name}
            {typeof track.play_count === 'number' && track.play_count > 0 && (
              <span className="text-white/40"> · {track.play_count.toLocaleString()} plays</span>
            )}
          </p>

          {/* Dots — up to 7 */}
          {tracks.length > 1 && (
            <div className="flex gap-1.5 mt-1">
              {tracks.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goTo(i, e)}
                  aria-label={`Show track ${i + 1}`}
                  style={{
                    width: i === active ? '18px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === active ? '#fff' : 'rgba(255,255,255,0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Play button */}
        <button
          className="w-[52px] h-[52px] rounded-full bg-white flex-shrink-0 grid place-items-center shadow-xl group-hover:scale-105 transition-transform"
          onClick={(e) => { e.stopPropagation(); handlePlay() }}
        >
          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
        </button>
      </div>
    </div>
  )
}

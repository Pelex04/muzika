'use client'

import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/store/player'
import { formatDuration } from '@/lib/utils'
import { Play, Pause, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDominantColor } from '@/lib/color-extract'

const SWIPE_THRESHOLD = 60

export default function MiniPlayer() {
  const {
    currentTrack, isPlaying, currentTime, duration,
    isLoading, togglePlay, next, prev,
  } = usePlayerStore()
  const pathname = usePathname()
  const onNowPlaying = pathname === '/now-playing'
  const accentColor = useDominantColor(currentTrack?.cover_url)

  // .muzika-main reserves bottom padding for this bar unconditionally,
  // independent of whether we render -- so hiding below without also
  // clearing that padding leaves an empty gap on this route.
  useEffect(() => {
    const main = document.querySelector('.muzika-main')
    main?.classList.toggle('now-playing-route', onNowPlaying)
  }, [onNowPlaying])

  // Swipe left/right to skip next/previous. Tracks horizontal vs vertical
  // movement so an accidental vertical scroll on the bar doesn't trigger it.
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [dragX, setDragX] = useState(0)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = e.touches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy)) setDragX(dx)
  }
  const onTouchEnd = () => {
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      if (dragX < 0) next()
      else prev()
    }
    setDragX(0)
    touchStart.current = null
  }

  if (!currentTrack) return null
  if (onNowPlaying) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const background = accentColor
    ? `linear-gradient(100deg, ${accentColor.replace('rgb(', 'rgba(').replace(')', ', 0.5)')} 0%, #181818 75%)`
    : '#181818'

  return (
    <>
      <style>{`
        .muzika-player { left: 228px; margin-bottom: 0; }
        @media (max-width: 768px) { .muzika-player { left: 0; margin-bottom: 62px; } }
      `}</style>
      <div
        className="muzika-player"
        style={{
          position: 'fixed', bottom: 0, right: 0, zIndex: 50,
          background, borderTop: '1px solid #2a2a2a',
          boxShadow: '0 -2px 20px rgba(0,0,0,.4)',
          transition: 'background 600ms ease',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: '3px', background: '#2a2a2a', width: '100%' }}>
          <div style={{ height: '100%', background: '#ffffff', width: `${progress}%`, transition: 'width .5s linear' }} />
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '0 20px', height: '73px',
            transform: dragX ? `translateX(${dragX * 0.3}px)` : undefined,
            transition: dragX ? 'none' : 'transform 200ms ease',
            touchAction: 'pan-y',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Art */}
          <Link href="/now-playing" style={{ flexShrink: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: '#0D1B3E' }}>
              {currentTrack.cover_url
                ? <img src={currentTrack.cover_url} alt={currentTrack.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d1b3e,#1e4a9e)' }} />
              }
            </div>
          </Link>

          {/* Info */}
          <Link href="/now-playing" style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title}
            </p>
            <p style={{ fontSize: '12px', color: '#b3b3b3' }}>
              {currentTrack.artist?.stage_name}
            </p>
          </Link>

          {/* Time */}
          <span style={{ fontSize: '12px', color: '#717171', flexShrink: 0 }}>
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          {/* Play/Pause only -- next/prev are swipe gestures on this bar now */}
          <div onClick={e => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: '#ffffff', border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center', color: '#000000',
              }}
            >
              {isLoading
                ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : isPlaying ? <Pause size={16} /> : <Play size={16} />
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

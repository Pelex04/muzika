'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/store/player'
import { formatDuration } from '@/lib/utils'
import { SkipBack, SkipForward, Play, Pause, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MiniPlayer() {
  const {
    currentTrack, isPlaying, currentTime, duration,
    isLoading, togglePlay, next, prev,
  } = usePlayerStore()
  const pathname = usePathname()
  const onNowPlaying = pathname === '/now-playing'

  // .muzika-main reserves bottom padding for this bar unconditionally,
  // independent of whether we render -- so hiding below without also
  // clearing that padding leaves an empty gap on this route.
  useEffect(() => {
    const main = document.querySelector('.muzika-main')
    main?.classList.toggle('now-playing-route', onNowPlaying)
  }, [onNowPlaying])

  if (!currentTrack) return null
  if (onNowPlaying) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

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
          background: '#181818', borderTop: '1px solid #2a2a2a',
          boxShadow: '0 -2px 20px rgba(0,0,0,.4)',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: '3px', background: '#2a2a2a', width: '100%' }}>
          <div style={{ height: '100%', background: '#3B82F6', width: `${progress}%`, transition: 'width .5s linear' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 20px', height: '73px' }}>
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

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
            <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#b3b3b3' }}>
              <SkipBack size={20} />
            </button>
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
            <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#b3b3b3' }}>
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

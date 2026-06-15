'use client'

import { useState } from 'react'
import { Play, Pause, MoreVertical, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { formatCount } from '@/lib/utils'
import { toast } from 'sonner'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  track: Track
  rank: number
  showRank?: boolean
  showTrend?: boolean
  trend?: 'up' | 'down' | 'neutral'
  playCount?: number
  userId: string | null
  queue?: Track[]
}

export default function TrackRow({
  track, rank, showRank = true, showTrend = false,
  trend = 'neutral', playCount, userId, queue
}: Props) {
  const { play, currentTrack, isPlaying } = usePlayerStore()
  const isActive = currentTrack?.id === track.id
  const isCurrentlyPlaying = isActive && isPlaying
  const [ctxOpen, setCtxOpen] = useState(false)

  const handlePlay = async () => {
    if (!userId) { toast.error('Sign in to play tracks'); return }
    if (isActive) {
      usePlayerStore.getState().togglePlay()
      return
    }
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url }, queue)
  }



  return (
    <div
      className={cn(
        'flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg bg-white cursor-pointer transition-colors group',
        isActive ? 'bg-blue-50' : 'hover:bg-blue-50/70'
      )}
      onClick={handlePlay}
    >
      {/* Rank / Equalizer */}
      {showRank && (
        <div className="w-6 flex-shrink-0 flex items-center justify-center">
          {isCurrentlyPlaying ? (
            <div className="flex items-end gap-[2.5px] w-[22px] h-[18px]">
              {[0, 0.18, 0.09].map((delay, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-sm"
                  style={{
                    height: ['55%', '100%', '38%'][i],
                    animation: `eqBounce 0.8s ease-in-out ${delay}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          ) : (
            <span className={cn(
              'text-sm font-bold',
              rank <= 3 ? 'text-blue-500 text-base font-black' : 'text-[#8B95A8]'
            )}>
              {rank}
            </span>
          )}
        </div>
      )}

      {/* Art */}
      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-[#0D1B3E]">
        {track.cover_url
          ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover"/>
          : <ArtPlaceholder genre={track.genre} small />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-bold truncate',
          isActive ? 'text-blue-600' : 'text-[#0D1B3E]'
        )}>{track.title}</p>
        <p className="text-xs text-[#5C677D] truncate mt-0.5">
          {track.artist?.stage_name}
          {playCount !== undefined && <span className="ml-1">· {formatCount(playCount)} plays</span>}
        </p>
      </div>

      {/* Trend */}
      {showTrend && (
        <div className="flex-shrink-0">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
        </div>
      )}



      {/* More */}
      <button
        className="w-7 h-7 rounded-md flex-shrink-0 grid place-items-center text-[#8B95A8] hover:bg-[#ECEEF5] hover:text-[#5C677D] opacity-0 group-hover:opacity-100 transition-all"
        onClick={e => { e.stopPropagation(); setCtxOpen(true) }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <style jsx>{`
        @keyframes eqBounce {
          from { transform: scaleY(0.45); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

function ArtPlaceholder({ genre, small }: { genre: string; small?: boolean }) {
  const colors: Record<string, string> = {
    'Afropop': '#1e3a8a', 'Gospel': '#065f46', 'Reggae': '#7f1d1d',
    'Hip-Hop': '#4c1d95', 'RnB': '#78350f', 'Traditional': '#134e4a',
  }
  const bg = colors[genre] ?? '#0d1b3e'
  return (
    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${bg}, #0d1b3e)` }}/>
  )
}

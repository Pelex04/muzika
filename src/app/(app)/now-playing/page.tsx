'use client'

import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Heart, SkipBack, SkipForward, Play, Pause,
  Shuffle, Repeat, Repeat1, Bookmark, ListPlus, Share2,
  Download, Loader2,
} from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { formatDuration, formatMWK } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function NowPlayingPage() {
  const router = useRouter()
  const {
    currentTrack, isPlaying, isLoading,
    currentTime, duration,
    volume, shuffle, repeat,
    togglePlay, next, prev, seek,
    toggleShuffle, cycleRepeat, setVolume,
  } = usePlayerStore()

  const [liked, setLiked] = useState(false)

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-[#8B95A8]">
        <div className="text-6xl mb-4">🎵</div>
        <p className="text-lg font-semibold mb-2">Nothing playing</p>
        <p className="text-sm mb-6">Pick a song from the library to start listening</p>
        <button
          onClick={() => router.push('/songs')}
          className="px-6 py-3 bg-[#0D1B3E] text-white rounded-xl font-semibold text-sm"
        >
          Browse Songs
        </button>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seek(Math.max(0, Math.min(1, pct)) * duration)
  }

  const handlePurchase = async () => {
    const res = await fetch(`/api/tracks/${currentTrack.id}/purchase`, { method: 'POST' })
    const data = await res.json()
    if (data.paymentUrl) window.location.href = data.paymentUrl
    else toast.error(data.error ?? 'Payment failed')
  }

  return (
    <div className="max-w-[420px] mx-auto px-5 md:px-8 py-6 flex flex-col gap-5 items-center w-full">
      {/* Back */}
      <div className="self-start flex items-center gap-1.5 text-[#5C677D] cursor-pointer hover:text-[#0D1B3E] transition-colors" onClick={() => router.back()}>
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Now Playing</span>
        <span className="text-[#8B95A8] mx-1">·</span>
        <span className="text-[#8B95A8] text-sm">{currentTrack.genre?.toUpperCase()}</span>
      </div>

      {/* Album Art */}
      <div className="w-full max-w-[300px] aspect-square rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(13,27,62,0.22)]">
        {currentTrack.cover_url
          ? <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full" style={{
              background: 'linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%)'
            }}>
              <svg viewBox="0 0 300 300" className="w-full h-full opacity-60">
                <g stroke="#d4af37" strokeWidth="2">
                  {[30, 75, 115, 150, 185, 225, 270].map((x, i) => (
                    <line key={i} x1="150" y1="0" x2={x} y2="300"/>
                  ))}
                </g>
                <circle cx="150" cy="120" r="60" fill="rgba(59,130,246,0.2)"/>
                <circle cx="150" cy="120" r="35" fill="rgba(59,130,246,0.15)"/>
              </svg>
            </div>
          )
        }
      </div>

      {/* Track Info */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h2 className="text-[21px] font-black text-[#0D1B3E] tracking-tight">{currentTrack.title}</h2>
          <p className="text-sm text-[#5C677D] mt-0.5">{currentTrack.artist?.stage_name}</p>
        </div>
        <button
          onClick={() => setLiked(l => !l)}
          className={cn(
            'w-11 h-11 rounded-full grid place-items-center transition-all',
            liked ? 'bg-red-100' : 'bg-[#F4F6FB]'
          )}
        >
          <Heart className={cn('w-5 h-5', liked ? 'fill-red-500 text-red-500' : 'text-[#5C677D]')} />
        </button>
      </div>

      {/* Progress */}
      <div className="w-full">
        <div
          className="w-full h-1 bg-[#ECEEF5] rounded-full cursor-pointer relative group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-[#0D1B3E] to-blue-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0D1B3E] shadow-md ring-2 ring-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#8B95A8] font-medium">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button onClick={toggleShuffle} className={cn('transition-colors', shuffle ? 'text-blue-500' : 'text-[#8B95A8] hover:text-[#0D1B3E]')}>
          <Shuffle className="w-5 h-5" />
        </button>
        <button onClick={prev} className="text-[#5C677D] hover:text-[#0D1B3E] transition-colors">
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-[#0D1B3E] grid place-items-center shadow-[0_8px_24px_rgba(13,27,62,0.28)] hover:scale-105 transition-transform"
        >
          {isLoading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : isPlaying
              ? <Pause className="w-6 h-6 text-white" />
              : <Play className="w-6 h-6 text-white ml-1" />
          }
        </button>
        <button onClick={next} className="text-[#5C677D] hover:text-[#0D1B3E] transition-colors">
          <SkipForward className="w-6 h-6" />
        </button>
        <button onClick={cycleRepeat} className={cn('transition-colors', repeat !== 'none' ? 'text-blue-500' : 'text-[#8B95A8] hover:text-[#0D1B3E]')}>
          {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
        </button>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-4 border-[1.5px] border-[#E2E5F0] rounded-xl overflow-hidden">
        {[
          { icon: Bookmark, label: 'Save', onClick: () => toast.success('Saved to library') },
          { icon: ListPlus, label: 'Playlist', onClick: () => toast.info('Playlist feature coming soon') },
          { icon: Share2,  label: 'Share',   onClick: () => navigator.share?.({ title: currentTrack.title, url: window.location.href }) },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 py-3.5 border-r border-[#E2E5F0] hover:bg-[#F4F6FB] transition-colors"
          >
            <Icon className="w-[18px] h-[18px] text-[#5C677D]" />
            <span className="text-xs font-semibold text-[#5C677D]">{label}</span>
          </button>
        ))}
        <button
          onClick={handlePurchase}
          className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-amber-50 transition-colors"
        >
          <Download className="w-[18px] h-[18px] text-amber-500" />
          <span className="text-xs font-bold text-amber-500">{formatMWK(currentTrack.price_mwk)}</span>
        </button>
      </div>
    </div>
  )
}

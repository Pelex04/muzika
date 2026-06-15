'use client'

import { Play, Download } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { Track } from '@/types'

export default function HeroBanner({ track }: { track: Track }) {
  const { play } = usePlayerStore()
  const router = useRouter()

  const handlePlay = async () => {
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url })
    router.push('/now-playing')
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-7 min-h-[164px] flex items-end justify-between p-7 cursor-pointer group"
      style={{ background: 'linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%)' }}
      onClick={handlePlay}
    >
      {/* Decorative art */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <svg viewBox="0 0 600 200" className="absolute right-0 top-0 h-full w-1/2" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="hg" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity=".3"/>
              <stop offset="100%" stopColor="#0D1B3E" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="600" height="200" fill="url(#hg)"/>
          <g stroke="#d4af37" strokeWidth="1.5" opacity=".7">
            {[30, 90, 150, 200, 260, 310, 370].map((x, i) => (
              <line key={i} x1="200" y1="0" x2={x} y2="200"/>
            ))}
          </g>
          <circle cx="200" cy="80" r="55" fill="rgba(59,130,246,0.18)"/>
          <circle cx="200" cy="80" r="32" fill="rgba(59,130,246,0.12)"/>
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
        <div className="inline-flex items-center gap-1.5 bg-white/13 border border-white/18 rounded-full px-3 py-1 text-[11px] font-bold text-white/90 mb-2.5">
          ⭐ Trending Now
        </div>
        <h2 className="text-[22px] font-black text-white tracking-tight leading-tight mb-1">
          {track.title}
        </h2>
        <p className="text-[13px] text-white/65 mb-3">{track.artist?.stage_name}</p>
        <div className="inline-flex items-center gap-1.5 bg-blue-500/30 border border-white/18 rounded-full px-3.5 py-1 text-[13px] font-bold text-white">
          <Download className="w-3 h-3" />
          Free
        </div>
        <div className="flex gap-1.5 mt-3.5">
          <div className="w-[18px] h-1.5 rounded-full bg-white"/>
          <div className="w-1.5 h-1.5 rounded-full bg-white/35"/>
          <div className="w-1.5 h-1.5 rounded-full bg-white/35"/>
        </div>
      </div>

      {/* Play button */}
      <button
        className="relative z-10 w-[52px] h-[52px] rounded-full bg-white flex-shrink-0 grid place-items-center shadow-xl group-hover:scale-105 transition-transform"
        onClick={handlePlay}
      >
        <Play className="w-5 h-5 text-[#0D1B3E] ml-0.5" fill="#0D1B3E" />
      </button>
    </div>
  )
}

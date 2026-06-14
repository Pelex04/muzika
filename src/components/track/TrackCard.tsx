'use client'

import { useState } from 'react'
import { Play, Download, Bookmark, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { usePlayerStore } from '@/store/player'
import { formatMWK } from '@/lib/utils'
import type { Track } from '@/types'

interface Props {
  track: Track
  userId: string | null
  queue?: Track[]
}

export default function TrackCard({ track, userId, queue }: Props) {
  const { play, currentTrack, isPlaying } = usePlayerStore()
  const isActive = currentTrack?.id === track.id && isPlaying
  const [saving, setSaving] = useState(false)

  const handlePlay = async () => {
    if (!userId) { toast.error('Sign in to play tracks'); return }
    if (!track.is_purchased && !track.audio_url) {
      toast.error('Purchase this track to play it')
      return
    }
    // Fetch signed URL from API if needed
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url }, queue)
  }

  const handleSave = async () => {
    if (!userId) { toast.error('Sign in to save tracks'); return }
    setSaving(true)
    const res = await fetch(`/api/tracks/${track.id}/save`, { method: 'POST' })
    const data = await res.json()
    if (data.saved) toast.success('Added to library')
    else toast.success('Removed from library')
    setSaving(false)
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden cursor-pointer shadow-[0_1px_3px_rgba(13,27,62,.06),0_4px_16px_rgba(13,27,62,.08)] hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(13,27,62,.04),0_12px_40px_rgba(13,27,62,.14)] transition-all group`}>
      {/* Art */}
      <div className="relative aspect-square" onClick={handlePlay}>
        {track.cover_url
          ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          : <AlbumArtPlaceholder genre={track.genre} />
        }
        {/* Price Badge */}
        <div className="absolute bottom-2 left-2 bg-[rgba(13,27,62,0.82)] text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
          {formatMWK(track.price_mwk)}
        </div>
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
          <div className="w-12 h-12 rounded-full bg-white grid place-items-center shadow-lg">
            <Play className="w-5 h-5 text-[#0D1B3E] ml-0.5" fill="#0D1B3E" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-bold text-[#0D1B3E] truncate">{track.title}</p>
        <p className="text-[12px] text-[#5C677D] mt-0.5 truncate">{track.artist?.stage_name}</p>
      </div>
    </div>
  )
}

function AlbumArtPlaceholder({ genre }: { genre: string }) {
  const palettes: Record<string, { bg: string; stroke: string }> = {
    'Afropop':      { bg: 'from-blue-900 to-[#0d1b3e]', stroke: '#60a5fa' },
    'Gospel':       { bg: 'from-emerald-900 to-[#022c22]', stroke: '#34d399' },
    'Reggae':       { bg: 'from-red-900 to-[#450a0a]', stroke: '#fca5a5' },
    'Hip-Hop':      { bg: 'from-purple-900 to-[#1e1b4b]', stroke: '#a78bfa' },
    'RnB':          { bg: 'from-orange-900 to-[#431407]', stroke: '#fb923c' },
    'Traditional':  { bg: 'from-teal-900 to-[#022c22]', stroke: '#2dd4bf' },
  }
  const { bg, stroke } = palettes[genre] ?? palettes['Afropop']

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bg} flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" opacity={0.5}>
        <line x1="50" y1="0" x2="15" y2="100" stroke={stroke} strokeWidth="1.5"/>
        <line x1="50" y1="0" x2="32" y2="100" stroke={stroke} strokeWidth="1.5"/>
        <line x1="50" y1="0" x2="50" y2="100" stroke={stroke} strokeWidth="1.5"/>
        <line x1="50" y1="0" x2="68" y2="100" stroke={stroke} strokeWidth="1.5"/>
        <line x1="50" y1="0" x2="85" y2="100" stroke={stroke} strokeWidth="1.5"/>
        <circle cx="50" cy="45" r="16" fill={`${stroke}22`}/>
      </svg>
    </div>
  )
}

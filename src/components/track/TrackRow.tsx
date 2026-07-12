'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Pause, MoreVertical, TrendingUp, TrendingDown, Bookmark, ListPlus, Share2, Download, X } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { formatCount } from '@/lib/utils'
import { notify } from '@/components/ui/notify'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal'
import { usePrefetchTrack } from '@/hooks/usePrefetchTrack'
import { fetchStreamUrl } from '@/lib/stream-cache'

interface Props {
  track: Track
  rank: number
  showRank?: boolean
  showTrend?: boolean
  trend?: 'up' | 'down' | 'neutral'
  playCount?: number
  userId: string | null
  queue?: Track[]
  variant?: 'default' | 'plain'
}

export default function TrackRow({
  track, rank, showRank = true, showTrend = false,
  trend = 'neutral', playCount, userId, queue, variant = 'plain'
}: Props) {
  const { play, currentTrack, isPlaying } = usePlayerStore()
  const isActive = currentTrack?.id === track.id
  const isCurrentlyPlaying = isActive && isPlaying
  const [menuOpen, setMenuOpen] = useState(false)
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false)
  const prefetchRef = usePrefetchTrack(track.id)

  const handlePlay = async () => {
    if (!userId) { notify.error('Sign in to play tracks'); return }
    if (isActive) {
      usePlayerStore.getState().togglePlay()
      return
    }
    const _streamUrl = await fetchStreamUrl(track.id)
    if (!_streamUrl) { notify.error('Could not load track'); return }
    play({ ...track, audio_url: _streamUrl }, queue)
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    const res = await fetch(`/api/tracks/${track.id}/save`, { method: 'POST' })
    const data = await res.json()
    notify.success(data.saved ? 'Saved to library' : 'Removed from library')
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    const shareUrl = `${window.location.origin}/songs?track=${track.id}`
    if (navigator.share) {
      try { await navigator.share({ title: track.title, url: shareUrl }) } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      notify.success('Link copied to clipboard')
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    const res = await fetch(`/api/tracks/${track.id}/download`)
    const data = await res.json()
    if (!data.url) { notify.error('Could not download track'); return }
    const a = document.createElement('a')
    a.href = data.url
    a.download = data.filename ?? track.title
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    notify.success('Download started')
  }

  return (
    <div
      ref={prefetchRef}
      className={cn(
        'relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors group',
        variant === 'plain'
          ? isActive ? 'bg-white/5' : 'hover:bg-white/5'
          : isActive ? 'bg-[#282828]' : 'bg-[#181818] hover:bg-[#282828]'
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
              rank <= 3 ? 'text-blue-400 text-base font-black' : 'text-[#717171]'
            )}>
              {rank}
            </span>
          )}
        </div>
      )}

      {/* Art */}
      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-[#0D1B3E]">
        {track.cover_url
          ? <Image src={track.cover_url} alt={track.title} width={44} height={44} className="w-full h-full object-cover"/>
          : <ArtPlaceholder genre={track.genre} small />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-bold truncate',
          isActive ? 'text-blue-400' : 'text-white'
        )}>{track.title}</p>
        <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
          {track.artist?.stage_name}
          {playCount !== undefined && <span className="ml-1">· {formatCount(playCount)} plays</span>}
        </p>
      </div>

      {/* Trend */}
      {showTrend && (
        <div className="flex-shrink-0">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
        </div>
      )}

      {/* More */}
      <button
        className="w-7 h-7 rounded-md flex-shrink-0 grid place-items-center text-[#717171] hover:bg-[#3a3a3a] hover:text-white opacity-0 group-hover:opacity-100 transition-all relative"
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Context menu */}
      {menuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
            onClick={e => { e.stopPropagation(); setMenuOpen(false) }}
          />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', right: '14px', top: '48px', zIndex: 100,
              background: '#282828', borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,.5)',
              border: '1px solid #3a3a3a',
              minWidth: '180px', padding: '6px',
            }}
          >
            <button onClick={handleSave} style={menuItemStyle}>
              <Bookmark size={15} color="#b3b3b3" /> Save to Library
            </button>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(false); setPlaylistModalOpen(true) }} style={menuItemStyle}>
              <ListPlus size={15} color="#b3b3b3" /> Add to Playlist
            </button>
            <button onClick={handleShare} style={menuItemStyle}>
              <Share2 size={15} color="#b3b3b3" /> Share
            </button>
            <button onClick={handleDownload} style={menuItemStyle}>
              <Download size={15} color="#10B981" /> <span style={{ color: '#10B981' }}>Download</span>
            </button>
          </div>
        </>
      )}

      {playlistModalOpen && (
        <div onClick={e => e.stopPropagation()}>
          <AddToPlaylistModal trackId={track.id} onClose={() => setPlaylistModalOpen(false)} />
        </div>
      )}

      <style jsx>{`
        @keyframes eqBounce {
          from { transform: scaleY(0.45); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: '13.5px', fontWeight: 600, color: '#ffffff',
  textAlign: 'left', fontFamily: 'inherit',
}

function ArtPlaceholder({ genre, small }: { genre: string; small?: boolean }) {
  const colors: Record<string, string> = {
    'Afropop': '#1e3a8a', 'Gospel': '#065f46', 'Reggae': '#7f1d1d',
    'Hip-Hop': '#4c1d95', 'RnB': '#78350f', 'Traditional': '#134e4a', 'Amapiano': '#831843',
  }
  const bg = colors[genre] ?? '#0d1b3e'
  return (
    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${bg}, #0d1b3e)` }}/>
  )
}

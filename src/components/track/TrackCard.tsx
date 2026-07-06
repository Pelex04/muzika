'use client'

import { useState } from 'react'
import { Play, Bookmark, MoreVertical, ListPlus, Share2, Download, Check } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import { usePlayerStore } from '@/store/player'
import type { Track } from '@/types'
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal'
import { usePrefetchTrack } from '@/hooks/usePrefetchTrack'
import { fetchStreamUrl } from '@/lib/stream-cache'

interface Props {
  track: Track
  userId: string | null
  queue?: Track[]
}

export default function TrackCard({ track, userId, queue }: Props) {
  const { play, currentTrack, isPlaying } = usePlayerStore()
  const isActive = currentTrack?.id === track.id && isPlaying
  const [saved, setSaved] = useState(track.is_saved ?? false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false)
  const prefetchRef = usePrefetchTrack(track.id)

  const handlePlay = async () => {
    if (!userId) { notify.error('Sign in to play tracks'); return }
    const _streamUrl = await fetchStreamUrl(track.id)
    if (!_streamUrl) { notify.error('Could not load track'); return }
    play({ ...track, audio_url: _streamUrl }, queue)
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!userId) { notify.error('Sign in to save tracks'); return }
    const res = await fetch(`/api/tracks/${track.id}/save`, { method: 'POST' })
    const data = await res.json()
    setSaved(data.saved)
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
    <div ref={prefetchRef} className="relative bg-[#181818] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 transition-all group">
      {/* Art */}
      <div className="relative aspect-square" onClick={handlePlay}>
        {track.cover_url
          ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          : <AlbumArtPlaceholder genre={track.genre} />
        }

        {/* Saved indicator */}
        {saved && (
          <div className="absolute bottom-2 left-2 bg-[rgba(13,27,62,0.82)] text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
            <Check size={11} /> Saved
          </div>
        )}

        {/* More button */}
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/35 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        >
          <MoreVertical size={14} color="white" />
        </button>

        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
          <div className="w-12 h-12 rounded-full bg-white grid place-items-center shadow-lg">
            <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
          </div>
        </div>

        {/* Context menu */}
        {menuOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={e => { e.stopPropagation(); setMenuOpen(false) }} />
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', top: '38px', right: '8px', zIndex: 100,
                background: '#282828', borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,.5)',
                border: '1px solid #3a3a3a',
                minWidth: '170px', padding: '6px',
              }}
            >
              <button onClick={handleSave} style={menuItemStyle}>
                <Bookmark size={14} color="#b3b3b3" /> {saved ? 'Unsave' : 'Save'}
              </button>
              <button onClick={e => { e.stopPropagation(); setMenuOpen(false); setPlaylistModalOpen(true) }} style={menuItemStyle}>
                <ListPlus size={14} color="#b3b3b3" /> Add to Playlist
              </button>
              <button onClick={handleShare} style={menuItemStyle}>
                <Share2 size={14} color="#b3b3b3" /> Share
              </button>
              <button onClick={handleDownload} style={menuItemStyle}>
                <Download size={14} color="#10B981" /> <span style={{ color: '#10B981' }}>Download</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-bold text-white truncate">{track.title}</p>
        <p className="text-[12px] text-[#b3b3b3] mt-0.5 truncate">{track.artist?.stage_name}</p>
      </div>

      {playlistModalOpen && (
        <div onClick={e => e.stopPropagation()}>
          <AddToPlaylistModal trackId={track.id} onClose={() => setPlaylistModalOpen(false)} />
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: '13px', fontWeight: 600, color: '#ffffff',
  textAlign: 'left', fontFamily: 'inherit',
}

function AlbumArtPlaceholder({ genre }: { genre: string }) {
  const palettes: Record<string, { bg: string; stroke: string }> = {
    'Afropop':      { bg: 'from-blue-900 to-[#0d1b3e]', stroke: '#60a5fa' },
    'Gospel':       { bg: 'from-emerald-900 to-[#022c22]', stroke: '#34d399' },
    'Reggae':       { bg: 'from-red-900 to-[#450a0a]', stroke: '#fca5a5' },
    'Hip-Hop':      { bg: 'from-purple-900 to-[#1e1b4b]', stroke: '#a78bfa' },
    'RnB':          { bg: 'from-orange-900 to-[#431407]', stroke: '#fb923c' },
    'Traditional':  { bg: 'from-teal-900 to-[#022c22]', stroke: '#2dd4bf' },
    'Amapiano':     { bg: 'from-pink-900 to-[#500724]', stroke: '#f472b6' },
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

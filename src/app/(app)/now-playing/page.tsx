'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Heart, SkipBack, SkipForward, Play, Pause,
  Shuffle, Repeat, Repeat1, Bookmark, ListPlus, Share2,
  Download, Loader2, Music2, CheckCircle2,
} from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { fetchStreamUrl } from '@/lib/stream-cache'
import { formatDuration, formatCount } from '@/lib/utils'
import { notify } from '@/components/ui/notify'
import { cn } from '@/lib/utils'
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal'
import type { Artist, Track } from '@/types'

const GENRE_BG: Record<string, string> = {
  'Afropop': '#1e3a8a', 'Gospel': '#065f46', 'Reggae': '#7f1d1d',
  'Hip-Hop': '#4c1d95', 'RnB': '#78350f', 'Traditional': '#134e4a',
  'Jazz': '#1c1917', 'Dancehall': '#064e3b',
}

export default function NowPlayingPage() {
  const router = useRouter()
  const {
    currentTrack, queue, isPlaying, isLoading,
    currentTime, duration,
    shuffle, repeat,
    play, togglePlay, next, prev, seek,
    toggleShuffle, cycleRepeat,
  } = usePlayerStore()

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const [artist, setArtist] = useState<Artist | null>(null)
  const [moreByArtist, setMoreByArtist] = useState<Track[]>([])
  const [related, setRelated] = useState<Track[]>([])
  const [lyrics, setLyrics] = useState<string | null>(null)
  const [contextLoading, setContextLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'related' | 'lyrics'>('related')

  const loadContext = useCallback(async (trackId: string) => {
    setContextLoading(true)
    setLyrics(null)
    try {
      const res = await fetch(`/api/tracks/${trackId}/context`)
      const data = await res.json()
      setArtist(data.artist ?? null)
      setMoreByArtist(data.moreByArtist ?? [])
      setRelated(data.related ?? [])
      setLyrics(data.lyrics ?? null)
      // Auto-switch to lyrics tab if available
      if (data.lyrics) setActiveTab('lyrics')
      else setActiveTab('related')
    } catch {
      // non-fatal
    }
    setContextLoading(false)
  }, [])

  useEffect(() => {
    if (currentTrack) loadContext(currentTrack.id)
  }, [currentTrack?.id, loadContext])

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-[#717171]">
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#181818', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
          <Music2 size={28} color="#717171" />
        </div>
        <p className="text-lg font-semibold mb-2 text-white">Nothing playing</p>
        <p className="text-sm mb-6">Pick a song from the library to start listening</p>
        <button
          onClick={() => router.push('/songs')}
          className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm"
        >
          Browse Songs
        </button>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const genreBg = GENRE_BG[currentTrack.genre] ?? '#0D1B3E'

  const handlePlayTrack = async (track: Track, fromQueue?: Track[]) => {
    const _streamUrl = await fetchStreamUrl(track.id)
    if (!_streamUrl) { notify.error('Could not load track'); return }
    play({ ...track, audio_url: _streamUrl }, fromQueue)
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/tracks/${currentTrack.id}/save`, { method: 'POST' })
      const data = await res.json()
      setSaved(data.saved)
      notify.success(data.saved ? 'Saved to your library' : 'Removed from library')
    } catch {
      notify.error('Could not save track')
    }
  }

  const handleFollow = async () => {
    if (!artist) return
    setFollowLoading(true)
    try {
      const res = await fetch(`/api/artists/${artist.id}/follow`, { method: 'POST' })
      const data = await res.json()
      setArtist(prev => prev ? { ...prev, is_following: data.following } : prev)
    } catch {
      notify.error('Could not update follow status')
    }
    setFollowLoading(false)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/songs?track=${currentTrack.id}`
    const shareData = {
      title: currentTrack.title,
      text: `Listen to "${currentTrack.title}" by ${currentTrack.artist?.stage_name ?? 'an artist'} on Muzika`,
      url: shareUrl,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      notify.success('Link copied to clipboard')
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/tracks/${currentTrack.id}/download`)
      const data = await res.json()
      if (!_streamUrl) { notify.error('Could not download track'); setDownloading(false); return }
      const a = document.createElement('a')
      a.href = _streamUrl
      a.download = data.filename ?? currentTrack.title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      notify.success('Download started')
    } catch {
      notify.error('Download failed')
    }
    setDownloading(false)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seek(Math.max(0, Math.min(1, pct)) * duration)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#121212' }}>
      <div className="max-w-[680px] mx-auto px-5 md:px-8 pb-12">

        {/* ── Back ── */}
        <div className="flex items-center gap-1.5 text-[#b3b3b3] cursor-pointer hover:text-white transition-colors pt-6 pb-4" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Now Playing</span>
          <span className="text-[#717171] mx-1">·</span>
          <span className="text-[#717171] text-sm">{currentTrack.genre?.toUpperCase()}</span>
        </div>

        {/* ── PLAYER (sticky-feeling, top section) ── */}
        <div className="flex flex-col items-center gap-5 w-full mb-10">
          <div className="w-full max-w-[300px] aspect-square rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {currentTrack.cover_url
              ? <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              : (
                <div className="w-full h-full" style={{ background: `linear-gradient(130deg, #0D1B3E 0%, ${genreBg} 100%)` }}>
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

          <div className="w-full flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-[21px] font-black text-white tracking-tight truncate">{currentTrack.title}</h2>
              <Link href={artist ? `/artists/${artist.id}` : '#'} className="text-sm text-[#b3b3b3] mt-0.5 hover:text-white hover:underline truncate block">
                {currentTrack.artist?.stage_name}
              </Link>
            </div>
            <button
              onClick={() => setLiked(l => !l)}
              className={cn('w-11 h-11 rounded-full grid place-items-center transition-all flex-shrink-0 ml-3', liked ? 'bg-red-500/15' : 'bg-[#181818]')}
            >
              <Heart className={cn('w-5 h-5', liked ? 'fill-red-500 text-red-500' : 'text-[#b3b3b3]')} />
            </button>
          </div>

          <div className="w-full">
            <div className="w-full h-1 bg-[#2a2a2a] rounded-full cursor-pointer relative group" onClick={handleSeek}>
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#717171] font-medium">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleShuffle} className={cn('transition-colors', shuffle ? 'text-blue-400' : 'text-[#717171] hover:text-white')}>
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={prev} className="text-[#b3b3b3] hover:text-white transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white grid place-items-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
            >
              {isLoading
                ? <Loader2 className="w-6 h-6 text-black animate-spin" />
                : isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-1" />
              }
            </button>
            <button onClick={next} className="text-[#b3b3b3] hover:text-white transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
            <button onClick={cycleRepeat} className={cn('transition-colors', repeat !== 'none' ? 'text-blue-400' : 'text-[#717171] hover:text-white')}>
              {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          <div className="w-full grid grid-cols-4 border-[1.5px] border-[#2a2a2a] rounded-xl overflow-hidden">
            <button onClick={handleSave} className="flex flex-col items-center gap-1.5 py-3.5 border-r border-[#2a2a2a] hover:bg-[#181818] transition-colors">
              <Bookmark className="w-[18px] h-[18px]" style={{ color: saved ? '#60a5fa' : '#b3b3b3' }} fill={saved ? '#60a5fa' : 'none'} />
              <span className="text-xs font-semibold" style={{ color: saved ? '#60a5fa' : '#b3b3b3' }}>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button onClick={() => setShowPlaylistModal(true)} className="flex flex-col items-center gap-1.5 py-3.5 border-r border-[#2a2a2a] hover:bg-[#181818] transition-colors">
              <ListPlus className="w-[18px] h-[18px] text-[#b3b3b3]" />
              <span className="text-xs font-semibold text-[#b3b3b3]">Playlist</span>
            </button>
            <button onClick={handleShare} className="flex flex-col items-center gap-1.5 py-3.5 border-r border-[#2a2a2a] hover:bg-[#181818] transition-colors">
              <Share2 className="w-[18px] h-[18px] text-[#b3b3b3]" />
              <span className="text-xs font-semibold text-[#b3b3b3]">Share</span>
            </button>
            <button onClick={handleDownload} disabled={downloading} className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-[#181818] transition-colors">
              {downloading
                ? <Loader2 className="w-[18px] h-[18px]" style={{ color: '#10B981', animation: 'spin 1s linear infinite' }} />
                : <Download className="w-[18px] h-[18px]" style={{ color: '#10B981' }} />
              }
              <span className="text-xs font-bold" style={{ color: '#10B981' }}>{downloading ? 'Saving…' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT BELOW ── */}
        {contextLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 text-[#717171] animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">

            {/* Artist card */}
            {artist && (
              <Link href={`/artists/${artist.id}`} className="block">
                <div className="flex items-center gap-4 bg-[#181818] rounded-2xl p-4 hover:bg-[#1f1f1f] transition-colors">
                  <div
                    className="w-16 h-16 rounded-full flex-shrink-0 grid place-items-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${GENRE_BG[artist.genre] ?? '#1e3a8a'}, #0d1b3e)` }}
                  >
                    {artist.avatar_url
                      ? <img src={artist.avatar_url} alt={artist.stage_name} className="w-full h-full object-cover" />
                      : <span className="text-2xl font-black text-white/80">{artist.stage_name.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[15px] font-bold text-white truncate">{artist.stage_name}</p>
                      {artist.verified && <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" fill="#60a5fa" stroke="#181818" />}
                    </div>
                    <p className="text-xs text-[#717171] mt-0.5">{formatCount(artist.follower_count)} followers</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleFollow() }}
                    disabled={followLoading}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all',
                      artist.is_following ? 'bg-[#2a2a2a] text-white' : 'bg-white text-black hover:bg-gray-200'
                    )}
                  >
                    {followLoading ? '…' : artist.is_following ? 'Following' : 'Follow'}
                  </button>
                </div>
              </Link>
            )}

            {/* Tab switcher */}
            {(lyrics || moreByArtist.length > 0 || related.length > 0) && (
              <div className="flex gap-1 bg-[#181818] rounded-xl p-1 mb-5">
                <button onClick={() => setActiveTab('related')}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-bold transition-all',
                    activeTab === 'related' ? 'bg-white text-black' : 'text-[#b3b3b3] hover:text-white'
                  )}>
                  Related
                </button>
                <button onClick={() => setActiveTab('lyrics')}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5',
                    activeTab === 'lyrics' ? 'bg-white text-black' : 'text-[#b3b3b3] hover:text-white'
                  )}>
                  Lyrics
                  {!lyrics && <span className="text-[10px] opacity-50">—</span>}
                </button>
              </div>
            )}

            {/* Lyrics tab */}
            {activeTab === 'lyrics' && (
              <div className="mb-6">
                {lyrics ? (
                  <div className="bg-[#181818] rounded-2xl p-5">
                    <pre className="text-[#e0e0e0] text-sm leading-8 whitespace-pre-wrap font-sans">
                      {lyrics}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[#555] text-sm">No lyrics available for this track</p>
                  </div>
                )}
              </div>
            )}

            {/* Related tab */}
            {activeTab === 'related' && (
              <>
                {/* More by this artist */}
                {moreByArtist.length > 0 && (
                  <TrackSection
                    title={`More by ${artist?.stage_name ?? 'this artist'}`}
                    tracks={moreByArtist}
                    onPlay={(t) => handlePlayTrack(t, moreByArtist)}
                    currentTrackId={currentTrack.id}
                  />
                )}

                {/* Related tracks */}
                {related.length > 0 && (
                  <TrackSection
                    title={`More ${currentTrack.genre}`}
                    tracks={related}
                    onPlay={(t) => handlePlayTrack(t, related)}
                    currentTrackId={currentTrack.id}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal trackId={currentTrack.id} onClose={() => setShowPlaylistModal(false)} />
      )}
    </div>
  )
}

function TrackSection({ title, tracks, onPlay, currentTrackId }: {
  title: string
  tracks: Track[]
  onPlay: (t: Track) => void
  currentTrackId: string
}) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-white mb-3">{title}</h3>
      <div className="flex flex-col gap-1">
        {tracks.map(track => {
          const isCurrent = track.id === currentTrackId
          const bg = GENRE_BG[track.genre] ?? '#0d1b3e'
          return (
            <div
              key={track.id}
              onClick={() => onPlay(track)}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                isCurrent ? 'bg-[#181818]' : 'hover:bg-[#181818]'
              )}
            >
              <div className="w-11 h-11 rounded-md flex-shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${bg}, #0d1b3e)` }}>
                {track.cover_url && <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold truncate', isCurrent ? 'text-blue-400' : 'text-white')}>{track.title}</p>
                <p className="text-xs text-[#717171] truncate mt-0.5">{track.artist?.stage_name}</p>
              </div>
              <Play size={14} className="text-[#717171] flex-shrink-0" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

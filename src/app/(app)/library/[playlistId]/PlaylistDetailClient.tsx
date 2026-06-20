'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Music2, Trash2, Play, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { usePlayerStore } from '@/store/player'
import type { Playlist, Track } from '@/types'

interface Props {
  playlist: Playlist
  tracks: Track[]
  isOwner: boolean
}

export default function PlaylistDetailClient({ playlist, tracks: initialTracks, isOwner }: Props) {
  const router = useRouter()
  const { play } = usePlayerStore()
  const [tracks, setTracks] = useState(initialTracks)
  const [deleting, setDeleting] = useState(false)

  const handlePlay = async (track: Track) => {
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url }, tracks)
  }

  const playAll = () => {
    if (tracks.length === 0) return
    handlePlay(tracks[0])
  }

  const removeTrack = async (trackId: string) => {
    const res = await fetch(`/api/playlists/${playlist.id}/tracks/${trackId}`, { method: 'DELETE' })
    if (res.ok) {
      setTracks(prev => prev.filter(t => t.id !== trackId))
      toast.success('Removed from playlist')
    } else {
      toast.error('Could not remove track')
    }
  }

  const deletePlaylist = async () => {
    if (!confirm(`Delete "${playlist.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/playlists/${playlist.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Playlist deleted')
      router.push('/library')
    } else {
      toast.error('Could not delete playlist')
      setDeleting(false)
    }
  }

  const artBg = (genre: string) => {
    const m: Record<string, string> = {
      'Afropop':'#1e3a8a','Gospel':'#065f46','Reggae':'#7f1d1d',
      'Hip-Hop':'#4c1d95','RnB':'#78350f','Traditional':'#134e4a',
    }
    return `linear-gradient(135deg,${m[genre]??'#0d1b3e'},#0d1b3e)`
  }

  return (
    <>
      <style>{`
        .pl-wrap { max-width: 760px; margin: 0 auto; padding: 20px 16px 100px; }
        .pl-header { display: flex; align-items: flex-end; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
        .pl-cover { width: 120px; height: 120px; border-radius: 16px; background: linear-gradient(135deg,#1e3a8a,#0d1b3e); display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 8px 24px rgba(13,27,62,.2); }
        .pl-track-row { display: flex; align-items: center; gap: 12px; padding: 9px 10px; border-radius: 10px; cursor: pointer; transition: background .12s; }
        .pl-track-row:hover { background: #F4F6FB; }
      `}</style>

      <div className="pl-wrap">
        <Link href="/library" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#5C677D', textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
          <ChevronLeft size={18} /> Library
        </Link>

        <div className="pl-header">
          <div className="pl-cover">
            <Music2 size={40} color="rgba(255,255,255,0.35)" />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#8B95A8', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>Playlist</p>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0D1B3E', letterSpacing: '-0.6px', marginBottom: '6px' }}>{playlist.name}</h1>
            <p style={{ fontSize: '13px', color: '#8B95A8', marginBottom: '14px' }}>{tracks.length} tracks</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={playAll}
                disabled={tracks.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: tracks.length === 0 ? 'not-allowed' : 'pointer', opacity: tracks.length === 0 ? 0.5 : 1, fontFamily: 'inherit' }}
              >
                <Play size={13} fill="white" /> Play All
              </button>
              {isOwner && (
                <button
                  onClick={deletePlaylist}
                  disabled={deleting}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {tracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#8B95A8' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B3E', marginBottom: '6px' }}>This playlist is empty</p>
            <p style={{ fontSize: '13px' }}>Add tracks from any song's options menu.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '10px', boxShadow: '0 1px 3px rgba(13,27,62,.06)' }}>
            {tracks.map((track, i) => (
              <div key={track.id} className="pl-track-row" onClick={() => handlePlay(track)}>
                <span style={{ fontSize: '13px', color: '#8B95A8', width: '20px', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0, overflow: 'hidden', background: artBg(track.genre) }}>
                  {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
                  <p style={{ fontSize: '12px', color: '#8B95A8', marginTop: '1px' }}>{track.artist?.stage_name}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={e => { e.stopPropagation(); removeTrack(track.id) }}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    onMouseOver={e => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

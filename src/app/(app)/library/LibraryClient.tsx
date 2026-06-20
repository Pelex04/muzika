'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Music2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePlayerStore } from '@/store/player'
import type { Track, Playlist } from '@/types'
import MobileTopBar from '@/components/layout/MobileTopBar'

interface Props {
  savedTracks: Track[]
  playlists: Playlist[]
  userId: string
}

type Tab = 'saved' | 'playlists'

export default function LibraryClient({ savedTracks, playlists: initialPlaylists, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('saved')
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { play } = usePlayerStore()

  const createPlaylist = async () => {
    if (!newName.trim()) { toast.error('Give your playlist a name'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setPlaylists(prev => [{ ...data.playlist, track_count: 0 }, ...prev])
        setNewName('')
        setShowCreate(false)
        toast.success('Playlist created')
      } else {
        toast.error(data.error ?? 'Could not create playlist')
      }
    } catch {
      toast.error('Connection error')
    }
    setCreating(false)
  }

  const handlePlay = async (track: Track) => {
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url }, savedTracks)
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
        .lib-wrap { max-width: 1080px; margin: 0 auto; padding: 20px 16px 100px; }
        .lib-tabs { display: flex; gap: 4px; background: #fff; border-radius: 10px; padding: 4px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(13,27,62,.06); }
        .lib-tab { flex: 1; padding: 9px 0; border-radius: 7px; border: none; background: transparent; font-size: 13px; font-weight: 700; color: #5C677D; cursor: pointer; font-family: inherit; transition: all .15s; }
        .lib-tab.on { background: #0D1B3E; color: #fff; }
        .lib-track-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background .12s; }
        .lib-track-row:hover { background: #F4F6FB; }
        .lib-track-art { width: 46px; height: 46px; border-radius: 8px; flex-shrink: 0; overflow: hidden; }
        .lib-empty { text-align: center; padding: 60px 20px; }
        .lib-empty-icon { width: 64px; height: 64px; border-radius: 18px; background: #F4F6FB; display: grid; place-items: center; margin: 0 auto 16px; }
        .playlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 14px; }
        .playlist-card { background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08); transition: transform .15s, box-shadow .15s; text-decoration: none; display: block; }
        .playlist-card:hover { transform: translateY(-3px); }
        .playlist-cover { aspect-ratio: 1; background: linear-gradient(135deg,#1e3a8a,#0d1b3e); display: grid; place-items: center; }
        .new-playlist-card { background: #fff; border: 2px dashed #CDD0DE; border-radius: 12px; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all .15s; }
        .new-playlist-card:hover { border-color: #2563EB; background: #EBF1FF; }
      `}</style>

      <MobileTopBar eyebrow="Your music" title="Library" />

      <div className="lib-wrap">
        <div className="hidden md:block mb-6">
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '4px' }}>Your music</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0D1B3E', letterSpacing: '-0.6px' }}>Library</h1>
        </div>

        <div className="lib-tabs">
          <button className={`lib-tab ${activeTab === 'saved' ? 'on' : ''}`} onClick={() => setActiveTab('saved')}>
            Saved Tracks ({savedTracks.length})
          </button>
          <button className={`lib-tab ${activeTab === 'playlists' ? 'on' : ''}`} onClick={() => setActiveTab('playlists')}>
            Playlists ({playlists.length})
          </button>
        </div>

        {activeTab === 'saved' && (
          savedTracks.length === 0 ? (
            <div className="lib-empty">
              <div className="lib-empty-icon"><Heart size={26} color="#8B95A8" /></div>
              <p style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B3E', marginBottom: '6px' }}>No saved tracks yet</p>
              <p style={{ fontSize: '14px', color: '#8B95A8' }}>Tap the bookmark icon on any track to save it here.</p>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 3px rgba(13,27,62,.06)' }}>
              {savedTracks.map(track => (
                <div key={track.id} className="lib-track-row" onClick={() => handlePlay(track)}>
                  <div className="lib-track-art" style={{ background: artBg(track.genre) }}>
                    {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
                    <p style={{ fontSize: '12px', color: '#8B95A8', marginTop: '1px' }}>{track.artist?.stage_name} · {track.genre}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B95A8"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'playlists' && (
          <div className="playlist-grid">
            {showCreate ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', aspectRatio: '1', justifyContent: 'center' }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Playlist name…"
                  onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                  style={{ padding: '8px 10px', border: '1.5px solid #E2E5F0', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={createPlaylist} disabled={creating} style={{ flex: 1, padding: '7px', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {creating ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /> : 'Create'}
                  </button>
                  <button onClick={() => setShowCreate(false)} style={{ padding: '7px 10px', background: '#F4F6FB', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#5C677D', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="new-playlist-card" onClick={() => setShowCreate(true)}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#DBEAFE', display: 'grid', placeItems: 'center' }}>
                  <Plus size={18} color="#2563EB" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>New Playlist</span>
              </div>
            )}

            {playlists.map(p => (
              <Link key={p.id} href={`/library/${p.id}`} className="playlist-card">
                <div className="playlist-cover">
                  <Music2 size={32} color="rgba(255,255,255,0.3)" />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ fontSize: '12px', color: '#8B95A8', marginTop: '2px' }}>{p.track_count ?? 0} tracks</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </>
  )
}

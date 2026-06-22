'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Music2, Plus, Loader2, ListMusic } from 'lucide-react'
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
        .lib-tabs { display: flex; gap: 4px; background: #181818; border-radius: 10px; padding: 4px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.3); }
        .lib-tab { flex: 1; padding: 9px 0; border-radius: 7px; border: none; background: transparent; font-size: 13px; font-weight: 700; color: #b3b3b3; cursor: pointer; font-family: inherit; transition: all .15s; }
        .lib-tab.on { background: #ffffff; color: #000000; }
        .lib-track-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background .12s; }
        .lib-track-row:hover { background: #282828; }
        .lib-track-art { width: 46px; height: 46px; border-radius: 8px; flex-shrink: 0; overflow: hidden; }

        .lib-empty {
          text-align: center; padding: 56px 24px;
          background: #181818; border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,.3);
        }
        .lib-empty-icon { width: 60px; height: 60px; border-radius: 16px; background: #282828; display: grid; place-items: center; margin: 0 auto 16px; }

        /* Fixed-width cards, left-aligned, never stretch to fill the row */
        .playlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, 148px);
          gap: 14px;
          justify-content: start;
        }
        .playlist-card {
          width: 148px;
          background: #181818; border-radius: 12px; overflow: hidden;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.4);
          transition: transform .15s, box-shadow .15s;
          text-decoration: none; display: block;
        }
        .playlist-card:hover { transform: translateY(-3px); box-shadow: 0 4px 6px rgba(0,0,0,.4), 0 12px 30px rgba(0,0,0,.5); }
        .playlist-cover {
          aspect-ratio: 1;
          background: linear-gradient(135deg,#1e3a8a,#0d1b3e);
          display: grid; place-items: center;
          position: relative; overflow: hidden;
        }
        .playlist-cover svg.rays { position: absolute; inset: 0; opacity: .35; }

        .new-playlist-card {
          width: 148px;
          background: transparent; border: 1.5px dashed #3a3a3a; border-radius: 12px;
          overflow: hidden;
          cursor: pointer; transition: all .15s;
          display: flex; flex-direction: column;
        }
        .new-playlist-card:hover { border-color: #2563EB; background: #1a2332; }
        .new-playlist-top {
          aspect-ratio: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px;
        }
        .new-playlist-footer {
          padding: 10px 12px;
          display: flex; align-items: center; justify-content: center;
        }

        .create-form-card {
          width: 148px;
          background: #181818; border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.4);
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .create-form-top {
          aspect-ratio: 1;
          padding: 14px;
          display: flex; flex-direction: column; gap: 8px; justify-content: center;
        }
        .create-form-footer {
          padding: 10px 12px;
          font-size: 11.5px; color: #717171; text-align: center;
        }

        @media (max-width: 480px) {
          .playlist-grid { grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); }
          .playlist-card, .new-playlist-card, .create-form-card { width: auto; }
        }
      `}</style>

      <MobileTopBar eyebrow="Your music" title="Library" />

      <div className="lib-wrap">
        <div className="hidden md:block mb-6">
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '4px' }}>Your music</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.6px' }}>Library</h1>
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
              <div className="lib-empty-icon"><Heart size={24} color="#717171" /></div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>No saved tracks yet</p>
              <p style={{ fontSize: '13.5px', color: '#717171' }}>Tap the bookmark icon on any track to save it here.</p>
            </div>
          ) : (
            <div style={{ background: '#181818', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }}>
              {savedTracks.map(track => (
                <div key={track.id} className="lib-track-row" onClick={() => handlePlay(track)}>
                  <div className="lib-track-art" style={{ background: artBg(track.genre) }}>
                    {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
                    <p style={{ fontSize: '12px', color: '#717171', marginTop: '1px' }}>{track.artist?.stage_name} · {track.genre}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#717171"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'playlists' && (
          playlists.length === 0 && !showCreate ? (
            <div className="lib-empty">
              <div className="lib-empty-icon"><ListMusic size={24} color="#717171" /></div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>No playlists yet</p>
              <p style={{ fontSize: '13.5px', color: '#717171', marginBottom: '20px' }}>Create your first playlist to start organizing tracks.</p>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '10px 20px', background: '#ffffff', color: '#000000',
                  border: 'none', borderRadius: '9px', fontSize: '13.5px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Plus size={15} /> New Playlist
              </button>
            </div>
          ) : (
            <div className="playlist-grid">
              {showCreate ? (
                <div className="create-form-card">
                  <div className="create-form-top">
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Playlist name…"
                      onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                      style={{ padding: '8px 10px', border: '1.5px solid #3a3a3a', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', background: '#121212', color: '#ffffff' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={createPlaylist} disabled={creating} style={{ flex: 1, padding: '7px', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {creating ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create'}
                      </button>
                      <button onClick={() => setShowCreate(false)} style={{ padding: '7px 10px', background: '#282828', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#b3b3b3', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="create-form-footer">New playlist</div>
                </div>
              ) : (
                <div className="new-playlist-card" onClick={() => setShowCreate(true)}>
                  <div className="new-playlist-top">
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#282828', display: 'grid', placeItems: 'center' }}>
                      <Plus size={17} color="#60a5fa" />
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>New Playlist</span>
                  </div>
                  <div className="new-playlist-footer">
                    <span style={{ fontSize: '11.5px', color: '#717171' }}>Create one</span>
                  </div>
                </div>
              )}

              {playlists.map(p => (
                <Link key={p.id} href={`/library/${p.id}`} className="playlist-card">
                  <div className="playlist-cover">
                    <svg className="rays" viewBox="0 0 148 148" xmlns="http://www.w3.org/2000/svg">
                      <g stroke="#d4af37" strokeWidth="1.2">
                        {[20, 50, 74, 98, 128].map((x, i) => (
                          <line key={i} x1="74" y1="0" x2={x} y2="148"/>
                        ))}
                      </g>
                    </svg>
                    <Music2 size={30} color="rgba(255,255,255,0.4)" style={{ position: 'relative', zIndex: 1 }} />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <p style={{ fontSize: '11.5px', color: '#717171', marginTop: '2px' }}>{p.track_count ?? 0} track{p.track_count === 1 ? '' : 's'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </>
  )
}

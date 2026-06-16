'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, ChevronRight, Mic, Play, Download, DollarSign, Music2, Heart, ShoppingBag, Trash2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { formatMWK, formatCount } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Artist, Track } from '@/types'

interface Props {
  profile: Profile
  artist: Artist | null
  tracks: Track[]
  totalEarnings: number
  totalPlays: number
  savedTracks: any[]
  purchases: any[]
}

type Tab = 'overview' | 'tracks' | 'saved' | 'purchases'

export default function ProfileClient({ profile, artist, tracks, totalEarnings, totalPlays, savedTracks, purchases }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const isArtist = !!artist

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const deleteTrack = async (trackId: string) => {
    if (!confirm('Delete this track? This cannot be undone.')) return
    setDeletingId(trackId)
    const res = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Track deleted'); router.refresh() }
    else toast.error('Failed to delete track')
    setDeletingId(null)
  }

  const displayName = isArtist ? artist.stage_name : profile?.full_name
  const initial = displayName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <>
      <style>{`
        .prof-wrap { max-width: 860px; margin: 0 auto; padding: 20px 16px 100px; }

        /* ── HEADER ── */
        .prof-header {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08);
        }
        .prof-top-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .prof-avatar {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: #0D1B3E;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800;
          color: rgba(255,255,255,0.9);
          flex-shrink: 0;
          overflow: hidden;
        }
        .prof-avatar-artist {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
        }
        .prof-info { flex: 1; min-width: 0; }
        .prof-name {
          font-size: 18px; font-weight: 800;
          color: #0D1B3E; letter-spacing: -0.3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .prof-email { font-size: 13px; color: #8B95A8; margin-top: 2px; }
        .prof-genre { font-size: 13px; color: #5C677D; margin-top: 1px; }
        .prof-badge {
          display: inline-flex; align-items: center; gap: 3px;
          background: #DBEAFE; color: #1d4ed8;
          border-radius: 20px; padding: 2px 8px;
          font-size: 11px; font-weight: 700;
          margin-top: 4px;
        }

        /* ── ACTION BUTTONS ROW ── */
        .prof-actions {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding-top: 4px;
          border-top: 1px solid #F4F6FB;
        }
        .btn-prof-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 8px;
          background: #0D1B3E; color: #fff;
          font-size: 13px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          font-family: inherit;
        }
        .btn-prof-blue {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 8px;
          background: #2563EB; color: #fff;
          font-size: 13px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          font-family: inherit;
        }
        .btn-prof-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 14px; border-radius: 8px;
          background: #F4F6FB; border: 1.5px solid #E2E5F0;
          color: #5C677D; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit;
        }
        .prof-bio {
          font-size: 13.5px; color: #5C677D;
          line-height: 1.6; margin-top: 10px;
        }

        /* ── STATS GRID ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }
        .stat-box {
          background: #fff; border-radius: 12px;
          padding: 14px 12px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08);
          text-align: center;
        }
        .stat-box-icon { font-size: 18px; margin-bottom: 6px; }
        .stat-box-val { font-size: 20px; font-weight: 900; color: #0D1B3E; letter-spacing: -0.5px; }
        .stat-box-label { font-size: 11px; color: #8B95A8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

        /* ── TABS ── */
        .tabs-wrap {
          background: #fff; border-radius: 10px;
          padding: 4px; margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06);
          display: flex; gap: 2px; overflow-x: auto;
        }
        .tabs-wrap::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 8px 14px; border-radius: 7px;
          border: none; background: transparent;
          font-size: 13px; font-weight: 600;
          color: #5C677D; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          transition: all .12s; flex-shrink: 0;
        }
        .tab-btn.on { background: #0D1B3E; color: #fff; }

        /* ── CARDS ── */
        .tab-card {
          background: #fff; border-radius: 12px;
          padding: 18px 16px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08);
        }
        .tab-card-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 14px;
        }
        .tab-card-title { font-size: 15px; font-weight: 800; color: #0D1B3E; }
        .tab-card-action {
          font-size: 13px; font-weight: 600; color: #2563EB;
          background: none; border: none; cursor: pointer; font-family: inherit;
        }

        /* ── BECOME ARTIST CARD ── */
        .become-card {
          background: #0D1B3E;
          border-radius: 14px; padding: 22px 18px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .become-eyebrow {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase; letter-spacing: 1px;
        }
        .become-title { font-size: 18px; font-weight: 800; color: #fff; line-height: 1.3; margin: 4px 0; }
        .become-sub { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; }
        .btn-become {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 18px; background: #fff; color: #0D1B3E;
          border-radius: 9px; font-size: 13.5px; font-weight: 800;
          text-decoration: none; align-self: flex-start;
        }

        /* ── TRACK ROWS ── */
        .track-row {
          display: flex; align-items: center; gap: 12px;
          padding: 9px 0; border-bottom: 1px solid #F4F6FB;
        }
        .track-row:last-child { border-bottom: none; }
        .track-thumb {
          width: 42px; height: 42px; border-radius: 8px;
          flex-shrink: 0; overflow: hidden;
        }
        .track-row-info { flex: 1; min-width: 0; }
        .track-row-name { font-size: 13.5px; font-weight: 700; color: #0D1B3E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .track-row-sub { font-size: 12px; color: #8B95A8; margin-top: 1px; }
        .track-row-stats { display: flex; gap: 12px; flex-shrink: 0; }
        .tstat { text-align: right; }
        .tstat-val { font-size: 12px; font-weight: 700; color: #0D1B3E; }
        .tstat-label { font-size: 10px; color: #8B95A8; text-transform: uppercase; letter-spacing: 0.4px; }
        .btn-del { width: 28px; height: 28px; border-radius: 6px; border: none; background: #FEF2F2; cursor: pointer; display: grid; place-items: center; flex-shrink: 0; }

        /* ── EMPTY STATES ── */
        .empty { text-align: center; padding: 36px 16px; }
        .empty-icon { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; margin: 0 auto 12px; }
        .empty-title { font-size: 15px; font-weight: 800; color: #0D1B3E; margin-bottom: 4px; }
        .empty-sub { font-size: 13px; color: #8B95A8; line-height: 1.6; margin-bottom: 16px; }
        .btn-empty {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; background: #0D1B3E; color: #fff;
          border-radius: 8px; font-size: 13.5px; font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 600px) {
          .prof-wrap { padding: 14px 12px 100px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-box-val { font-size: 18px; }
        }
      `}</style>

      <div className="prof-wrap">

        {/* ── PROFILE HEADER ── */}
        <div className="prof-header">
          <div className="prof-top-row">
            <div className={`prof-avatar ${isArtist ? 'prof-avatar-artist' : ''}`}>
              {initial}
            </div>
            <div className="prof-info">
              <div className="prof-name">{displayName}</div>
              {isArtist
                ? <div className="prof-genre">{artist.genre} · {artist.location}</div>
                : <div className="prof-email">{profile?.email}</div>
              }
              {isArtist && (
                <div className="prof-badge"><Mic size={9}/> Artist</div>
              )}
            </div>
          </div>

          {isArtist && artist.bio && (
            <p className="prof-bio">{artist.bio}</p>
          )}

          <div className="prof-actions" style={{ marginTop: isArtist && artist.bio ? '12px' : '0', paddingTop: '12px' }}>
            {isArtist
              ? <Link href="/upload" className="btn-prof-primary"><Upload size={13}/> Upload Track</Link>
              : <Link href="/become-artist" className="btn-prof-blue"><Mic size={13}/> Become an Artist</Link>
            }
            <button onClick={signOut} className="btn-prof-ghost">
              <LogOut size={13}/> Sign out
            </button>
          </div>
        </div>

        {/* ── ARTIST STATS ── */}
        {isArtist && (
          <div className="stats-grid">
            {[
              { label: 'Tracks',    value: String(tracks.length), emoji: '🎵' },
              { label: 'Plays',     value: formatCount(totalPlays), emoji: '▶' },
              { label: 'Downloads', value: formatCount(tracks.reduce((s, t) => s + (t.download_count || 0), 0)), emoji: '⬇' },
              { label: 'Earnings',  value: formatMWK(totalEarnings), emoji: '💰' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="stat-box">
                <div className="stat-box-icon">{emoji}</div>
                <div className="stat-box-val">{value}</div>
                <div className="stat-box-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <div className="tabs-wrap">
          <button className={`tab-btn ${activeTab === 'overview' ? 'on' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          {isArtist && (
            <button className={`tab-btn ${activeTab === 'tracks' ? 'on' : ''}`} onClick={() => setActiveTab('tracks')}>
              My Tracks ({tracks.length})
            </button>
          )}
          <button className={`tab-btn ${activeTab === 'saved' ? 'on' : ''}`} onClick={() => setActiveTab('saved')}>
            Saved ({savedTracks.length})
          </button>
          <button className={`tab-btn ${activeTab === 'purchases' ? 'on' : ''}`} onClick={() => setActiveTab('purchases')}>
            Purchased ({purchases.length})
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <>
            {!isArtist && (
              <div className="become-card">
                <div>
                  <p className="become-eyebrow">For creators</p>
                  <p className="become-title">Share your music with Malawi</p>
                  <p className="become-sub">Upload your tracks, get discovered, and build your fanbase — completely free.</p>
                </div>
                <Link href="/become-artist" className="btn-become">
                  <Mic size={14}/> Get started <ChevronRight size={13}/>
                </Link>
              </div>
            )}
            {isArtist && tracks.length > 0 && (
              <div className="tab-card">
                <div className="tab-card-header">
                  <span className="tab-card-title">Recent Tracks</span>
                  <button className="tab-card-action" onClick={() => setActiveTab('tracks')}>See all</button>
                </div>
                {tracks.slice(0, 4).map(t => <TrackRow key={t.id} track={t} onDelete={deleteTrack} deleting={deletingId === t.id} showStats />)}
              </div>
            )}
            {isArtist && tracks.length === 0 && (
              <div className="tab-card">
                <div className="empty">
                  <div className="empty-icon" style={{ background: '#DBEAFE' }}><Upload size={20} color="#2563EB"/></div>
                  <p className="empty-title">No tracks yet</p>
                  <p className="empty-sub">Upload your first track and start getting discovered.</p>
                  <Link href="/upload" className="btn-empty"><Upload size={13}/> Upload Track</Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MY TRACKS ── */}
        {activeTab === 'tracks' && isArtist && (
          <div className="tab-card">
            <div className="tab-card-header">
              <span className="tab-card-title">All Tracks</span>
              <Link href="/upload" style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 13px', background:'#0D1B3E', color:'#fff', borderRadius:'7px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
                <Upload size={11}/> Upload
              </Link>
            </div>
            {tracks.length === 0
              ? <p style={{ textAlign:'center', padding:'28px 0', color:'#8B95A8', fontSize:'14px' }}>No tracks yet.</p>
              : tracks.map(t => <TrackRow key={t.id} track={t} onDelete={deleteTrack} deleting={deletingId === t.id} showStats />)
            }
          </div>
        )}

        {/* ── SAVED ── */}
        {activeTab === 'saved' && (
          <div className="tab-card">
            <div className="tab-card-header">
              <span className="tab-card-title">Saved Tracks</span>
            </div>
            {savedTracks.length === 0
              ? (
                <div className="empty">
                  <div className="empty-icon" style={{ background: '#FEF3C7' }}><Heart size={20} color="#F59E0B"/></div>
                  <p className="empty-title">Nothing saved yet</p>
                  <p className="empty-sub">Browse songs and bookmark your favourites.</p>
                </div>
              )
              : savedTracks.map((s: any) => s.track && <LibraryRow key={s.id} track={s.track} />)
            }
          </div>
        )}

        {/* ── PURCHASES ── */}
        {activeTab === 'purchases' && (
          <div className="tab-card">
            <div className="tab-card-header">
              <span className="tab-card-title">Purchased Tracks</span>
            </div>
            {purchases.length === 0
              ? (
                <div className="empty">
                  <div className="empty-icon" style={{ background: '#D1FAE5' }}><ShoppingBag size={20} color="#10B981"/></div>
                  <p className="empty-title">No purchases yet</p>
                  <p className="empty-sub">All tracks are currently free — download anything you love.</p>
                </div>
              )
              : purchases.map((p: any) => p.track && <LibraryRow key={p.id} track={p.track} />)
            }
          </div>
        )}

      </div>
    </>
  )
}

function TrackRow({ track, onDelete, deleting, showStats }: {
  track: Track; onDelete: (id: string) => void; deleting: boolean; showStats?: boolean
}) {
  const bg = ({
    'Afropop':'#1e3a8a','Gospel':'#065f46','Reggae':'#7f1d1d',
    'Hip-Hop':'#4c1d95','RnB':'#78350f','Traditional':'#134e4a',
  } as any)[track.genre] ?? '#0d1b3e'

  return (
    <div className="track-row">
      <div className="track-thumb" style={{ background: `linear-gradient(135deg,${bg},#0d1b3e)` }}>
        {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
      </div>
      <div className="track-row-info">
        <div className="track-row-name">{track.title}</div>
        <div className="track-row-sub">{track.genre}</div>
      </div>
      {showStats && (
        <div className="track-row-stats">
          <div className="tstat">
            <div className="tstat-val">{formatCount(track.play_count || 0)}</div>
            <div className="tstat-label">Plays</div>
          </div>
          <div className="tstat">
            <div className="tstat-val">{formatCount(track.download_count || 0)}</div>
            <div className="tstat-label">DLs</div>
          </div>
        </div>
      )}
      <button className="btn-del" onClick={() => onDelete(track.id)} disabled={deleting}>
        {deleting ? <span style={{fontSize:'11px',color:'#8B95A8'}}>…</span> : <Trash2 size={13} color="#EF4444"/>}
      </button>
    </div>
  )
}

function LibraryRow({ track }: { track: any }) {
  const bg = ({
    'Afropop':'#1e3a8a','Gospel':'#065f46','Reggae':'#7f1d1d',
    'Hip-Hop':'#4c1d95','RnB':'#78350f',
  } as any)[track.genre] ?? '#0d1b3e'

  return (
    <div className="track-row">
      <div className="track-thumb" style={{ background: `linear-gradient(135deg,${bg},#0d1b3e)` }}>
        {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
      </div>
      <div className="track-row-info">
        <div className="track-row-name">{track.title}</div>
        <div className="track-row-sub">{track.artist?.stage_name ?? 'Unknown artist'}</div>
      </div>
    </div>
  )
}

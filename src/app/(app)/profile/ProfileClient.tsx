'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Upload, ChevronRight, Mic, Play, Download,
  DollarSign, Music2, Heart, ShoppingBag, Trash2, LogOut
} from 'lucide-react'
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

const GENRE_COLORS: Record<string, string> = {
  'Afropop':     'linear-gradient(135deg,#1e3a8a,#2563eb)',
  'Gospel':      'linear-gradient(135deg,#065f46,#059669)',
  'Reggae':      'linear-gradient(135deg,#7f1d1d,#dc2626)',
  'Hip-Hop':     'linear-gradient(135deg,#4c1d95,#7c3aed)',
  'RnB':         'linear-gradient(135deg,#78350f,#d97706)',
  'Traditional': 'linear-gradient(135deg,#134e4a,#0d9488)',
  'Jazz':        'linear-gradient(135deg,#1c1917,#44403c)',
  'Dancehall':   'linear-gradient(135deg,#064e3b,#10b981)',
}

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

  const avatarBg = isArtist
    ? (GENRE_COLORS[artist.genre] ?? GENRE_COLORS['Afropop'])
    : '#0D1B3E'
  const displayName = isArtist ? artist.stage_name : profile?.full_name
  const initial = displayName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <>
      <style>{`
        .profile-wrap { max-width: 860px; margin: 0 auto; padding: 24px 16px 100px; }

        /* ── HEADER CARD ── */
        .prof-card { background: #fff; border-radius: 16px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08); }
        .prof-banner {
          height: 100px;
          background: linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%);
          position: relative; overflow: hidden;
        }
        .prof-banner-art { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.3; }
        .prof-body { padding: 0 20px 20px; }

        /* Avatar row */
        .prof-avatar-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: -36px;
          margin-bottom: 14px;
          gap: 12px;
        }
        .prof-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: rgba(255,255,255,0.9);
          flex-shrink: 0; overflow: hidden;
        }
        .prof-actions {
          display: flex; gap: 8px; align-items: center;
          padding-bottom: 4px; flex-wrap: wrap; justify-content: flex-end;
        }
        .btn-action-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px;
          background: #0D1B3E; color: #fff;
          font-size: 13px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          font-family: inherit; white-space: nowrap;
        }
        .btn-action-blue {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px;
          background: #2563EB; color: #fff;
          font-size: 13px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          font-family: inherit; white-space: nowrap;
        }
        .btn-action-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 12px; border-radius: 8px;
          background: #F4F6FB; border: 1.5px solid #E2E5F0;
          color: #5C677D; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; white-space: nowrap;
        }

        /* Name block */
        .prof-name-block { }
        .prof-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
        .prof-name { font-size: 20px; font-weight: 800; color: #0D1B3E; letter-spacing: -0.4px; }
        .prof-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #DBEAFE; color: #1d4ed8;
          border-radius: 20px; padding: 2px 9px;
          font-size: 11px; font-weight: 700;
        }
        .prof-meta { font-size: 13px; color: #8B95A8; margin-bottom: 4px; }
        .prof-bio { font-size: 14px; color: #5C677D; line-height: 1.6; margin-top: 8px; max-width: 520px; }

        /* ── STATS ROW ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .stat-card {
          background: #fff; border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08);
        }
        .stat-label { font-size: 11px; font-weight: 600; color: #8B95A8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .stat-value { font-size: 22px; font-weight: 900; color: #0D1B3E; letter-spacing: -0.5px; }
        .stat-icon { width: 28px; height: 28px; border-radius: 7px; display: grid; place-items: center; margin-bottom: 8px; }

        /* ── TABS ── */
        .tabs-row {
          display: flex; gap: 4px;
          background: #fff; border-radius: 10px;
          padding: 4px; margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06);
          overflow-x: auto;
        }
        .tabs-row::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 8px 14px; border-radius: 7px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          transition: all .15s; flex-shrink: 0;
        }
        .tab-btn.active { background: #0D1B3E; color: #fff; }
        .tab-btn:not(.active) { background: transparent; color: #5C677D; }
        .tab-btn:not(.active):hover { background: #F4F6FB; }

        /* ── CONTENT CARD ── */
        .content-card {
          background: #fff; border-radius: 12px;
          padding: 20px; margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08);
        }
        .content-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .content-card-title { font-size: 15px; font-weight: 800; color: #0D1B3E; }
        .see-all-btn { background: none; border: none; font-size: 13px; font-weight: 600; color: #2563EB; cursor: pointer; font-family: inherit; }

        /* ── BECOME ARTIST BANNER ── */
        .become-banner {
          border-radius: 14px; padding: 24px 20px;
          background: linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%);
          display: flex; flex-direction: column; gap: 16px;
          position: relative; overflow: hidden;
        }
        .become-banner-text { }
        .become-banner-eyebrow { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .become-banner-title { font-size: 19px; font-weight: 800; color: #fff; margin-bottom: 6px; line-height: 1.3; }
        .become-banner-sub { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; }
        .btn-become {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 12px 20px; background: #fff; color: #0D1B3E;
          border-radius: 10px; font-size: 14px; font-weight: 800;
          text-decoration: none; align-self: flex-start;
        }

        /* ── TRACK ROW ── */
        .track-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F4F6FB; }
        .track-item:last-child { border-bottom: none; }
        .track-art-sm { width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0; overflow: hidden; }
        .track-item-info { flex: 1; min-width: 0; }
        .track-item-name { font-size: 14px; font-weight: 700; color: #0D1B3E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .track-item-sub { font-size: 12px; color: #8B95A8; margin-top: 1px; }
        .track-item-stats { display: flex; gap: 14px; flex-shrink: 0; }
        .track-stat { text-align: center; }
        .track-stat-val { font-size: 13px; font-weight: 700; color: #0D1B3E; }
        .track-stat-label { font-size: 10px; color: #8B95A8; text-transform: uppercase; letter-spacing: 0.4px; }
        .btn-delete { width: 30px; height: 30px; border-radius: 6px; border: none; background: #FEF2F2; cursor: pointer; display: grid; place-items: center; flex-shrink: 0; }

        /* ── EMPTY STATE ── */
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-icon { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; margin: 0 auto 14px; }
        .empty-title { font-size: 16px; font-weight: 800; color: #0D1B3E; margin-bottom: 5px; }
        .empty-sub { font-size: 13px; color: #8B95A8; margin-bottom: 18px; line-height: 1.6; }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .profile-wrap { padding: 16px 12px 100px; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .prof-name { font-size: 18px; }
          .stat-value { font-size: 20px; }
          .become-banner-title { font-size: 17px; }
        }
      `}</style>

      <div className="profile-wrap">

        {/* ── PROFILE HEADER ── */}
        <div className="prof-card">
          <div className="prof-banner">
            {isArtist && (
              <svg className="prof-banner-art" viewBox="0 0 860 100" preserveAspectRatio="xMidYMid slice">
                <g stroke="#d4af37" strokeWidth="1">
                  {[80,180,280,430,580,680,780].map((x, i) => (
                    <line key={i} x1="430" y1="0" x2={x} y2="100"/>
                  ))}
                </g>
                <circle cx="430" cy="20" r="55" fill="rgba(59,130,246,0.12)"/>
              </svg>
            )}
          </div>

          <div className="prof-body">
            <div className="prof-avatar-row">
              <div className="prof-avatar" style={{ background: avatarBg }}>
                {initial}
              </div>
              <div className="prof-actions">
                {isArtist && (
                  <Link href="/upload" className="btn-action-primary">
                    <Upload size={13}/> Upload
                  </Link>
                )}
                {!isArtist && (
                  <Link href="/become-artist" className="btn-action-blue">
                    <Mic size={13}/> Become an Artist
                  </Link>
                )}
                <button onClick={signOut} className="btn-action-ghost">
                  <LogOut size={13}/> Sign out
                </button>
              </div>
            </div>

            <div className="prof-name-block">
              <div className="prof-name-row">
                <span className="prof-name">{displayName}</span>
                {isArtist && (
                  <span className="prof-badge"><Mic size={10}/> Artist</span>
                )}
              </div>
              {isArtist && (
                <p className="prof-meta">{artist.genre} · {artist.location}</p>
              )}
              <p className="prof-meta">{profile?.email}</p>
              {isArtist && artist.bio && (
                <p className="prof-bio">{artist.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── ARTIST STATS ── */}
        {isArtist && (
          <div className="stats-row">
            {[
              { label: 'Tracks', value: String(tracks.length), icon: <Music2 size={14} color="#2563EB"/>, bg: '#DBEAFE' },
              { label: 'Plays', value: formatCount(totalPlays), icon: <Play size={14} color="#10B981"/>, bg: '#D1FAE5' },
              { label: 'Downloads', value: formatCount(tracks.reduce((s, t) => s + (t.download_count || 0), 0)), icon: <Download size={14} color="#F59E0B"/>, bg: '#FEF3C7' },
              { label: 'Earnings', value: formatMWK(totalEarnings), icon: <DollarSign size={14} color="#8B5CF6"/>, bg: '#EDE9FE' },
            ].map(({ label, value, icon, bg }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: bg }}>{icon}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <div className="tabs-row">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          {isArtist && (
            <button className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`} onClick={() => setActiveTab('tracks')}>
              My Tracks ({tracks.length})
            </button>
          )}
          <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            Saved ({savedTracks.length})
          </button>
          <button className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
            Purchased ({purchases.length})
          </button>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {!isArtist && (
              <div className="become-banner">
                <div className="become-banner-text">
                  <p className="become-banner-eyebrow">For creators</p>
                  <h2 className="become-banner-title">Share your music with Malawi</h2>
                  <p className="become-banner-sub">Upload your tracks, get discovered, and build your fanbase — completely free.</p>
                </div>
                <Link href="/become-artist" className="btn-become">
                  <Mic size={15}/> Get started <ChevronRight size={14}/>
                </Link>
              </div>
            )}

            {isArtist && tracks.length > 0 && (
              <div className="content-card">
                <div className="content-card-header">
                  <span className="content-card-title">Recent Tracks</span>
                  <button className="see-all-btn" onClick={() => setActiveTab('tracks')}>See all</button>
                </div>
                {tracks.slice(0, 4).map(track => (
                  <TrackItem key={track.id} track={track} onDelete={deleteTrack} deleting={deletingId === track.id} showStats />
                ))}
              </div>
            )}

            {isArtist && tracks.length === 0 && (
              <div className="content-card">
                <div className="empty-state">
                  <div className="empty-icon" style={{ background: '#DBEAFE' }}>
                    <Upload size={22} color="#2563EB"/>
                  </div>
                  <p className="empty-title">No tracks yet</p>
                  <p className="empty-sub">Upload your first track and start getting discovered on Muzika.</p>
                  <Link href="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 22px', background: '#0D1B3E', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                    <Upload size={14}/> Upload Track
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MY TRACKS TAB ── */}
        {activeTab === 'tracks' && isArtist && (
          <div className="content-card">
            <div className="content-card-header">
              <span className="content-card-title">All Tracks</span>
              <Link href="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 13px', background: '#0D1B3E', color: '#fff', borderRadius: '7px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                <Upload size={12}/> Upload New
              </Link>
            </div>
            {tracks.length === 0
              ? <p style={{ textAlign: 'center', padding: '32px 0', color: '#8B95A8', fontSize: '14px' }}>No tracks yet.</p>
              : tracks.map(track => <TrackItem key={track.id} track={track} onDelete={deleteTrack} deleting={deletingId === track.id} showStats />)
            }
          </div>
        )}

        {/* ── SAVED TAB ── */}
        {activeTab === 'saved' && (
          <div className="content-card">
            <div className="content-card-header">
              <span className="content-card-title">Saved Tracks</span>
            </div>
            {savedTracks.length === 0
              ? (
                <div className="empty-state">
                  <div className="empty-icon" style={{ background: '#FEF3C7' }}><Heart size={22} color="#F59E0B"/></div>
                  <p className="empty-title">Nothing saved yet</p>
                  <p className="empty-sub">Browse songs and tap the bookmark icon to save your favourites here.</p>
                </div>
              )
              : savedTracks.map((s: any) => s.track && <LibraryItem key={s.id} track={s.track} />)
            }
          </div>
        )}

        {/* ── PURCHASED TAB ── */}
        {activeTab === 'purchases' && (
          <div className="content-card">
            <div className="content-card-header">
              <span className="content-card-title">Purchased Tracks</span>
            </div>
            {purchases.length === 0
              ? (
                <div className="empty-state">
                  <div className="empty-icon" style={{ background: '#D1FAE5' }}><ShoppingBag size={22} color="#10B981"/></div>
                  <p className="empty-title">No purchases yet</p>
                  <p className="empty-sub">All tracks are currently free — download anything you love.</p>
                </div>
              )
              : purchases.map((p: any) => p.track && <LibraryItem key={p.id} track={p.track} />)
            }
          </div>
        )}

      </div>
    </>
  )
}

function TrackItem({ track, onDelete, deleting, showStats }: {
  track: Track; onDelete: (id: string) => void; deleting: boolean; showStats?: boolean
}) {
  const bg = ({
    'Afropop':'#1e3a8a','Gospel':'#065f46','Reggae':'#7f1d1d',
    'Hip-Hop':'#4c1d95','RnB':'#78350f','Traditional':'#134e4a',
  } as any)[track.genre] ?? '#0d1b3e'

  return (
    <div className="track-item">
      <div className="track-art-sm" style={{ background: `linear-gradient(135deg,${bg},#0d1b3e)` }}>
        {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
      </div>
      <div className="track-item-info">
        <p className="track-item-name">{track.title}</p>
        <p className="track-item-sub">{track.genre}</p>
      </div>
      {showStats && (
        <div className="track-item-stats">
          <div className="track-stat">
            <p className="track-stat-val">{formatCount(track.play_count || 0)}</p>
            <p className="track-stat-label">Plays</p>
          </div>
          <div className="track-stat">
            <p className="track-stat-val">{formatCount(track.download_count || 0)}</p>
            <p className="track-stat-label">DLs</p>
          </div>
        </div>
      )}
      <button className="btn-delete" onClick={() => onDelete(track.id)} disabled={deleting}>
        {deleting ? <span style={{fontSize:'11px',color:'#8B95A8'}}>…</span> : <Trash2 size={13} color="#EF4444"/>}
      </button>
    </div>
  )
}

function LibraryItem({ track }: { track: any }) {
  const bg = ({
    'Afropop':'#1e3a8a','Gospel':'#065f46','Reggae':'#7f1d1d',
    'Hip-Hop':'#4c1d95','RnB':'#78350f',
  } as any)[track.genre] ?? '#0d1b3e'

  return (
    <div className="track-item">
      <div className="track-art-sm" style={{ background: `linear-gradient(135deg,${bg},#0d1b3e)` }}>
        {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>}
      </div>
      <div className="track-item-info">
        <p className="track-item-name">{track.title}</p>
        <p className="track-item-sub">{track.artist?.stage_name ?? 'Unknown artist'}</p>
      </div>
    </div>
  )
}

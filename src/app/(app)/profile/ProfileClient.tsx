'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Music2, Upload, Play, Download, DollarSign,
  Settings, ChevronRight, Mic, Users, BarChart2,
  BookOpen, Heart, ShoppingBag, Edit3, Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatMWK, formatCount, formatDuration } from '@/lib/utils'
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

type Tab = 'overview' | 'tracks' | 'library' | 'purchases'

function ArtistAvatar({ artist, size = 96 }: { artist: Artist; size?: number }) {
  const colors: Record<string, string> = {
    'Afropop': 'linear-gradient(135deg,#1e3a8a,#2563eb)',
    'Gospel': 'linear-gradient(135deg,#065f46,#059669)',
    'Reggae': 'linear-gradient(135deg,#7f1d1d,#dc2626)',
    'Hip-Hop': 'linear-gradient(135deg,#4c1d95,#7c3aed)',
    'RnB': 'linear-gradient(135deg,#78350f,#d97706)',
    'Traditional': 'linear-gradient(135deg,#134e4a,#0d9488)',
    'Jazz': 'linear-gradient(135deg,#1c1917,#44403c)',
    'Dancehall': 'linear-gradient(135deg,#064e3b,#10b981)',
  }
  const bg = colors[artist.genre] ?? colors['Afropop']
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {artist.avatar_url
        ? <img src={artist.avatar_url} alt={artist.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: size * 0.38, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
            {artist.stage_name.charAt(0).toUpperCase()}
          </span>
      }
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = '#2563EB' }: { label: string; value: string; icon: any; color?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08)', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#8B95A8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'grid', placeItems: 'center' }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <p style={{ fontSize: '24px', fontWeight: 900, color: '#0D1B3E', letterSpacing: '-0.5px' }}>{value}</p>
    </div>
  )
}

export default function ProfileClient({ profile, artist, tracks, totalEarnings, totalPlays, savedTracks, purchases }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isArtist = !!artist

  const deleteTrack = async (trackId: string) => {
    if (!confirm('Delete this track? This cannot be undone.')) return
    setDeletingId(trackId)
    const res = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Track deleted')
      router.refresh()
    } else {
      toast.error('Failed to delete track')
    }
    setDeletingId(null)
  }

  const tabStyle = (tab: Tab) => ({
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    background: activeTab === tab ? '#0D1B3E' : 'transparent',
    color: activeTab === tab ? '#fff' : '#5C677D',
    transition: 'all .15s',
  } as React.CSSProperties)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* ── PROFILE HEADER ── */}
      <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08)' }}>

        {/* Cover banner */}
        <div style={{
          height: '120px',
          background: isArtist
            ? 'linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%)'
            : 'linear-gradient(130deg, #1e293b 0%, #334155 100%)',
          position: 'relative',
        }}>
          {isArtist && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }} viewBox="0 0 900 120" preserveAspectRatio="xMidYMid slice">
              <g stroke="#d4af37" strokeWidth="1.2">
                {[100,200,300,450,600,700,800].map((x, i) => (
                  <line key={i} x1="450" y1="0" x2={x} y2="120"/>
                ))}
              </g>
              <circle cx="450" cy="30" r="50" fill="rgba(59,130,246,0.15)"/>
            </svg>
          )}
        </div>

        <div style={{ padding: '0 28px 24px' }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-44px', marginBottom: '16px' }}>
            <div style={{ border: '4px solid #fff', borderRadius: '50%' }}>
              {isArtist
                ? <ArtistAvatar artist={artist} size={88} />
                : (
                  <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>
                      {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                )
              }
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
              {isArtist && (
                <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#0D1B3E', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  <Upload size={14} /> Upload Track
                </Link>
              )}
              {!isArtist && (
                <Link href="/become-artist" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#2563EB', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  <Mic size={14} /> Become an Artist
                </Link>
              )}
            </div>
          </div>

          {/* Name + details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B3E', letterSpacing: '-0.4px' }}>
                {isArtist ? artist.stage_name : profile?.full_name}
              </h1>
              {isArtist && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DBEAFE', color: '#1d4ed8', borderRadius: '20px', padding: '2px 9px', fontSize: '11px', fontWeight: 700 }}>
                  <Mic size={10} /> Artist
                </div>
              )}
            </div>
            {isArtist && (
              <p style={{ fontSize: '13px', color: '#5C677D', marginBottom: '4px' }}>
                {artist.genre} · {artist.location}
              </p>
            )}
            <p style={{ fontSize: '13px', color: '#8B95A8' }}>
              {profile?.email}
            </p>
            {isArtist && artist.bio && (
              <p style={{ fontSize: '14px', color: '#5C677D', marginTop: '10px', lineHeight: 1.6, maxWidth: '560px' }}>
                {artist.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── ARTIST STATS (only for artists) ── */}
      {isArtist && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <StatCard label="Total Tracks" value={String(tracks.length)} icon={Music2} color="#2563EB" />
          <StatCard label="Total Plays" value={formatCount(totalPlays)} icon={Play} color="#10B981" />
          <StatCard label="Downloads" value={formatCount(tracks.reduce((s, t) => s + (t.download_count || 0), 0))} icon={Download} color="#F59E0B" />
          <StatCard label="Earnings" value={formatMWK(totalEarnings)} icon={DollarSign} color="#8B5CF6" />
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: '4px', background: '#fff', borderRadius: '10px', padding: '4px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(13,27,62,.06)' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        {isArtist && (
          <button style={tabStyle('tracks')} onClick={() => setActiveTab('tracks')}>
            My Tracks ({tracks.length})
          </button>
        )}
        <button style={tabStyle('library')} onClick={() => setActiveTab('library')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Heart size={13} /> Saved ({savedTracks.length})</span>
        </button>
        <button style={tabStyle('purchases')} onClick={() => setActiveTab('purchases')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShoppingBag size={13} /> Purchased ({purchases.length})</span>
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isArtist && (
            <div style={{ background: 'linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%)', borderRadius: '16px', padding: '28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>Ready to share your music?</p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Become an Artist on Muzika</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '360px', lineHeight: 1.6 }}>
                  Upload your tracks, set your own prices, and earn 85% of every download. It takes 2 minutes.
                </p>
              </div>
              <Link href="/become-artist" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: '#fff', color: '#0D1B3E', borderRadius: '10px', fontSize: '14px', fontWeight: 800, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
                <Mic size={15} /> Get started <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {isArtist && tracks.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E' }}>Recent Tracks</h3>
                <button style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, color: '#2563EB', cursor: 'pointer' }} onClick={() => setActiveTab('tracks')}>See all</button>
              </div>
              {tracks.slice(0, 4).map((track) => (
                <TrackRow key={track.id} track={track} onDelete={deleteTrack} deleting={deletingId === track.id} />
              ))}
            </div>
          )}

          {isArtist && tracks.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(13,27,62,.06)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#DBEAFE', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <Upload size={24} color="#2563EB" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B3E', marginBottom: '6px' }}>No tracks yet</h3>
              <p style={{ fontSize: '14px', color: '#8B95A8', marginBottom: '20px' }}>Upload your first track to start selling on Muzika</p>
              <Link href="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 22px', background: '#0D1B3E', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Upload size={14} /> Upload Track
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── MY TRACKS TAB ── */}
      {activeTab === 'tracks' && isArtist && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E' }}>All Tracks</h3>
            <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#0D1B3E', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              <Upload size={13} /> Upload New
            </Link>
          </div>
          {tracks.length === 0
            ? <p style={{ textAlign: 'center', padding: '32px 0', color: '#8B95A8', fontSize: '14px' }}>No tracks yet. Upload your first one!</p>
            : tracks.map(track => <TrackRow key={track.id} track={track} onDelete={deleteTrack} deleting={deletingId === track.id} showStats />)
          }
        </div>
      )}

      {/* ── SAVED TAB ── */}
      {activeTab === 'library' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>Saved Tracks</h3>
          {savedTracks.length === 0
            ? <p style={{ textAlign: 'center', padding: '32px 0', color: '#8B95A8', fontSize: '14px' }}>No saved tracks yet. Browse songs and save your favourites.</p>
            : savedTracks.map((s: any) => s.track && (
              <LibraryRow key={s.id} track={s.track} />
            ))
          }
        </div>
      )}

      {/* ── PURCHASES TAB ── */}
      {activeTab === 'purchases' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(13,27,62,.06), 0 4px 16px rgba(13,27,62,.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>Purchased Tracks</h3>
          {purchases.length === 0
            ? <p style={{ textAlign: 'center', padding: '32px 0', color: '#8B95A8', fontSize: '14px' }}>No purchases yet. Buy tracks to download them forever.</p>
            : purchases.map((p: any) => p.track && (
              <LibraryRow key={p.id} track={p.track} showPrice amount={p.amount_mwk} />
            ))
          }
        </div>
      )}
    </div>
  )
}

function TrackRow({ track, onDelete, deleting, showStats }: { track: Track; onDelete: (id: string) => void; deleting: boolean; showStats?: boolean }) {
  const artColors: Record<string, string> = {
    'Afropop': '#1e3a8a', 'Gospel': '#065f46', 'Reggae': '#7f1d1d',
    'Hip-Hop': '#4c1d95', 'RnB': '#78350f', 'Traditional': '#134e4a',
    'Jazz': '#1c1917', 'Dancehall': '#064e3b',
  }
  const bg = artColors[track.genre] ?? '#0d1b3e'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F4F6FB' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: `linear-gradient(135deg, ${bg}, #0d1b3e)`, flexShrink: 0, overflow: 'hidden' }}>
        {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
        <p style={{ fontSize: '12px', color: '#8B95A8', marginTop: '1px' }}>{track.genre}</p>
      </div>
      {showStats && (
        <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{formatCount(track.play_count || 0)}</p>
            <p style={{ fontSize: '10px', color: '#8B95A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plays</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{formatCount(track.download_count || 0)}</p>
            <p style={{ fontSize: '10px', color: '#8B95A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sales</p>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ background: '#FEF3C7', color: '#F59E0B', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
          {formatMWK(track.price_mwk)}
        </span>
        <button
          onClick={() => onDelete(track.id)}
          disabled={deleting}
          style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#FEF2F2', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s' }}
        >
          {deleting ? '…' : <Trash2 size={13} color="#EF4444" />}
        </button>
      </div>
    </div>
  )
}

function LibraryRow({ track, showPrice, amount }: { track: any; showPrice?: boolean; amount?: number }) {
  const artColors: Record<string, string> = {
    'Afropop': '#1e3a8a', 'Gospel': '#065f46', 'Reggae': '#7f1d1d',
    'Hip-Hop': '#4c1d95', 'RnB': '#78350f',
  }
  const bg = artColors[track.genre] ?? '#0d1b3e'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F4F6FB' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: `linear-gradient(135deg, ${bg}, #0d1b3e)`, flexShrink: 0, overflow: 'hidden' }}>
        {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</p>
        <p style={{ fontSize: '12px', color: '#8B95A8', marginTop: '1px' }}>{track.artist?.stage_name ?? 'Unknown artist'}</p>
      </div>
      {showPrice && amount && (
        <span style={{ background: '#F0FDF4', color: '#10B981', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>
          {formatMWK(amount)}
        </span>
      )}
    </div>
  )
}

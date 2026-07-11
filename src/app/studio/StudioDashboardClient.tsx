'use client'

import Link from 'next/link'
import { Upload, Music2, Mic2, Disc3, TrendingUp, Users, Play, DollarSign, ChevronRight } from 'lucide-react'

interface Props {
  artist: { id: string; stage_name: string; genre: string; creator_type?: 'artist' | 'podcast_creator' }
  topTracks: any[]
  stats: { totalPlays: number; totalFollowers: number; totalEarnings: number; totalTracks: number }
}

export default function StudioDashboardClient({ artist, topTracks, stats }: Props) {
  const isPodcast = artist.creator_type === 'podcast_creator'
  const statCards = isPodcast ? [
    { label: 'Total Plays',     value: stats.totalPlays.toLocaleString(),    icon: Play,        color: '#2563eb' },
    { label: 'Followers',       value: stats.totalFollowers.toLocaleString(), icon: Users,       color: '#059669' },
    { label: 'Episodes',        value: stats.totalTracks.toString(),          icon: Mic2,        color: '#0abab5' },
  ] : [
    { label: 'Total Plays',     value: stats.totalPlays.toLocaleString(),    icon: Play,        color: '#2563eb' },
    { label: 'Followers',       value: stats.totalFollowers.toLocaleString(), icon: Users,       color: '#059669' },
    { label: 'Tracks',          value: stats.totalTracks.toString(),          icon: Music2,      color: '#7c3aed' },
    { label: 'Earnings (MWK)',  value: `MK ${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: '#d97706' },
  ]

  return (
    <div style={{ padding: '28px 24px 100px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ color: '#555', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Welcome back</p>
        <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>{artist.stage_name}</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'grid', placeItems: 'center' }}>
                <Icon size={15} style={{ color }} />
              </div>
              <span style={{ color: '#555', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            </div>
            <p style={{ color: '#fff', fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '28px' }}>
        <Link href="/studio/upload" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isPodcast ? '#0abab5' : '#2563eb', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: '#fff' }}>
          <Upload size={18} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>{isPodcast ? 'Upload Episode' : 'Upload Music'}</p>
            <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>{isPodcast ? 'New episode' : 'Track or album'}</p>
          </div>
        </Link>
        {isPodcast ? (
          <Link href="/studio/podcasts" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: '#fff' }}>
            <Mic2 size={18} style={{ color: '#0abab5' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>My Podcasts</p>
              <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>Manage shows</p>
            </div>
          </Link>
        ) : (
          <Link href="/studio/albums" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: '#fff' }}>
            <Disc3 size={18} style={{ color: '#7c3aed' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>My Albums</p>
              <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>Manage releases</p>
            </div>
          </Link>
        )}
      </div>

      {/* Top tracks/episodes */}
      {topTracks.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0 }}>{isPodcast ? 'Top Episodes' : 'Top Tracks'}</h2>
            <Link href={isPodcast ? '/studio/podcasts' : '/studio/tracks'} style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {topTracks.map((track: any, i: number) => (
              <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#161616', border: '1px solid #1f1f1f', borderRadius: '10px' }}>
                <span style={{ color: '#555', fontSize: '13px', fontWeight: 700, width: '20px', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '7px', overflow: 'hidden', background: '#0d1b3e', flexShrink: 0 }}>
                  {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                  <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>{track.genre}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b3b3b3', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                  <TrendingUp size={12} style={{ color: '#2563eb' }} />
                  {(track.play_count ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

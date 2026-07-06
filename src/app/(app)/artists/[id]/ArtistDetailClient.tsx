'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BadgeCheck, Play, Music2, Disc3, Clock, Globe, ExternalLink, Megaphone, Calendar } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import { usePlayerStore } from '@/store/player'
import { fetchStreamUrl } from '@/lib/stream-cache'
import { formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import TrackRow from '@/components/track/TrackRow'
import MobileTopBar from '@/components/layout/MobileTopBar'
import type { Artist, Track } from '@/types'

const GENRE_BG: Record<string, string> = {
  'Afropop': 'linear-gradient(135deg,#1e3a8a,#2563eb)',
  'Gospel': 'linear-gradient(135deg,#065f46,#059669)',
  'Reggae': 'linear-gradient(135deg,#7f1d1d,#dc2626)',
  'Hip-Hop': 'linear-gradient(135deg,#4c1d95,#7c3aed)',
  'RnB': 'linear-gradient(135deg,#78350f,#d97706)',
  'Traditional': 'linear-gradient(135deg,#134e4a,#0d9488)',
  'Amapiano': 'linear-gradient(135deg,#831843,#db2777)',
  'Jazz': 'linear-gradient(135deg,#1c1917,#44403c)',
  'Dancehall': 'linear-gradient(135deg,#064e3b,#10b981)',
}

interface Props {
  artist: Artist & { is_following?: boolean; social_links?: Record<string, string> }
  tracks: Track[]
  albums: any[]
  scheduledTracks?: any[]
  scheduledAlbums?: any[]
  bannerRequest?: any
  isOwnProfile?: boolean
  userId: string | null
}

const SOCIAL_META: Record<string, { icon: () => React.ReactElement; color: string; label: string }> = {
  instagram: {
    icon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    color: '#E1306C', label: 'Instagram',
  },
  twitter: {
    icon: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    color: '#1DA1F2', label: 'X / Twitter',
  },
  facebook: {
    icon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    color: '#1877F2', label: 'Facebook',
  },
  youtube: {
    icon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    color: '#FF0000', label: 'YouTube',
  },
  website: {
    icon: () => <Globe size={14} />,
    color: '#60a5fa', label: 'Website',
  },
}

export default function ArtistDetailClient({
  artist, tracks, albums, scheduledTracks = [], scheduledAlbums = [],
  bannerRequest, isOwnProfile, userId,
}: Props) {
  const router = useRouter()
  const { play } = usePlayerStore()
  const [following, setFollowing] = useState(artist.is_following ?? false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks')
  const [bannerMsg, setBannerMsg] = useState(bannerRequest?.message ?? '')
  const [requestingBanner, setRequestingBanner] = useState(false)
  const [localBannerRequest, setLocalBannerRequest] = useState(bannerRequest)

  const bg = GENRE_BG[artist.genre] ?? GENRE_BG['Afropop']
  const socialLinks = (artist as any).social_links ?? {}

  const handleFollow = async () => {
    if (!userId) { notify.error('Sign in to follow artists'); return }
    setFollowLoading(true)
    const res = await fetch(`/api/artists/${artist.id}/follow`, { method: 'POST' })
    const data = await res.json()
    setFollowing(data.following)
    setFollowLoading(false)
  }

  const playAll = async () => {
    if (tracks.length === 0) return
    const url = await fetchStreamUrl(tracks[0].id)
    if (!url) { notify.error('Could not load track'); return }
    play({ ...tracks[0], audio_url: url }, tracks)
    router.push('/now-playing')
  }

  const requestBanner = async () => {
    setRequestingBanner(true)
    const res = await fetch('/api/banner-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: bannerMsg }),
    })
    const data = await res.json()
    setRequestingBanner(false)
    if (res.ok) {
      setLocalBannerRequest(data.request)
      notify.success('Banner request sent', 'Our team will review it shortly.')
    } else {
      notify.error(data.error ?? 'Could not submit request')
    }
  }

  const statusColor = (s: string) => s === 'approved' ? '#4ade80' : s === 'rejected' ? '#f87171' : '#fbbf24'
  const statusLabel = (s: string) => s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : 'Pending review'

  return (
    <div>
      <MobileTopBar eyebrow="Artist" title={artist.stage_name} />

      <div className="max-w-[760px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <Link href="/artists" className="hidden md:inline-flex items-center gap-1.5 text-[#b3b3b3] hover:text-white text-sm font-semibold mb-6">
          <ChevronLeft size={16} /> Artists
        </Link>

        {/* Header */}
        <div className="flex items-center gap-5 mb-8 flex-wrap">
          <div className="w-28 h-28 rounded-full flex-shrink-0 grid place-items-center overflow-hidden" style={{ background: bg }}>
            {artist.avatar_url
              ? <img src={artist.avatar_url} alt={artist.stage_name} className="w-full h-full object-cover" />
              : <span className="text-5xl font-black text-white/80">{artist.stage_name.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight">{artist.stage_name}</h1>
              {artist.verified && <BadgeCheck size={18} className="text-blue-500 flex-shrink-0" />}
            </div>
            <p className="text-sm text-[#b3b3b3] mb-3">
              {artist.genre} · {artist.location} · {formatCount(artist.follower_count ?? 0)} followers
            </p>
            <div className="flex gap-2 flex-wrap">
              {tracks.length > 0 && (
                <button onClick={playAll}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                  <Play size={14} fill="white" /> Play All
                </button>
              )}
              {!isOwnProfile && (
                <button onClick={handleFollow} disabled={followLoading}
                  className={cn('flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-full border-2 transition-colors',
                    following ? 'border-white/20 text-white/70 hover:border-red-400 hover:text-red-400' : 'border-white text-white hover:bg-white hover:text-black'
                  )}>
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-[#b3b3b3] text-sm leading-relaxed mb-6">{artist.bio}</p>
        )}

        {/* Social links */}
        {Object.keys(socialLinks).some(k => socialLinks[k]) && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            {Object.entries(SOCIAL_META).map(([key, meta]) => {
              const url = socialLinks[key]
              if (!url) return null
              return (
                <a key={key} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#181818] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors text-sm font-medium text-[#b3b3b3] hover:text-white">
                  <span style={{ color: meta.color }}><meta.icon /></span>
                  {meta.label}
                  <ExternalLink size={10} className="opacity-40" />
                </a>
              )
            })}
          </div>
        )}

        {/* Scheduled releases — only shown to own artist */}
        {isOwnProfile && (scheduledTracks.length > 0 || scheduledAlbums.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={15} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Releases</h2>
            </div>
            <div className="space-y-2">
              {[...scheduledTracks.map(t => ({ ...t, _type: 'track' })), ...scheduledAlbums.map(a => ({ ...a, _type: 'album' }))]
                .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
                .map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-[#181818] border border-amber-500/20 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#282828] flex-shrink-0 grid place-items-center">
                      {item.cover_url ? <img src={item.cover_url} alt="" className="w-full h-full object-cover" /> : item._type === 'album' ? <Disc3 size={16} className="text-[#555]" /> : <Music2 size={16} className="text-[#555]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.title}</p>
                      <p className="text-xs text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {item._type === 'album' ? 'Album' : 'Track'} · Goes live {new Date(item.release_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#181818] rounded-xl p-1 mb-6">
          {(['tracks', 'albums'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all',
                activeTab === tab ? 'bg-white text-black' : 'text-[#b3b3b3] hover:text-white'
              )}>
              {tab === 'tracks' ? <Music2 size={14} /> : <Disc3 size={14} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="text-xs opacity-60">
                {tab === 'tracks' ? tracks.length : albums.length}
              </span>
            </button>
          ))}
        </div>

        {/* Tracks tab */}
        {activeTab === 'tracks' && (
          tracks.length === 0
            ? <div className="text-center py-12 text-[#555] text-sm">No tracks yet</div>
            : <div className="space-y-1">
                {tracks.map((t, i) => <TrackRow key={t.id} track={t} rank={i + 1} userId={userId} queue={tracks} showRank={false} />)}
              </div>
        )}

        {/* Albums tab */}
        {activeTab === 'albums' && (
          albums.length === 0
            ? <div className="text-center py-12 text-[#555] text-sm">No albums yet</div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {albums.map(album => (
                  <Link key={album.id} href={`/albums/${album.id}`}>
                    <div className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#202020] transition-colors cursor-pointer">
                      <div className="aspect-square bg-[#0d1b3e] grid place-items-center overflow-hidden">
                        {album.cover_url
                          ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                          : <Disc3 size={36} className="text-[#2a2a2a]" />
                        }
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-bold text-white truncate">{album.title}</p>
                        <p className="text-xs text-[#717171] mt-0.5">
                          {album.tracks?.[0]?.count ?? 0} tracks · {new Date(album.created_at).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
        )}

        {/* Banner request section — only for own artist */}
        {isOwnProfile && (
          <div className="mt-10 border-t border-[#1f1f1f] pt-8">
            <div className="flex items-center gap-2.5 mb-4">
              <Megaphone size={16} className="text-blue-400" />
              <h2 className="text-base font-black text-white">Request Home Banner</h2>
            </div>

            {localBannerRequest ? (
              <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Banner Request</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${statusColor(localBannerRequest.status)}15`, color: statusColor(localBannerRequest.status) }}>
                    {statusLabel(localBannerRequest.status)}
                  </span>
                </div>
                {localBannerRequest.message && (
                  <p className="text-[#717171] text-sm mb-2">"{localBannerRequest.message}"</p>
                )}
                {localBannerRequest.admin_note && (
                  <p className="text-sm text-[#b3b3b3] bg-[#111] rounded-lg px-3 py-2 mt-2">
                    <span className="font-bold text-white">Admin note: </span>{localBannerRequest.admin_note}
                  </p>
                )}
                {localBannerRequest.status === 'rejected' && (
                  <button onClick={() => setLocalBannerRequest(null)}
                    className="mt-3 text-xs text-blue-400 font-bold hover:underline">
                    Submit new request
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4">
                <p className="text-sm text-[#b3b3b3] mb-4">
                  Request to have your music featured in the promotional banner on the Muzika home page.
                  Our team will review your request and get back to you.
                </p>
                <textarea
                  value={bannerMsg}
                  onChange={e => setBannerMsg(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your release and why it should be featured… (optional)"
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all resize-none mb-3"
                />
                <button onClick={requestBanner} disabled={requestingBanner}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60">
                  {requestingBanner ? 'Submitting…' : <><Megaphone size={14} /> Request Feature Slot</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

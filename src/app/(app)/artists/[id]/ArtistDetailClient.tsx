'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Play, Music2, Disc3 } from 'lucide-react'
import { toast } from 'sonner'
import { usePlayerStore } from '@/store/player'
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
  'Jazz': 'linear-gradient(135deg,#1c1917,#44403c)',
  'Dancehall': 'linear-gradient(135deg,#064e3b,#10b981)',
}

interface Props {
  artist: Artist
  tracks: Track[]
  albums: any[]
  userId: string | null
}

export default function ArtistDetailClient({ artist, tracks, albums, userId }: Props) {
  const router = useRouter()
  const { play } = usePlayerStore()
  const [following, setFollowing] = useState(artist.is_following ?? false)
  const [followLoading, setFollowLoading] = useState(false)

  const bg = GENRE_BG[artist.genre] ?? GENRE_BG['Afropop']

  const handleFollow = async () => {
    if (!userId) { toast.error('Sign in to follow artists'); return }
    setFollowLoading(true)
    const res = await fetch(`/api/artists/${artist.id}/follow`, { method: 'POST' })
    const data = await res.json()
    setFollowing(data.following)
    setFollowLoading(false)
  }

  const playAll = async () => {
    if (tracks.length === 0) return
    const res = await fetch(`/api/tracks/${tracks[0].id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...tracks[0], audio_url: data.url }, tracks)
    router.push('/now-playing')
  }

  return (
    <div>
      <MobileTopBar eyebrow="Artist" title={artist.stage_name} />

      <div className="max-w-[760px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <Link href="/artists" className="hidden md:inline-flex items-center gap-1.5 text-[#b3b3b3] hover:text-white text-sm font-semibold mb-6">
          <ChevronLeft size={16} /> Artists
        </Link>

        {/* Header */}
        <div className="flex items-center gap-5 mb-8 flex-wrap">
          <div
            className="w-28 h-28 rounded-full flex-shrink-0 grid place-items-center overflow-hidden"
            style={{ background: bg }}
          >
            {artist.avatar_url
              ? <img src={artist.avatar_url} alt={artist.stage_name} className="w-full h-full object-cover" />
              : <span className="text-5xl font-black text-white/80">{artist.stage_name.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white tracking-tight">{artist.stage_name}</h1>
              {artist.verified && <CheckCircle2 size={18} className="text-blue-400 flex-shrink-0" fill="#60a5fa" stroke="#121212" />}
            </div>
            <p className="text-sm text-[#b3b3b3] mb-3">{artist.genre} · {artist.location} · {formatCount(artist.follower_count)} followers</p>
            {artist.bio && <p className="text-sm text-[#b3b3b3] leading-relaxed mb-3 max-w-md">{artist.bio}</p>}
            <div className="flex gap-2">
              <button
                onClick={playAll}
                disabled={tracks.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <Play size={14} fill="black" /> Play
              </button>
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-bold transition-all',
                  following ? 'bg-[#2a2a2a] text-white' : 'bg-transparent border-[1.5px] border-[#717171] text-white hover:border-white'
                )}
              >
                {followLoading ? '…' : following ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[17px] font-black text-white mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {albums.map((album: any) => (
                <div key={album.id} className="bg-[#181818] rounded-xl overflow-hidden">
                  <div className="aspect-square grid place-items-center" style={{ background: bg }}>
                    {album.cover_url
                      ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                      : <Disc3 size={32} className="text-white/30" />
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-bold text-white truncate">{album.title}</p>
                    <p className="text-xs text-[#717171] mt-0.5">{album.tracks?.[0]?.count ?? 0} tracks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracks */}
        <div>
          <h2 className="text-[17px] font-black text-white mb-4">Songs</h2>
          {tracks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#181818] grid place-items-center mx-auto mb-4">
                <Music2 size={24} className="text-[#717171]" />
              </div>
              <p className="text-[#717171] text-sm">No tracks published yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {tracks.map((track, i) => (
                <TrackRow key={track.id} track={track} rank={i + 1} userId={userId} queue={tracks} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

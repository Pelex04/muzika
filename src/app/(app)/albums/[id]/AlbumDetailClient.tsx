'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Play, Disc3 } from 'lucide-react'
import { toast } from 'sonner'
import { usePlayerStore } from '@/store/player'
import { fetchStreamUrl } from '@/lib/stream-cache'
import MobileTopBar from '@/components/layout/MobileTopBar'
import TrackRow from '@/components/track/TrackRow'
import type { Track } from '@/types'

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
  album: any
  tracks: Track[]
  userId: string | null
}

export default function AlbumDetailClient({ album, tracks, userId }: Props) {
  const router = useRouter()
  const { play } = usePlayerStore()
  const bg = GENRE_BG[album.genre] ?? GENRE_BG['Afropop']

  const playAll = async () => {
    if (tracks.length === 0) return
    const _streamUrl = await fetchStreamUrl(tracks[0].id)
    if (!_streamUrl) { toast.error('Could not load track'); return }
    play({ ...tracks[0], audio_url: _streamUrl }, tracks)
    router.push('/now-playing')
  }

  return (
    <div>
      <MobileTopBar eyebrow="Album" title={album.title} />

      <div className="max-w-[760px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <Link href="/songs" className="hidden md:inline-flex items-center gap-1.5 text-[#b3b3b3] hover:text-white text-sm font-semibold mb-6">
          <ChevronLeft size={16} /> Back
        </Link>

        <div className="flex items-center gap-5 mb-8 flex-wrap">
          <div className="w-28 h-28 rounded-xl flex-shrink-0 grid place-items-center overflow-hidden" style={{ background: bg }}>
            {album.cover_url
              ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
              : <Disc3 size={40} className="text-white/30" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#717171] uppercase tracking-wide font-bold mb-1">Album</p>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">{album.title}</h1>
            {album.artist && (
              <Link href={`/artists/${album.artist.id}`} className="text-sm text-[#b3b3b3] hover:text-white hover:underline">
                {album.artist.stage_name}
              </Link>
            )}
            <p className="text-sm text-[#717171] mt-1 mb-3">{tracks.length} track{tracks.length === 1 ? '' : 's'} · {album.genre}</p>
            <button
              onClick={playAll}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 disabled:opacity-40 transition-colors"
            >
              <Play size={14} fill="black" /> Play
            </button>
          </div>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#717171] text-sm">No tracks in this album yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {tracks.map((track, i) => (
              <TrackRow key={track.id} track={track} rank={track.track_number ?? i + 1} userId={userId} queue={tracks} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

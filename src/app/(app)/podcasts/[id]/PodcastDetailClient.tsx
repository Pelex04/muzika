'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Play, Mic2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePlayerStore } from '@/store/player'
import { fetchStreamUrl } from '@/lib/stream-cache'
import MobileTopBar from '@/components/layout/MobileTopBar'
import TrackRow from '@/components/track/TrackRow'
import type { Track } from '@/types'

interface Props {
  podcast: any
  episodes: Track[]
  userId: string | null
}

export default function PodcastDetailClient({ podcast, episodes, userId }: Props) {
  const router = useRouter()
  const { play } = usePlayerStore()

  // Episodes without their own cover fall back to the show's artwork
  const episodesWithCover = episodes.map(e => ({ ...e, cover_url: e.cover_url ?? podcast.cover_url }))

  const playAll = async () => {
    if (episodesWithCover.length === 0) return
    const streamUrl = await fetchStreamUrl(episodesWithCover[0].id)
    if (!streamUrl) { toast.error('Could not load episode'); return }
    play({ ...episodesWithCover[0], audio_url: streamUrl }, episodesWithCover)
    router.push('/now-playing')
  }

  return (
    <div>
      <MobileTopBar eyebrow="Podcast" title={podcast.title} />

      <div className="max-w-[760px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <Link href="/podcasts" className="hidden md:inline-flex items-center gap-1.5 text-[#b3b3b3] hover:text-white text-sm font-semibold mb-6">
          <ChevronLeft size={16} /> Back
        </Link>

        <div className="flex items-center gap-5 mb-6 flex-wrap">
          <div className="w-28 h-28 rounded-xl flex-shrink-0 grid place-items-center overflow-hidden bg-[#0d1b3e]">
            {podcast.cover_url
              ? <img src={podcast.cover_url} alt={podcast.title} className="w-full h-full object-cover" />
              : <Mic2 size={40} className="text-white/30" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#717171] uppercase tracking-wide font-bold mb-1">Podcast{podcast.category ? ` · ${podcast.category}` : ''}</p>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">{podcast.title}</h1>
            {podcast.artist && (
              <Link href={`/artists/${podcast.artist.id}`} className="text-sm text-[#b3b3b3] hover:text-white hover:underline">
                {podcast.artist.stage_name}
              </Link>
            )}
            <p className="text-sm text-[#717171] mt-1 mb-3">{episodes.length} episode{episodes.length === 1 ? '' : 's'}</p>
            <button
              onClick={playAll}
              disabled={episodesWithCover.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 disabled:opacity-40 transition-colors"
            >
              <Play size={14} fill="black" /> Play Latest
            </button>
          </div>
        </div>

        {podcast.description && (
          <p className="text-sm text-[#b3b3b3] leading-relaxed mb-8">{podcast.description}</p>
        )}

        {episodesWithCover.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#717171] text-sm">No episodes yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {episodesWithCover.map((ep, i) => (
              <TrackRow key={ep.id} track={ep} rank={ep.episode_number ?? i + 1} userId={userId} queue={episodesWithCover} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

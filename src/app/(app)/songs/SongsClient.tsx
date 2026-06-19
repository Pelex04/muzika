'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import TrackRow from '@/components/track/TrackRow'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'

const GENRES = ['All', 'Afropop', 'Gospel', 'Reggae', 'Hip-Hop', 'RnB', 'Traditional', 'Jazz']

interface Props {
  tracks: Track[]
  userId: string | null
  activeGenre?: string
}

export default function SongsClient({ tracks, userId, activeGenre }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = tracks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist?.stage_name?.toLowerCase().includes(search.toLowerCase())
  )

  const setGenre = (g: string) => {
    const params = g === 'All' ? '' : `?genre=${g}`
    router.push(`/songs${params}`)
  }

  return (
    <div>
      {/* Mobile top bar */}
      <MobileTopBar eyebrow="Malawi Top" title="Songs" />

      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[.7px] mb-1">Malawi Top</p>
            <h1 className="text-3xl font-black text-[#0D1B3E] tracking-tight">Songs</h1>
          </div>
          <button className="w-9 h-9 rounded-[9px] bg-[#F4F6FB] grid place-items-center text-[#5C677D] hover:bg-[#ECEEF5]">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border-[1.5px] border-[#E2E5F0] rounded-xl px-4 py-3 mb-5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-[#8B95A8] flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-[#0D1B3E] outline-none placeholder:text-[#8B95A8]"
            placeholder="Search songs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Genre filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={cn(
                'px-4 py-1.5 rounded-full border-[1.5px] text-[13px] font-semibold whitespace-nowrap transition-all flex-shrink-0',
                (g === 'All' ? !activeGenre : activeGenre === g)
                  ? 'bg-[#0D1B3E] border-[#0D1B3E] text-white'
                  : 'bg-white border-[#E2E5F0] text-[#5C677D] hover:border-blue-500 hover:text-blue-600'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-black text-[#0D1B3E] tracking-tight">
            {activeGenre ? `${activeGenre} Songs` : 'Top Songs'}
          </h2>
          <span className="text-sm text-[#8B95A8]">{filtered.length} tracks</span>
        </div>

        {/* Track list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#8B95A8]">
            <p className="text-lg font-semibold mb-2">No tracks found</p>
            <p className="text-sm">Try a different genre or search term</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                rank={i + 1}
                userId={userId}
                queue={filtered}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

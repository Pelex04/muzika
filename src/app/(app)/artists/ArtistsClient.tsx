'use client'

import { useState } from 'react'
import { Search, Mic } from 'lucide-react'
import ArtistCard from '@/components/artist/ArtistCard'
import type { Artist } from '@/types'

interface Props { artists: Artist[]; userId: string | null }

export default function ArtistsClient({ artists, userId }: Props) {
  const [search, setSearch] = useState('')

  const filtered = artists.filter(a =>
    !search ||
    a.stage_name.toLowerCase().includes(search.toLowerCase()) ||
    a.genre.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#E2E5F0] sticky top-0 z-40">
        <div>
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[.7px]">Browse</p>
          <h1 className="text-[22px] font-black text-[#0D1B3E] tracking-tight">Artists</h1>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[.7px] mb-1">Browse</p>
          <h1 className="text-3xl font-black text-[#0D1B3E] tracking-tight">Artists</h1>
        </div>

        <div className="flex items-center gap-3 bg-white border-[1.5px] border-[#E2E5F0] rounded-xl px-4 py-3 mb-5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-[#8B95A8] flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-[#0D1B3E] outline-none placeholder:text-[#8B95A8]"
            placeholder="Search artists…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Mic className="w-4 h-4 text-[#8B95A8] flex-shrink-0" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-black text-[#0D1B3E] tracking-tight">Latest Artists</h2>
          <span className="text-sm text-[#8B95A8]">{filtered.length} artists</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#8B95A8]">
            <p className="text-lg font-semibold">No artists found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filtered.map(artist => (
              <ArtistCard key={artist.id} artist={artist} userId={userId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

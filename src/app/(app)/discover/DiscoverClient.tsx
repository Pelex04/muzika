'use client'

import { Bell, User, Search, Mic } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import type { Track, Artist } from '@/types'
import TrackCard from '@/components/track/TrackCard'
import ArtistCard from '@/components/artist/ArtistCard'
import HeroBanner from '@/components/track/HeroBanner'
import QuickNav from '@/components/layout/QuickNav'

interface Props {
  trendingTracks: Track[]
  tracks: Track[]
  artists: Artist[]
  userId: string | null
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

export default function DiscoverClient({ trendingTracks, tracks, artists, userId }: Props) {
  const greeting = getGreeting()
  return (
    <div>
      {/* Mobile Top Bar */}
      <MobileTopBar eyebrow={greeting} title="Discover" />

      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[.7px] mb-1">{greeting}</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Discover</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-[9px] bg-[#282828] grid place-items-center text-[#b3b3b3] hover:bg-[#3a3a3a]"><Bell className="w-4 h-4" /></button>
            <button className="w-9 h-9 rounded-[9px] bg-[#282828] grid place-items-center text-[#b3b3b3] hover:bg-[#3a3a3a]"><User className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-[#181818] border-[1.5px] border-[#2a2a2a] rounded-xl px-4 py-3 mb-5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-[#717171] flex-shrink-0" />
          <input className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#717171]" placeholder="Artists, songs, albums, videos…" />
          <Mic className="w-4 h-4 text-[#717171] flex-shrink-0" />
        </div>

        {/* Hero Banner */}
        {trendingTracks.length > 0 && <HeroBanner tracks={trendingTracks} />}

        {/* Quick Nav */}
        <QuickNav active="home" />

        {/* New Releases */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-black text-white tracking-tight">New Releases</h2>
          <a href="/songs" className="text-sm font-bold text-blue-600 hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-8">
          {tracks.slice(0, 4).map(track => (
            <TrackCard key={track.id} track={track} userId={userId} />
          ))}
        </div>

        {/* Featured Artists */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-black text-white tracking-tight">Featured Artists</h2>
          <a href="/artists" className="text-sm font-bold text-blue-600 hover:underline">See all</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-8">
          {artists.slice(0, 4).map(artist => (
            <ArtistCard key={artist.id} artist={artist} userId={userId} />
          ))}
        </div>
      </div>
    </div>
  )
}

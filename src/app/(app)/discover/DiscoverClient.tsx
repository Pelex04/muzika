'use client'

import { useRef } from 'react'
import { Search, Mic, ChevronRight, Music2 } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import TrackCard from '@/components/track/TrackCard'
import TrackRow from '@/components/track/TrackRow'
import ArtistCard from '@/components/artist/ArtistCard'
import HeroBanner from '@/components/track/HeroBanner'
import QuickNav from '@/components/layout/QuickNav'
import Link from 'next/link'
import type { Track, Artist } from '@/types'

interface Props {
  trendingTracks: Track[]
  tracks: Track[]
  artists: Artist[]
  popularTracks: Track[]
  userId: string | null
  profile?: { avatar_url: string | null; full_name: string } | null
  promotion?: {
    label: string; title: string; subtitle: string;
    cta_text: string; cta_url: string; gradient: string
  } | null
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

// Horizontal scroll row — mouse drag + touch swipe
function HScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  let isDown = false
  let startX = 0
  let scrollLeft = 0

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return
    isDown = true
    startX = e.pageX - ref.current.offsetLeft
    scrollLeft = ref.current.scrollLeft
    ref.current.style.cursor = 'grabbing'
  }
  const onMouseLeave = () => { isDown = false; if (ref.current) ref.current.style.cursor = 'grab' }
  const onMouseUp = () => { isDown = false; if (ref.current) ref.current.style.cursor = 'grab' }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    ref.current.scrollLeft = scrollLeft - (x - startX) * 1.4
  }

  return (
    <div
      ref={ref}
      className={`flex gap-3.5 overflow-x-auto pb-2 select-none ${className}`}
      style={{ cursor: 'grab', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  )
}

const GENRES = [
  { name: 'Afropop', emoji: '🎵', color: 'from-blue-800 to-blue-950' },
  { name: 'Gospel', emoji: '✝️', color: 'from-emerald-800 to-emerald-950' },
  { name: 'Hip-Hop', emoji: '🎤', color: 'from-purple-800 to-purple-950' },
  { name: 'Reggae', emoji: '🌿', color: 'from-red-800 to-red-950' },
  { name: 'RnB', emoji: '🎶', color: 'from-orange-800 to-orange-950' },
  { name: 'Jazz', emoji: '🎷', color: 'from-yellow-800 to-yellow-950' },
  { name: 'Traditional', emoji: '🥁', color: 'from-teal-800 to-teal-950' },
]

export default function DiscoverClient({ trendingTracks, tracks, artists, popularTracks, userId, profile, promotion }: Props) {
  const greeting = getGreeting()

  return (
    <div style={{ background: '#121212', minHeight: '100%' }}>
      {/* Mobile Top Bar with avatar */}
      <MobileTopBar eyebrow={greeting} title="Discover" />

      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-[.7px] mb-1">{greeting}</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Discover</h1>
          </div>
          <Link href="/profile">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C2E55] flex items-center justify-center cursor-pointer">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-[#181818] border-[1.5px] border-[#2a2a2a] rounded-xl px-4 py-3 mb-5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-[#717171] flex-shrink-0" />
          <input className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#717171]" placeholder="Artists, songs, albums…" />
          <Mic className="w-4 h-4 text-[#717171] flex-shrink-0" />
        </div>

        {/* Hero Banner — up to 7 tracks */}
        {trendingTracks.length > 0 && <HeroBanner tracks={trendingTracks.slice(0, 7)} />}

        {/* Quick Nav */}
        <QuickNav active="home" />

        {/* ── TRENDING NOW ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-black text-white tracking-tight">Trending Now</h2>
            <Link href="/charts" className="flex items-center gap-0.5 text-sm font-bold text-blue-500 hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>
          <div className="flex flex-col">
            {popularTracks.slice(0, 5).map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                rank={i + 1}
                showRank
                showTrend
                variant="plain"
                trend={i < 2 ? 'up' : i === 4 ? 'down' : 'neutral'}
                playCount={track.play_count}
                userId={userId}
                queue={popularTracks}
              />
            ))}
          </div>
        </section>

        {/* ── PROMOTION BANNER — dynamic, managed from /admin/promotions ── */}
        {(() => {
          const p = promotion ?? {
            label: '🎵 Limited Offer',
            title: 'Upload Your Music Free',
            subtitle: 'Share your sound with thousands of listeners across Malawi.',
            cta_text: 'Get Started',
            cta_url: '/become-artist',
            gradient: 'linear-gradient(130deg,#0f2460 0%,#1a3a8f 50%,#2563eb 100%)',
          }
          return (
            <div
              className="relative rounded-2xl overflow-hidden mb-10 p-6 flex items-center justify-between gap-4"
              style={{ background: p.gradient }}
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <g stroke="white" strokeWidth="1">
                    {[0,40,80,120,160,200,240,280,320,360,400].map((x,i)=>(
                      <line key={i} x1={x} y1="0" x2={x-30} y2="120"/>
                    ))}
                  </g>
                </svg>
              </div>
              <div className="relative z-10 min-w-0">
                {p.label && <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{p.label}</p>}
                <h3 className="text-white text-lg font-black mb-1 leading-tight">{p.title}</h3>
                {p.subtitle && <p className="text-white/65 text-sm">{p.subtitle}</p>}
              </div>
              <Link
                href={p.cta_url}
                className="relative z-10 flex-shrink-0 bg-white text-blue-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {p.cta_text}
              </Link>
            </div>
          )
        })()}

        {/* ── NEW RELEASES — horizontal scroll ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-black text-white tracking-tight">New Releases</h2>
            <Link href="/songs" className="flex items-center gap-0.5 text-sm font-bold text-blue-500 hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>
          <HScroll>
            {tracks.slice(0, 10).map(track => (
              <div key={track.id} className="flex-shrink-0 w-[160px] sm:w-[180px]">
                <TrackCard track={track} userId={userId} queue={tracks} />
              </div>
            ))}
          </HScroll>
        </section>

        {/* ── RECOMMENDED FOR YOU — horizontal scroll ── */}
        {tracks.length > 5 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-black text-white tracking-tight">Recommended For You</h2>
              <Link href="/songs" className="flex items-center gap-0.5 text-sm font-bold text-blue-500 hover:underline">
                See all <ChevronRight size={15} />
              </Link>
            </div>
            <HScroll>
              {[...tracks].reverse().slice(0, 10).map(track => (
                <div key={track.id} className="flex-shrink-0 w-[160px] sm:w-[180px]">
                  <TrackCard track={track} userId={userId} queue={tracks} />
                </div>
              ))}
            </HScroll>
          </section>
        )}

        {/* ── POPULAR GENRES ── */}
        <section className="mb-10">
          <h2 className="text-[17px] font-black text-white tracking-tight mb-4">Popular Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GENRES.map(g => (
              <Link key={g.name} href={`/songs?genre=${g.name}`}>
                <div className={`bg-gradient-to-br ${g.color} rounded-xl px-4 py-5 cursor-pointer hover:opacity-90 transition-opacity`}>
                  <span className="text-2xl mb-2 block">{g.emoji}</span>
                  <p className="text-white font-bold text-sm">{g.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FEATURED ARTISTS — horizontal scroll ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-black text-white tracking-tight">Featured Artists</h2>
            <Link href="/artists" className="flex items-center gap-0.5 text-sm font-bold text-blue-500 hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>
          <HScroll>
            {artists.slice(0, 10).map(artist => (
              <div key={artist.id} className="flex-shrink-0 w-[160px] sm:w-[180px]">
                <ArtistCard artist={artist} userId={userId} />
              </div>
            ))}
          </HScroll>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[#2a2a2a] pt-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 grid place-items-center">
                <Music2 size={16} color="white" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">
                MUZI<span className="text-blue-400">KA</span>
              </span>
            </div>

            {/* Social links */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-[#717171] text-xs font-semibold uppercase tracking-wider">Follow Us</p>
              <div className="flex items-center gap-4">
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#181818] border border-[#2a2a2a] grid place-items-center text-[#b3b3b3] hover:text-pink-400 hover:border-pink-400 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                {/* X / Twitter */}
                <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#181818] border border-[#2a2a2a] grid place-items-center text-[#b3b3b3] hover:text-sky-400 hover:border-sky-400 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#181818] border border-[#2a2a2a] grid place-items-center text-[#b3b3b3] hover:text-blue-500 hover:border-blue-500 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#181818] border border-[#2a2a2a] grid place-items-center text-[#b3b3b3] hover:text-red-500 hover:border-red-500 transition-colors">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-[#717171] text-xs text-center">
              © {new Date().getFullYear()} Muzika · All rights reserved
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}

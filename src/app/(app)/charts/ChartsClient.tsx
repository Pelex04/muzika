'use client'

import { useState } from 'react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import TrackRow from '@/components/track/TrackRow'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'

const TABS = ['Top 200', 'Hot 100', 'New', 'Gospel', 'Afropop']

interface Props { tracks: Track[]; userId: string | null }

export default function ChartsClient({ tracks, userId }: Props) {
  const [activeTab, setActiveTab] = useState('Top 200')

  const filtered = (() => {
    if (activeTab === 'Hot 100') return tracks.slice(0, 100)
    if (activeTab === 'Gospel') return tracks.filter(t => t.genre === 'Gospel')
    if (activeTab === 'Afropop') return tracks.filter(t => t.genre === 'Afropop')
    if (activeTab === 'New') return [...tracks].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 50)
    return tracks.slice(0, 200)
  })()

  return (
    <div>
      <MobileTopBar eyebrow="Malawi's Biggest" title="Top Charts" />

      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[.7px] mb-1">Malawi's Biggest</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Top Charts</h1>
        </div>

        {/* Tab row */}
        <div className="flex border-b-2 border-[#2a2a2a] mb-5 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-0.5 transition-all flex-shrink-0',
                activeTab === tab
                  ? 'text-white border-white'
                  : 'text-[#717171] border-transparent hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#717171]">
            <p className="text-lg font-semibold">No tracks in this chart yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                rank={i + 1}
                showTrend={true}
                trend={i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'neutral'}
                playCount={track.play_count}
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

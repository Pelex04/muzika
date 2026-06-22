'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Artist } from '@/types'
import Link from 'next/link'

interface Props {
  artist: Artist
  userId: string | null
}

export default function ArtistCard({ artist, userId }: Props) {
  const [following, setFollowing] = useState(artist.is_following ?? false)
  const [loading, setLoading] = useState(false)

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) { toast.error('Sign in to follow artists'); return }
    setLoading(true)
    const res = await fetch(`/api/artists/${artist.id}/follow`, { method: 'POST' })
    const data = await res.json()
    if (data.following !== undefined) {
      setFollowing(data.following)
      toast.success(data.following ? `Following ${artist.stage_name}` : 'Unfollowed')
    }
    setLoading(false)
  }

  const colors: Record<string, string> = {
    'Afropop': 'from-blue-900 to-[#0d1b3e]',
    'Gospel': 'from-emerald-900 to-[#022c22]',
    'Reggae': 'from-red-900 to-[#450a0a]',
    'Hip-Hop': 'from-purple-900 to-[#1e1b4b]',
    'RnB': 'from-orange-900 to-[#431407]',
    'Traditional': 'from-teal-900 to-[#022c22]',
    'Jazz': 'from-yellow-900 to-[#451a03]',
  }
  const gradientClass = colors[artist.genre] ?? colors['Afropop']

  return (
    <Link href={`/artists/${artist.id}`}>
      <div className="bg-[#181818] rounded-xl px-4 py-5 text-center cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,.3),0_4px_16px_rgba(0,0,0,.4)] hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(0,0,0,.4),0_12px_40px_rgba(0,0,0,.5)] transition-all">
        {/* Avatar */}
        <div className="relative w-[76px] h-[76px] mx-auto mb-3">
          <div className={cn(
            'w-full h-full rounded-full overflow-hidden bg-gradient-to-br',
            gradientClass
          )}>
            {artist.avatar_url
              ? <img src={artist.avatar_url} alt={artist.stage_name} className="w-full h-full object-cover"/>
              : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-black text-white/40">
                    {artist.stage_name.charAt(0)}
                  </span>
                </div>
              )
            }
          </div>
          {artist.verified && (
            <div className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-blue-500 rounded-full border-[2.5px] border-[#181818] grid place-items-center">
              <CheckCircle2 className="w-3 h-3 text-white" fill="white" strokeWidth={0}/>
            </div>
          )}
        </div>

        <p className="text-sm font-bold text-white mb-0.5 truncate">{artist.stage_name}</p>
        <p className="text-xs text-[#b3b3b3] mb-3.5 truncate">
          {artist.genre} · {artist.location}
        </p>
        <p className="text-xs text-[#717171] mb-3">
          {formatCount(artist.follower_count)} followers
        </p>

        <button
          onClick={toggleFollow}
          disabled={loading}
          className={cn(
            'px-5 py-1.5 rounded-full text-xs font-bold border-[1.5px] transition-all',
            following
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-[#3a3a3a] hover:border-white'
          )}
        >
          {loading ? '…' : following ? 'Following' : 'Follow'}
        </button>
      </div>
    </Link>
  )
}

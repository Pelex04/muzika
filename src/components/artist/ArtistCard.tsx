'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'
import { notify } from '@/components/ui/notify'
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
    if (!userId) { notify.error('Sign in to follow artists'); return }
    setLoading(true)
    const res = await fetch(`/api/artists/${artist.id}/follow`, { method: 'POST' })
    const data = await res.json()
    if (data.following !== undefined) {
      setFollowing(data.following)
      notify.success(data.following ? `Following ${artist.stage_name}` : 'Unfollowed')
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
    'Amapiano': 'from-pink-900 to-[#500724]',
    'Jazz': 'from-yellow-900 to-[#451a03]',
  }
  const gradientClass = colors[artist.genre] ?? colors['Afropop']

  return (
    <Link href={`/artists/${artist.id}`}>
      <div className="text-center cursor-pointer hover:-translate-y-0.5 transition-all">
        {/* Avatar */}
        <div className="relative w-[120px] h-[120px] mx-auto mb-3">
          <div className={cn(
            'w-full h-full rounded-full overflow-hidden bg-gradient-to-br',
            gradientClass
          )}>
            {artist.avatar_url
              ? <Image src={artist.avatar_url} alt={artist.stage_name} fill sizes="120px" className="object-cover"/>
              : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-black text-white/40">
                    {artist.stage_name.charAt(0)}
                  </span>
                </div>
              )
            }
          </div>
          {artist.verified && (
            <div className="absolute bottom-1 right-1 w-[30px] h-[30px] bg-[#121212] rounded-full grid place-items-center">
              <BadgeCheck size={22} className="text-blue-500" />
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

import { getAdminClient } from '@/lib/admin'
import Link from 'next/link'
import Image from 'next/image'
import { Mic2 } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Podcasts · Playback' }
export const dynamic = 'force-dynamic'

export default async function PodcastsPage() {
  const db = getAdminClient()

  const { data: podcasts } = await db
    .from('podcasts')
    .select('id, title, cover_url, category, artist:artists(id, stage_name, avatar_url), episodes:tracks(count)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <div>
      <MobileTopBar eyebrow="Browse" title="Podcasts" />
      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px] mb-1">Browse</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Podcasts</h1>
        </div>

        {(podcasts ?? []).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(podcasts ?? []).map((p: any) => (
              <Link key={p.id} href={`/podcasts/${p.id}`} className="group block">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-[#0d1b3e] grid place-items-center mb-2">
                  {p.cover_url
                    ? <Image src={p.cover_url} alt={p.title} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <Mic2 size={40} className="text-[#2a2a2a]" />
                  }
                </div>
                <p className="text-sm font-bold text-white truncate mb-0.5">{p.title}</p>
                <p className="text-xs text-[#717171] truncate">
                  {p.artist?.stage_name} · {p.episodes?.[0]?.count ?? 0} episode{(p.episodes?.[0]?.count ?? 0) === 1 ? '' : 's'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Mic2 size={48} className="text-[#2a2a2a] mx-auto mb-4" />
            <p className="text-[#717171] text-sm">No podcasts yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

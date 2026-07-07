import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'
import Link from 'next/link'
import { Disc3 } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Albums · Muzika' }
export const dynamic = 'force-dynamic'

export default async function AlbumsPage() {
  const db = getAdminClient()

  const { data: albums } = await db
    .from('albums')
    .select('id, title, genre, cover_url, created_at, artist:artists(id, stage_name, avatar_url)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <div>
      <MobileTopBar eyebrow="Browse" title="Albums" />
      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px] mb-1">Browse</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Albums</h1>
        </div>

        {albums && albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album: any) => (
              <Link key={album.id} href={`/albums/${album.id}`} className="group block">
                <div className="rounded-lg overflow-hidden">
                  <div className="aspect-square bg-[#0d1b3e] grid place-items-center overflow-hidden rounded-lg">
                    {album.cover_url
                      ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <Disc3 size={40} className="text-[#2a2a2a]" />
                    }
                  </div>
                  <div className="pt-2 px-0.5">
                    <p className="text-sm font-bold text-white truncate mb-0.5">{album.title}</p>
                    <p className="text-xs text-[#717171] truncate">
                      {album.artist?.stage_name} · {album.genre}
                    </p>
                    <p className="text-xs text-[#555] mt-0.5">
                      {new Date(album.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Disc3 size={48} className="text-[#2a2a2a] mx-auto mb-4" />
            <p className="text-[#717171] text-sm">No albums yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

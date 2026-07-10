import { getAdminClient } from '@/lib/admin'
import Link from 'next/link'
import { Disc3, Clock } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import AlbumsAutoRefresh from './AlbumsAutoRefresh'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Albums · Playback' }
export const dynamic = 'force-dynamic'

export default async function AlbumsPage() {
  const db = getAdminClient()

  const { data: publishedAlbums } = await db
    .from('albums')
    .select('id, title, genre, cover_url, created_at, release_type, artist:artists(id, stage_name, avatar_url)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(60)

  // Scheduled albums are shown too -- as clickable "coming soon" tiles that
  // link to a countdown page, not their tracks (which stay hidden until release).
  const { data: scheduledAlbums } = await db
    .from('albums')
    .select('id, title, genre, cover_url, release_date, release_type, artist:artists(id, stage_name, avatar_url)')
    .eq('is_scheduled', true)
    .gt('release_date', new Date().toISOString())
    .order('release_date', { ascending: true })
    .limit(20)

  const albums = [
    ...(scheduledAlbums ?? []).map((a: any) => ({ ...a, _scheduled: true })),
    ...(publishedAlbums ?? []).map((a: any) => ({ ...a, _scheduled: false })),
  ]

  return (
    <div>
      <AlbumsAutoRefresh releaseDates={(scheduledAlbums ?? []).map((a: any) => a.release_date)} />
      <MobileTopBar eyebrow="Browse" title="Albums" />
      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px] mb-1">Browse</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Albums</h1>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album: any) => (
              <Link key={album.id} href={`/albums/${album.id}`} className="group block">
                <div className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square bg-[#0d1b3e] grid place-items-center overflow-hidden rounded-lg">
                    {album.cover_url
                      ? <img
                          src={album.cover_url}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={album._scheduled ? { filter: 'grayscale(0.4) brightness(0.6)' } : undefined}
                        />
                      : <Disc3 size={40} className="text-[#2a2a2a]" />
                    }
                    {album._scheduled && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md">
                        <Clock size={10} /> Coming Soon
                      </div>
                    )}
                    {album.release_type === 'ep' && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
                        EP
                      </div>
                    )}
                  </div>
                  <div className="pt-2 px-0.5">
                    <p className="text-sm font-bold text-white truncate mb-0.5">{album.title}</p>
                    <p className="text-xs text-[#717171] truncate">
                      {album.artist?.stage_name} · {album.genre}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: album._scheduled ? '#fbbf24' : '#555' }}>
                      {album._scheduled
                        ? `Releases ${new Date(album.release_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                        : new Date(album.created_at).getFullYear()}
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

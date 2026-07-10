'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Mic2 } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import MobileTopBar from '@/components/layout/MobileTopBar'

interface Podcast {
  id: string; title: string; description: string | null; cover_url: string | null
  category: string | null; published: boolean; created_at: string
  episodes: { count: number }[]
}

export default function StudioPodcastsClient({ podcasts: initial }: { podcasts: Podcast[] }) {
  const [podcasts, setPodcasts] = useState(initial)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const confirmDelete = async () => {
    if (!confirmId) return
    const id = confirmId
    setConfirmId(null)
    const res = await fetch(`/api/podcasts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPodcasts(prev => prev.filter(p => p.id !== id))
      notify.success('Podcast deleted')
    } else {
      const data = await res.json().catch(() => ({}))
      notify.error(data.error ?? 'Could not delete podcast')
    }
  }

  return (
    <div>
      <MobileTopBar eyebrow="Studio" title="My Podcasts" />
      <div className="max-w-[900px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px] mb-1">Studio</p>
            <h1 className="text-3xl font-black text-white tracking-tight">My Podcasts</h1>
          </div>
          <Link href="/upload" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            + New Episode
          </Link>
        </div>

        {podcasts.length === 0 ? (
          <div className="text-center py-20">
            <Mic2 size={40} className="text-[#2a2a2a] mx-auto mb-4" />
            <p className="text-[#717171] text-sm mb-4">You haven't started a podcast yet</p>
            <Link href="/upload" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Upload your first episode
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {podcasts.map(p => (
              <div key={p.id} style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: '14px', overflow: 'hidden' }}>
                <Link href={`/podcasts/${p.id}`}>
                  <div style={{ aspectRatio: '1', background: '#0d1b3e', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                    {p.cover_url
                      ? <img src={p.cover_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Mic2 size={36} color="#2a2a2a" />}
                  </div>
                </Link>
                <div style={{ padding: '12px' }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                  <p style={{ color: '#555', fontSize: '12px', margin: '0 0 10px' }}>
                    {p.episodes?.[0]?.count ?? 0} episode{(p.episodes?.[0]?.count ?? 0) === 1 ? '' : 's'}
                  </p>
                  <button
                    onClick={() => setConfirmId(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete podcast?"
        description="This will permanently delete the show and all of its episodes. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Trash2, Disc3, Clock } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CountdownBoxes from '@/components/ui/CountdownBoxes'
import Link from 'next/link'

interface Album {
  id: string; title: string; genre: string; cover_url: string | null
  published: boolean; is_scheduled?: boolean; release_date?: string | null
  created_at: string; tracks: { count: number }[]
}

export default function StudioAlbumsClient({ albums: initial }: { albums: Album[] }) {
  const [albums, setAlbums] = useState(initial)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const confirmDelete = async () => {
    if (!confirmId) return
    const id = confirmId
    setConfirmId(null)
    const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAlbums(prev => prev.filter(a => a.id !== id))
      notify.success('Album deleted')
    } else {
      notify.error('Could not delete album')
    }
  }

  return (
    <div style={{ padding: '28px 24px 100px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0 }}>My Albums</h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
      </div>

      {albums.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <Disc3 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No albums yet. Upload your first album.</p>
          <Link href="/studio/upload" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Upload now →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {albums.map(album => (
            <div key={album.id} style={{ background: '#161616', border: album.is_scheduled ? '1px solid rgba(251,191,36,0.15)' : '1px solid #1f1f1f', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1', background: '#0d1b3e', display: 'grid', placeItems: 'center', overflow: 'hidden', position: 'relative' }}>
                {album.cover_url
                  ? <img src={album.cover_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: album.is_scheduled ? 'grayscale(0.4) brightness(0.6)' : undefined }} />
                  : <Disc3 size={40} color="#2a2a2a" />}
                {album.is_scheduled && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
                    <Clock size={28} color="#fbbf24" />
                  </div>
                )}
              </div>
              <div style={{ padding: '12px' }}>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.title}</p>
                {album.is_scheduled && album.release_date ? (
                  <div style={{ margin: '0 0 10px' }}>
                    <p style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={10} /> Releases in
                    </p>
                    <CountdownBoxes targetDate={album.release_date} compact />
                  </div>
                ) : (
                  <p style={{ color: '#555', fontSize: '12px', margin: '0 0 10px' }}>
                    {album.genre} · {album.tracks?.[0]?.count ?? 0} tracks
                  </p>
                )}
                <button
                  onClick={() => setConfirmId(album.id)}
                  style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#ef4444', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Delete album"
        description="This album and all its tracks will be permanently deleted."
        confirmLabel="Delete album"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

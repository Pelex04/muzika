'use client'

import { useState } from 'react'
import { Trash2, Play, Download, Music2 } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface Track {
  id: string; title: string; genre: string; cover_url: string | null
  play_count: number; download_count: number; published: boolean; created_at: string
  producers: string[]; featured_artists: string[]
}

export default function StudioTracksClient({ tracks: initial, artistId }: { tracks: Track[]; artistId: string }) {
  const [tracks, setTracks] = useState(initial)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const confirmDelete = async () => {
    if (!confirmId) return
    const id = confirmId
    setConfirmId(null)
    setDeletingId(id)
    const res = await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTracks(prev => prev.filter(t => t.id !== id))
      notify.success('Track deleted')
    } else {
      notify.error('Could not delete track')
    }
    setDeletingId(null)
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0 }}>My Tracks</h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{tracks.length} published track{tracks.length !== 1 ? 's' : ''}</p>
      </div>

      {tracks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <Music2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No tracks yet. Upload your first track.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tracks.map(track => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#161616', border: '1px solid #1f1f1f', borderRadius: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: '#0d1b3e', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                {track.cover_url ? <img src={track.cover_url} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music2 size={18} color="#2a2a2a" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                  <span style={{ color: '#555', fontSize: '12px' }}>{track.genre}</span>
                  <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Play size={10} /> {track.play_count ?? 0}</span>
                  <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Download size={10} /> {track.download_count ?? 0}</span>
                </div>
                {(track.producers?.length > 0 || track.featured_artists?.length > 0) && (
                  <p style={{ color: '#3a3a3a', fontSize: '11px', margin: '2px 0 0' }}>
                    {track.producers?.length > 0 && `Prod. ${track.producers.join(', ')}`}
                    {track.producers?.length > 0 && track.featured_artists?.length > 0 && ' · '}
                    {track.featured_artists?.length > 0 && `ft. ${track.featured_artists.join(', ')}`}
                  </p>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#3a3a3a', flexShrink: 0 }}>{new Date(track.created_at).toLocaleDateString()}</span>
              <button
                onClick={() => setConfirmId(track.id)}
                disabled={deletingId === track.id}
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#ef4444', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, flexShrink: 0, fontFamily: 'inherit' }}>
                <Trash2 size={12} /> {deletingId === track.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Delete track"
        description="This track will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

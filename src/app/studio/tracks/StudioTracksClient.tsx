'use client'

import { useState } from 'react'
import { Trash2, Pencil, Play, Download, Music2, X, FileText, Mic2, Users } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface Track {
  id: string; title: string; genre: string; cover_url: string | null
  play_count: number; download_count: number; published: boolean; created_at: string
  producers: string[]; featured_artists: string[]; lyrics: string | null
}

function EditModal({ track, onClose, onSave }: { track: Track; onClose: () => void; onSave: (updated: Track) => void }) {
  const [title, setTitle] = useState(track.title)
  const [lyrics, setLyrics] = useState(track.lyrics ?? '')
  const [producers, setProducers] = useState((track.producers ?? []).join(', '))
  const [featuredArtists, setFeaturedArtists] = useState((track.featured_artists ?? []).join(', '))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/tracks/${track.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        lyrics: lyrics.trim() || null,
        producers: producers.split(',').map(s => s.trim()).filter(Boolean),
        featured_artists: featuredArtists.split(',').map(s => s.trim()).filter(Boolean),
      }),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      onSave(data.track)
      notify.success('Track updated')
      onClose()
    } else {
      notify.error('Could not save changes')
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
    borderRadius: '10px', color: '#fff', fontSize: '14px',
    padding: '11px 14px', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = { display: 'block', color: '#b3b3b3', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', zIndex: 1, background: '#141414',
        border: '1px solid #2a2a2a', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: '560px', maxHeight: '90vh',
        overflowY: 'auto', padding: '24px 20px 32px',
      }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#2a2a2a', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>Edit Track</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#717171', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inp} />
          </div>

          <div>
            <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '5px' }}><Mic2 size={11} /> Producers</label>
            <input value={producers} onChange={e => setProducers(e.target.value)} placeholder="Separate with commas" style={inp} />
            <p style={{ fontSize: '11px', color: '#555', marginTop: '5px' }}>e.g. Rasta Kadema, DJ Khaled</p>
          </div>

          <div>
            <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={11} /> Featured Artists</label>
            <input value={featuredArtists} onChange={e => setFeaturedArtists(e.target.value)} placeholder="Separate with commas" style={inp} />
          </div>

          <div>
            <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={11} /> Lyrics</label>
            <textarea
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              rows={10}
              placeholder="Paste your full lyrics here…"
              style={{ ...inp, resize: 'vertical', minHeight: '200px', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '12px', background: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              style={{ flex: 2, padding: '12px', background: '#2563eb', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudioTracksClient({ tracks: initial, artistId }: { tracks: Track[]; artistId: string }) {
  const [tracks, setTracks] = useState(initial)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editTrack, setEditTrack] = useState<Track | null>(null)

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

  const handleSave = (updated: Track) => {
    setTracks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
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
                <div style={{ display: 'flex', gap: '12px', marginTop: '3px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#555', fontSize: '12px' }}>{track.genre}</span>
                  <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Play size={10} /> {track.play_count ?? 0}</span>
                  <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Download size={10} /> {track.download_count ?? 0}</span>
                  {track.lyrics && <span style={{ color: '#2563eb', fontSize: '11px', fontWeight: 600 }}>Lyrics ✓</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => setEditTrack(track)}
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', color: '#60a5fa', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={() => setConfirmId(track.id)}
                  disabled={deletingId === track.id}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: '#ef4444', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
                  <Trash2 size={11} /> {deletingId === track.id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTrack && (
        <EditModal
          track={editTrack}
          onClose={() => setEditTrack(null)}
          onSave={handleSave}
        />
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

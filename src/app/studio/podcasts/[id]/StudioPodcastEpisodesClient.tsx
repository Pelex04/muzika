'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Mic2, Trash2, Pencil, Clock, X, Loader2 } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CountdownBoxes from '@/components/ui/CountdownBoxes'

interface Episode {
  id: string; title: string; cover_url: string | null; lyrics: string | null
  episode_number: number | null; play_count: number; published: boolean
  is_scheduled: boolean; release_date: string | null; created_at: string
}

interface Podcast { id: string; title: string; cover_url: string | null }

export default function StudioPodcastEpisodesClient({ podcast, episodes: initial }: { podcast: Podcast; episodes: Episode[] }) {
  const [episodes, setEpisodes] = useState(initial)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<Episode | null>(null)

  const confirmDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    const res = await fetch(`/api/tracks/${confirmId}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      setEpisodes(prev => prev.filter(e => e.id !== confirmId))
      notify.success('Episode deleted')
    } else {
      const data = await res.json().catch(() => ({}))
      notify.error(data.error ?? 'Could not delete episode')
    }
    setConfirmId(null)
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px 100px' }}>
      <Link href="/studio/podcasts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#717171', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ChevronLeft size={15} /> My Podcasts
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', background: '#0d1b3e', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          {podcast.cover_url
            ? <img src={podcast.cover_url} alt={podcast.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Mic2 size={24} color="#2a2a2a" />}
        </div>
        <div>
          <p style={{ color: '#717171', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>Manage Episodes</p>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: 0 }}>{podcast.title}</h1>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Mic2 size={36} color="#2a2a2a" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#717171', fontSize: '14px' }}>No episodes yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {episodes.map(ep => (
            <div key={ep.id} style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#0d1b3e', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {(ep.cover_url || podcast.cover_url)
                    ? <img src={ep.cover_url || podcast.cover_url!} alt={ep.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Mic2 size={18} color="#2a2a2a" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ep.episode_number ? `${ep.episode_number}. ` : ''}{ep.title}
                  </p>
                  <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>
                    {ep.published ? `${ep.play_count ?? 0} plays` : ep.is_scheduled ? 'Scheduled' : 'Unpublished'}
                  </p>
                </div>
                <button onClick={() => setEditing(ep)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1f1f1f', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Pencil size={13} color="#b3b3b3" />
                </button>
                <button onClick={() => setConfirmId(ep.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Trash2 size={13} color="#ef4444" />
                </button>
              </div>

              {ep.is_scheduled && ep.release_date && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1f1f1f' }}>
                  <p style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={10} /> Releases in
                  </p>
                  <CountdownBoxes targetDate={ep.release_date} compact />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Delete episode?"
        description="This will permanently delete the audio and remove it from your show. This can't be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />

      {editing && (
        <EditEpisodeModal
          episode={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setEpisodes(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function EditEpisodeModal({ episode, onClose, onSaved }: { episode: Episode; onClose: () => void; onSaved: (ep: Episode) => void }) {
  const [title, setTitle] = useState(episode.title)
  const [description, setDescription] = useState(episode.lyrics ?? '')
  const [episodeNumber, setEpisodeNumber] = useState(episode.episode_number?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) { notify.error('Title is required'); return }
    setSaving(true)
    const res = await fetch(`/api/tracks/${episode.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        lyrics: description.trim() || null,
        episode_number: episodeNumber ? Number(episodeNumber) : null,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { notify.error(data.error ?? 'Could not save changes'); return }
    notify.success('Episode updated')
    onSaved({ ...episode, title: title.trim(), lyrics: description.trim() || null, episode_number: episodeNumber ? Number(episodeNumber) : null })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 200, padding: '20px' }} onClick={onClose}>
      <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: 800, margin: 0 }}>Edit Episode</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#717171' }}><X size={18} /></button>
        </div>

        <label style={{ display: 'block', color: '#b3b3b3', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '10px 12px', marginBottom: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }} />

        <label style={{ display: 'block', color: '#b3b3b3', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Show Notes</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
          style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '10px 12px', marginBottom: '14px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none' }} />

        <label style={{ display: 'block', color: '#b3b3b3', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Episode Number <span style={{ color: '#555', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
        <input type="number" min={1} value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)}
          style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '10px 12px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'inherit' }} />

        <button onClick={save} disabled={saving}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

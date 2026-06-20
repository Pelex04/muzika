'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Music2, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Playlist } from '@/types'

interface Props {
  trackId: string
  onClose: () => void
}

export default function AddToPlaylistModal({ trackId, onClose }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/playlists')
      const data = await res.json()
      setPlaylists(data.playlists ?? [])
    } catch {
      toast.error('Could not load playlists')
    }
    setLoading(false)
  }

  const addToPlaylist = async (playlistId: string) => {
    setAddingId(playlistId)
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_id: trackId }),
      })
      if (res.ok) {
        setAddedIds(prev => new Set(prev).add(playlistId))
        toast.success('Added to playlist')
      } else {
        const data = await res.json()
        if (res.status === 409) {
          setAddedIds(prev => new Set(prev).add(playlistId))
          toast.info('Already in this playlist')
        } else {
          toast.error(data.error ?? 'Could not add track')
        }
      }
    } catch {
      toast.error('Connection error')
    }
    setAddingId(null)
  }

  const createPlaylist = async () => {
    if (!newName.trim()) { toast.error('Give your playlist a name'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setPlaylists(prev => [{ ...data.playlist, track_count: 0 }, ...prev])
        await addToPlaylist(data.playlist.id)
        setNewName('')
        setShowCreate(false)
        toast.success(`Created "${data.playlist.name}" and added track`)
      } else {
        toast.error(data.error ?? 'Could not create playlist')
      }
    } catch {
      toast.error('Connection error')
    }
    setCreating(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(13,27,62,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: '480px',
          maxHeight: '70vh', overflowY: 'auto',
          padding: '20px',
          animation: 'slideUp .25s ease-out',
        }}
        className="md:rounded-2xl md:mb-[10vh]"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B3E' }}>Add to Playlist</h3>
          <button onClick={onClose} style={{ background: '#F4F6FB', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <X size={16} color="#5C677D" />
          </button>
        </div>

        {/* New playlist row */}
        {showCreate ? (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Playlist name…"
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E2E5F0', borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={createPlaylist}
              disabled={creating}
              style={{ padding: '10px 16px', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {creating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '12px 14px', borderRadius: '10px', border: '1.5px dashed #CDD0DE',
              background: '#fff', cursor: 'pointer', marginBottom: '16px', fontFamily: 'inherit',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DBEAFE', display: 'grid', placeItems: 'center' }}>
              <Plus size={16} color="#2563EB" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0D1B3E' }}>New Playlist</span>
          </button>
        )}

        {/* Playlist list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#8B95A8' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : playlists.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#8B95A8', fontSize: '14px' }}>
            No playlists yet. Create your first one above.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {playlists.map(p => {
              const added = addedIds.has(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => !added && addToPlaylist(p.id)}
                  disabled={addingId === p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 8px', borderRadius: '10px',
                    background: 'transparent', border: 'none', cursor: added ? 'default' : 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', width: '100%',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg,#1e3a8a,#0d1b3e)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Music2 size={16} color="rgba(255,255,255,0.7)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <p style={{ fontSize: '12px', color: '#8B95A8' }}>{p.track_count ?? 0} tracks</p>
                  </div>
                  {addingId === p.id ? (
                    <Loader2 size={16} color="#8B95A8" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : added ? (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#D1FAE5', display: 'grid', placeItems: 'center' }}>
                      <Check size={13} color="#10B981" />
                    </div>
                  ) : (
                    <Plus size={18} color="#8B95A8" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>
    </div>
  )
}

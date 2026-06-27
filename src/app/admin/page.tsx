'use client'

import { useEffect, useState, useCallback } from 'react'
import { Music2, Disc3, Users, Trash2, ShieldX, ShieldCheck, AlertTriangle, Search, RefreshCw } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { notify } from '@/components/ui/notify'

type Tab = 'tracks' | 'albums' | 'users'

interface AdminItem {
  id: string
  title?: string
  full_name?: string
  email?: string
  genre?: string
  cover_url?: string
  play_count?: number
  role?: string
  suspended_at?: string | null
  suspended_reason?: string | null
  created_at: string
  artist?: { id: string; stage_name: string; profile?: { email: string } }
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('tracks')
  const [items, setItems] = useState<AdminItem[]>([])
  const [filtered, setFiltered] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{
    open: boolean
    type: 'delete_track' | 'delete_album' | 'suspend' | 'unsuspend' | null
    item: AdminItem | null
    reason: string
  }>({ open: false, type: null, item: null, reason: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setSearch('')
    const res = await fetch(`/api/admin/data?tab=${tab}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setFiltered(data.items ?? [])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(items.filter(i =>
      (i.title ?? i.full_name ?? '').toLowerCase().includes(q) ||
      (i.email ?? '').toLowerCase().includes(q) ||
      (i.artist?.stage_name ?? '').toLowerCase().includes(q)
    ))
  }, [search, items])

  const openConfirm = (type: typeof confirm.type, item: AdminItem) => {
    setConfirm({ open: true, type, item, reason: '' })
  }

  const handleConfirm = async () => {
    const { type, item, reason } = confirm
    if (!type || !item) return
    setConfirm(c => ({ ...c, open: false }))

    let url = ''
    let method = 'DELETE'
    let body: Record<string, string> = { reason }

    if (type === 'delete_track') url = `/api/admin/tracks/${item.id}`
    else if (type === 'delete_album') url = `/api/admin/albums/${item.id}`
    else if (type === 'suspend') { url = `/api/admin/users/${item.id}`; method = 'PATCH'; body = { action: 'suspend', reason } }
    else if (type === 'unsuspend') { url = `/api/admin/users/${item.id}`; method = 'PATCH'; body = { action: 'unsuspend', reason } }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      notify.success(
        type === 'delete_track' ? 'Track removed' :
        type === 'delete_album' ? 'Album removed' :
        type === 'suspend' ? 'Account suspended' : 'Account restored',
      )
      if (type === 'suspend' || type === 'unsuspend') {
        setItems(prev => prev.map(i => i.id === item.id
          ? { ...i, suspended_at: type === 'suspend' ? new Date().toISOString() : null }
          : i
        ))
        setFiltered(prev => prev.map(i => i.id === item.id
          ? { ...i, suspended_at: type === 'suspend' ? new Date().toISOString() : null }
          : i
        ))
      } else {
        setItems(prev => prev.filter(i => i.id !== item.id))
        setFiltered(prev => prev.filter(i => i.id !== item.id))
      }
    } else {
      const data = await res.json()
      notify.error(data.error ?? 'Action failed')
    }
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'tracks', label: 'Tracks', icon: Music2 },
    { key: 'albums', label: 'Albums', icon: Disc3 },
    { key: 'users', label: 'Users', icon: Users },
  ]

  const confirmMeta = {
    delete_track: { title: 'Remove track', desc: `Remove "${confirm.item?.title}"? This is permanent and cannot be undone.`, label: 'Remove track' },
    delete_album: { title: 'Remove album', desc: `Remove "${confirm.item?.title}" and all its tracks? This is permanent.`, label: 'Remove album' },
    suspend: { title: 'Suspend account', desc: `Suspend ${confirm.item?.full_name ?? confirm.item?.email}? They will be signed out immediately and cannot log in.`, label: 'Suspend' },
    unsuspend: { title: 'Restore account', desc: `Restore access for ${confirm.item?.full_name ?? confirm.item?.email}?`, label: 'Restore' },
  }

  const meta = confirm.type ? confirmMeta[confirm.type] : null

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#717171', fontSize: '14px' }}>Manage content and user accounts</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 18px', borderRadius: '10px', border: 'none',
            background: tab === key ? '#2563eb' : '#1a1a1a',
            color: tab === key ? '#fff' : '#b3b3b3',
            fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all .15s',
          }}>
            <Icon size={15} />
            {label}
            <span style={{
              background: tab === key ? 'rgba(255,255,255,0.2)' : '#2a2a2a',
              borderRadius: '6px', padding: '1px 7px', fontSize: '12px',
            }}>
              {items.length}
            </span>
          </button>
        ))}
        <button onClick={load} style={{
          marginLeft: 'auto', padding: '9px 14px', borderRadius: '10px',
          border: '1px solid #2a2a2a', background: 'none',
          color: '#717171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontFamily: 'inherit',
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#141414', border: '1px solid #2a2a2a',
        borderRadius: '10px', padding: '10px 14px', marginBottom: '20px',
      }}>
        <Search size={15} color="#717171" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}…`}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#fff', fontSize: '14px', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{
            width: '28px', height: '28px', border: '2px solid #2563eb',
            borderTopColor: 'transparent', borderRadius: '50', animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#717171', fontSize: '14px' }}>
              No {tab} found
            </div>
          )}

          {/* TRACKS / ALBUMS */}
          {(tab === 'tracks' || tab === 'albums') && filtered.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 14px', borderRadius: '10px',
              background: '#111', border: '1px solid #1a1a1a',
              marginBottom: '4px',
            }}>
              {/* Cover */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px',
                background: '#1f1f1f', flexShrink: 0, overflow: 'hidden',
              }}>
                {item.cover_url && (
                  <img src={item.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '12px', color: '#717171' }}>
                  {item.artist?.stage_name} · {item.genre}
                  {item.play_count != null && ` · ${item.play_count} plays`}
                </p>
              </div>

              {/* Date */}
              <span style={{ fontSize: '12px', color: '#555', flexShrink: 0 }}>
                {new Date(item.created_at).toLocaleDateString()}
              </span>

              {/* Delete */}
              <button
                onClick={() => openConfirm(tab === 'tracks' ? 'delete_track' : 'delete_album', item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '8px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                  color: '#ef4444', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          ))}

          {/* USERS */}
          {tab === 'users' && filtered.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 14px', borderRadius: '10px',
              background: '#111', border: '1px solid #1a1a1a',
              marginBottom: '4px',
              opacity: item.suspended_at ? 0.65 : 1,
            }}>
              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: item.suspended_at ? '#2a1a1a' : '#0d1b3e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '15px', fontWeight: 700, color: '#fff',
              }}>
                {item.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                    {item.full_name || 'No name'}
                  </p>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                    background: item.role === 'admin' ? 'rgba(37,99,235,0.15)' : item.role === 'artist' ? 'rgba(16,185,129,0.1)' : '#1a1a1a',
                    color: item.role === 'admin' ? '#60a5fa' : item.role === 'artist' ? '#34d399' : '#717171',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {item.role}
                  </span>
                  {item.suspended_at && (
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      Suspended
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#717171' }}>{item.email}</p>
              </div>

              {/* Date */}
              <span style={{ fontSize: '12px', color: '#555', flexShrink: 0 }}>
                {new Date(item.created_at).toLocaleDateString()}
              </span>

              {/* Action — no action on other admins */}
              {item.role !== 'admin' && (
                item.suspended_at ? (
                  <button
                    onClick={() => openConfirm('unsuspend', item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 12px', borderRadius: '8px',
                      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                      color: '#34d399', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={13} /> Restore
                  </button>
                ) : (
                  <button
                    onClick={() => openConfirm('suspend', item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 12px', borderRadius: '8px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                      color: '#ef4444', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                    }}
                  >
                    <ShieldX size={13} /> Suspend
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reason input in confirm dialog is handled below */}
      {confirm.open && meta && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div onClick={() => setConfirm(c => ({ ...c, open: false }))}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'relative', zIndex: 1, background: '#1a1a1a',
            border: '1px solid #2a2a2a', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: confirm.type === 'unsuspend' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${confirm.type === 'unsuspend' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            }}>
              <AlertTriangle size={20} color={confirm.type === 'unsuspend' ? '#34d399' : '#ef4444'} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {meta.title}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#b3b3b3', lineHeight: 1.6, marginBottom: '16px' }}>
              {meta.desc}
            </p>
            <textarea
              placeholder="Reason (optional)"
              value={confirm.reason}
              onChange={e => setConfirm(c => ({ ...c, reason: e.target.value }))}
              rows={2}
              style={{
                width: '100%', background: '#111', border: '1px solid #2a2a2a',
                borderRadius: '8px', color: '#fff', fontSize: '13px',
                padding: '10px 12px', fontFamily: 'inherit', resize: 'none',
                outline: 'none', marginBottom: '20px', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirm(c => ({ ...c, open: false }))}
                style={{
                  flex: 1, padding: '11px', background: '#282828',
                  border: '1px solid #3a3a3a', borderRadius: '10px',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Cancel</button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: '11px',
                  background: confirm.type === 'unsuspend' ? '#059669' : '#ef4444',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >{meta.label}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

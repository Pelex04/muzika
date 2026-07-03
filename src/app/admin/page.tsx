'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Music2, Disc3, Users, Trash2, ShieldX, ShieldCheck, AlertTriangle, Search, RefreshCw, BookOpen, PenLine, Megaphone, Check, X } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import Link from 'next/link'

type Tab = 'tracks' | 'albums' | 'users' | 'blog' | 'banner_requests'

interface AdminItem {
  id: string
  title?: string
  full_name?: string
  email?: string
  genre?: string
  category?: string
  cover_url?: string
  play_count?: number
  role?: string
  status?: string
  message?: string
  suspended_at?: string | null
  suspended_reason?: string | null
  created_at: string
  artist?: { stage_name: string; profile?: { email: string }; avatar_url?: string }
  author?: { full_name: string; email: string }
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) ?? 'tracks'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [items, setItems] = useState<AdminItem[]>([])
  const [filtered, setFiltered] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{
    open: boolean
    type: 'delete_track' | 'delete_album' | 'delete_blog' | 'suspend' | 'unsuspend' | null
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
      (i.artist?.stage_name ?? '').toLowerCase().includes(q) ||
      (i.author?.full_name ?? '').toLowerCase().includes(q)
    ))
  }, [search, items])

  const openConfirm = (type: typeof confirm.type, item: AdminItem) =>
    setConfirm({ open: true, type, item, reason: '' })

  const handleConfirm = async () => {
    const { type, item, reason } = confirm
    if (!type || !item) return
    setConfirm(c => ({ ...c, open: false }))

    let url = ''
    let method = 'DELETE'
    let body: Record<string, string> = { reason }

    if (type === 'delete_track')  url = `/api/admin/tracks/${item.id}`
    else if (type === 'delete_album') url = `/api/admin/albums/${item.id}`
    else if (type === 'delete_blog')  url = `/api/admin/blog/${item.id}`
    else if (type === 'suspend')   { url = `/api/admin/users/${item.id}`; method = 'PATCH'; body = { action: 'suspend', reason } }
    else if (type === 'unsuspend') { url = `/api/admin/users/${item.id}`; method = 'PATCH'; body = { action: 'unsuspend', reason } }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const label =
        type === 'delete_track'  ? 'Track removed' :
        type === 'delete_album'  ? 'Album removed' :
        type === 'delete_blog'   ? 'Post removed' :
        type === 'suspend'       ? 'Account suspended' : 'Account restored'
      notify.success(label)

      if (type === 'suspend' || type === 'unsuspend') {
        const now = type === 'suspend' ? new Date().toISOString() : null
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, suspended_at: now } : i))
        setFiltered(prev => prev.map(i => i.id === item.id ? { ...i, suspended_at: now } : i))
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
    { key: 'tracks',          label: 'Tracks',   icon: Music2 },
    { key: 'albums',          label: 'Albums',   icon: Disc3 },
    { key: 'blog',            label: 'Blog',     icon: BookOpen },
    { key: 'users',           label: 'Users',    icon: Users },
    { key: 'banner_requests', label: 'Banners',  icon: Megaphone },
  ]

  const confirmMeta = {
    delete_track: { title: 'Remove track',     desc: `Remove "${confirm.item?.title}"? This cannot be undone.`,                                             label: 'Remove track',  danger: true },
    delete_album: { title: 'Remove album',     desc: `Remove "${confirm.item?.title}" and all its tracks? This cannot be undone.`,                          label: 'Remove album',  danger: true },
    delete_blog:  { title: 'Delete post',      desc: `Delete "${confirm.item?.title}"? This cannot be undone.`,                                             label: 'Delete post',   danger: true },
    suspend:      { title: 'Suspend account',  desc: `Suspend ${confirm.item?.full_name ?? confirm.item?.email}? They'll be signed out immediately.`,       label: 'Suspend',       danger: true },
    unsuspend:    { title: 'Restore account',  desc: `Restore access for ${confirm.item?.full_name ?? confirm.item?.email}?`,                               label: 'Restore',       danger: false },
  }
  const meta = confirm.type ? confirmMeta[confirm.type] : null

  return (
    <>
      <style>{`
        .admin-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; }
        .admin-write-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px; border: none;
          background: #2563eb; color: #fff; font-size: 13px; font-weight: 700;
          cursor: pointer; text-decoration: none; white-space: nowrap;
          font-family: inherit; flex-shrink: 0;
        }
        .admin-write-btn:hover { background: #1d4ed8; }
        .admin-tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
        .admin-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px; border: none;
          font-weight: 600; font-size: 13px; cursor: pointer;
          font-family: inherit; transition: all .15s; white-space: nowrap;
        }
        .admin-tab-count {
          border-radius: 5px; padding: 1px 6px; font-size: 11px;
        }
        .admin-search {
          display: flex; align-items: center; gap: 10px;
          background: #141414; border: 1px solid #2a2a2a;
          border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;
        }
        .admin-search input {
          flex: 1; background: none; border: none; outline: none;
          color: #fff; font-size: 14px; font-family: inherit;
        }
        .admin-refresh {
          padding: 8px 12px; border-radius: 10px;
          border: 1px solid #2a2a2a; background: none;
          color: #717171; cursor: pointer; display: flex; align-items: center; gap: 5px;
          font-size: 13px; font-family: inherit; white-space: nowrap;
        }
        .admin-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 13px; border-radius: 10px;
          background: #111; border: 1px solid #1a1a1a; margin-bottom: 4px;
        }
        .admin-item-thumb {
          width: 42px; height: 42px; border-radius: 8px;
          background: #1f1f1f; flex-shrink: 0; overflow: hidden;
        }
        .admin-item-info { flex: 1; min-width: 0; }
        .admin-item-title { font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-item-sub { font-size: 12px; color: #717171; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-item-date { font-size: 12px; color: #555; flex-shrink: 0; display: none; }
        @media (min-width: 480px) { .admin-item-date { display: block; } }
        .admin-btn-remove {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 8px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
          color: #ef4444; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit; flex-shrink: 0; white-space: nowrap;
        }
        .admin-btn-suspend {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 8px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
          color: #ef4444; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit; flex-shrink: 0; white-space: nowrap;
        }
        .admin-btn-restore {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 8px;
          background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
          color: #34d399; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit; flex-shrink: 0; white-space: nowrap;
        }
        .admin-badge {
          font-size: 11px; font-weight: 700; padding: 2px 7px;
          border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .admin-overlay {
          position: fixed; inset: 0; z-index: 999;
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .admin-modal {
          position: relative; z-index: 1; background: #1a1a1a;
          border: 1px solid #2a2a2a; border-radius: 16px; padding: 24px;
          width: 100%; max-width: 400px; box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }
        .admin-modal textarea {
          width: 100%; background: #111; border: 1px solid #2a2a2a;
          border-radius: 8px; color: #fff; font-size: 13px;
          padding: 10px 12px; font-family: inherit; resize: none;
          outline: none; margin-bottom: 18px; box-sizing: border-box;
        }
        .admin-modal-btns { display: flex; gap: 10px; }
        .admin-modal-cancel {
          flex: 1; padding: 11px; background: #282828;
          border: 1px solid #3a3a3a; border-radius: 10px;
          color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
        }
        .admin-modal-confirm {
          flex: 1; padding: 11px; border: none; border-radius: 10px;
          color: #fff; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit;
        }
        .admin-empty { text-align: center; padding: 48px 20px; color: #717171; font-size: 14px; }
        .admin-spinner {
          width: 26px; height: 26px; border: 2px solid #2563eb;
          border-top-color: transparent; border-radius: 50%;
          animation: spin 0.8s linear infinite; margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px', marginBottom: '3px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#717171', fontSize: '13px' }}>Manage content and accounts</p>
        </div>
        <Link href="/blog/new" className="admin-write-btn">
          <PenLine size={14} /> Write Post
        </Link>
      </div>

      {/* Tabs + refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className="admin-tab" style={{
            background: tab === key ? '#2563eb' : '#1a1a1a',
            color: tab === key ? '#fff' : '#b3b3b3',
          }}>
            <Icon size={14} />
            {label}
            <span className="admin-tab-count" style={{
              background: tab === key ? 'rgba(255,255,255,0.2)' : '#2a2a2a',
            }}>
              {tab === key ? items.length : ''}
            </span>
          </button>
        ))}
        <button onClick={load} className="admin-refresh" style={{ marginLeft: 'auto' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="admin-search">
        <Search size={14} color="#717171" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}…`}
        />
      </div>

      {/* Items */}
      {loading ? (
        <div style={{ padding: '48px 0' }}><div className="admin-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">No {tab} found</div>
      ) : (
        <div>
          {/* TRACKS */}
          {tab === 'tracks' && filtered.map(item => (
            <div key={item.id} className="admin-item">
              <div className="admin-item-thumb">
                {item.cover_url && <img src={item.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div className="admin-item-info">
                <div className="admin-item-title">{item.title}</div>
                <div className="admin-item-sub">{item.artist?.stage_name} · {item.genre} · {item.play_count ?? 0} plays</div>
              </div>
              <span className="admin-item-date">{new Date(item.created_at).toLocaleDateString()}</span>
              <button className="admin-btn-remove" onClick={() => openConfirm('delete_track', item)}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))}

          {/* ALBUMS */}
          {tab === 'albums' && filtered.map(item => (
            <div key={item.id} className="admin-item">
              <div className="admin-item-thumb">
                {item.cover_url && <img src={item.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div className="admin-item-info">
                <div className="admin-item-title">{item.title}</div>
                <div className="admin-item-sub">{item.artist?.stage_name} · {item.genre}</div>
              </div>
              <span className="admin-item-date">{new Date(item.created_at).toLocaleDateString()}</span>
              <button className="admin-btn-remove" onClick={() => openConfirm('delete_album', item)}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))}

          {/* BLOG */}
          {tab === 'blog' && filtered.map(item => (
            <div key={item.id} className="admin-item">
              <div className="admin-item-thumb" style={{ borderRadius: '6px' }}>
                {item.cover_url
                  ? <img src={item.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#0d1b3e', display: 'grid', placeItems: 'center' }}>
                      <BookOpen size={16} color="#2563eb" />
                    </div>
                }
              </div>
              <div className="admin-item-info">
                <div className="admin-item-title">{item.title}</div>
                <div className="admin-item-sub">
                  {item.author?.full_name ?? 'Admin'} · {item.category?.replace('_', ' ')}
                </div>
              </div>
              <span className="admin-item-date">{new Date(item.created_at).toLocaleDateString()}</span>
              <button className="admin-btn-remove" onClick={() => openConfirm('delete_blog', item)}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          ))}

          {/* USERS */}
          {tab === 'users' && filtered.map(item => (
            <div key={item.id} className="admin-item" style={{ opacity: item.suspended_at ? 0.65 : 1 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flex: 'shrink: 0',
                background: item.suspended_at ? '#2a1a1a' : '#0d1b3e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '14px', fontWeight: 700, color: '#fff',
              }}>
                {item.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="admin-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="admin-item-title" style={{ marginBottom: 0 }}>
                    {item.full_name || 'No name'}
                  </span>
                  <span className="admin-badge" style={{
                    background: item.role === 'admin' ? 'rgba(37,99,235,0.15)' : item.role === 'artist' ? 'rgba(16,185,129,0.1)' : '#1a1a1a',
                    color: item.role === 'admin' ? '#60a5fa' : item.role === 'artist' ? '#34d399' : '#717171',
                  }}>{item.role}</span>
                  {item.suspended_at && (
                    <span className="admin-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                      Suspended
                    </span>
                  )}
                </div>
                <div className="admin-item-sub">{item.email}</div>
              </div>
              <span className="admin-item-date">{new Date(item.created_at).toLocaleDateString()}</span>
              {item.role !== 'admin' && (
                item.suspended_at
                  ? <button className="admin-btn-restore" onClick={() => openConfirm('unsuspend', item)}><ShieldCheck size={12} /> Restore</button>
                  : <button className="admin-btn-suspend" onClick={() => openConfirm('suspend', item)}><ShieldX size={12} /> Suspend</button>
              )}
            </div>
          ))}

          {/* BANNER REQUESTS */}
          {tab === 'banner_requests' && filtered.map(item => (
            <div key={item.id} className="admin-item">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', display: 'grid', placeItems: 'center' }}>
                {(item as any).artist?.avatar_url
                  ? <img src={(item as any).artist.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Megaphone size={16} color="#555" />}
              </div>
              <div className="admin-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="admin-item-title" style={{ marginBottom: 0 }}>{(item as any).artist?.stage_name ?? 'Unknown artist'}</span>
                  <span className="admin-badge" style={{
                    background: item.status === 'approved' ? 'rgba(34,197,94,0.1)' : item.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                    color: item.status === 'approved' ? '#4ade80' : item.status === 'rejected' ? '#f87171' : '#fbbf24',
                  }}>{item.status}</span>
                </div>
                {item.message && <div className="admin-item-sub">"{item.message}"</div>}
              </div>
              <span className="admin-item-date">{new Date(item.created_at).toLocaleDateString()}</span>
              {item.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/admin/banner-requests/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
                      if (res.ok) { notify.success('Banner request approved'); load() } else notify.error('Failed')
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Check size={11} /> Approve
                  </button>
                  <button
                    onClick={async () => {
                      const note = prompt('Reason for rejection (optional):')
                      const res = await fetch(`/api/admin/banner-requests/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', admin_note: note }) })
                      if (res.ok) { notify.success('Request rejected'); load() } else notify.error('Failed')
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <X size={11} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {confirm.open && meta && (
        <div className="admin-overlay">
          <div onClick={() => setConfirm(c => ({ ...c, open: false }))}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div className="admin-modal">
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', marginBottom: '14px',
              background: meta.danger ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${meta.danger ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color={meta.danger ? '#ef4444' : '#34d399'} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{meta.title}</h3>
            <p style={{ fontSize: '13px', color: '#b3b3b3', lineHeight: 1.6, marginBottom: '14px' }}>{meta.desc}</p>
            <textarea
              rows={2}
              placeholder="Reason (optional)"
              value={confirm.reason}
              onChange={e => setConfirm(c => ({ ...c, reason: e.target.value }))}
              className="admin-modal textarea"
            />
            <div className="admin-modal-btns">
              <button className="admin-modal-cancel" onClick={() => setConfirm(c => ({ ...c, open: false }))}>
                Cancel
              </button>
              <button
                className="admin-modal-confirm"
                style={{ background: meta.danger ? '#ef4444' : '#059669' }}
                onClick={handleConfirm}
              >
                {meta.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

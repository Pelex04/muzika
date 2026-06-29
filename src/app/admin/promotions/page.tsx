'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Eye, EyeOff, ChevronLeft, Check } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import Link from 'next/link'

interface Promotion {
  id: string
  label: string
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  gradient: string
  published: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

const GRADIENTS = [
  { label: 'Ocean Blue',   value: 'linear-gradient(130deg,#0f2460 0%,#1a3a8f 50%,#2563eb 100%)' },
  { label: 'Violet',       value: 'linear-gradient(130deg,#1e0a3c 0%,#4c1d95 50%,#7c3aed 100%)' },
  { label: 'Emerald',      value: 'linear-gradient(130deg,#062018 0%,#065f46 50%,#059669 100%)' },
  { label: 'Crimson',      value: 'linear-gradient(130deg,#1f0a0a 0%,#7f1d1d 50%,#dc2626 100%)' },
  { label: 'Amber',        value: 'linear-gradient(130deg,#1a0f00 0%,#78350f 50%,#d97706 100%)' },
  { label: 'Slate',        value: 'linear-gradient(130deg,#0f172a 0%,#1e293b 50%,#334155 100%)' },
  { label: 'Rose Gold',    value: 'linear-gradient(130deg,#1a0a10 0%,#831843 50%,#db2777 100%)' },
  { label: 'Teal',         value: 'linear-gradient(130deg,#042f2e 0%,#0f766e 50%,#14b8a6 100%)' },
]

const EMPTY: Omit<Promotion, 'id' | 'created_at'> = {
  label: '🎵 Limited Offer',
  title: '',
  subtitle: '',
  cta_text: 'Get Started',
  cta_url: '/become-artist',
  gradient: GRADIENTS[0].value,
  published: false,
  starts_at: null,
  ends_at: null,
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/promotions')
    const data = await res.json()
    setPromos(data.promotions ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ ...EMPTY })
    setShowForm(true)
  }

  const openEdit = (p: Promotion) => {
    setEditing(p)
    setForm({
      label:    p.label,
      title:    p.title,
      subtitle: p.subtitle,
      cta_text: p.cta_text,
      cta_url:  p.cta_url,
      gradient: p.gradient,
      published: p.published,
      starts_at: p.starts_at,
      ends_at:   p.ends_at,
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) { notify.error('Title is required'); return }
    setSaving(true)
    const url = editing ? `/api/admin/promotions/${editing.id}` : '/api/admin/promotions'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      notify.success(editing ? 'Banner updated' : 'Banner created')
      setShowForm(false)
      load()
    } else {
      const d = await res.json()
      notify.error(d.error ?? 'Failed to save')
    }
  }

  const togglePublish = async (p: Promotion) => {
    const res = await fetch(`/api/admin/promotions/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    })
    if (res.ok) {
      notify.success(p.published ? 'Banner unpublished' : 'Banner published — it\'s live!')
      load()
    }
  }

  const remove = async (p: Promotion) => {
    if (!confirm(`Delete "${p.title}"?`)) return
    const res = await fetch(`/api/admin/promotions/${p.id}`, { method: 'DELETE' })
    if (res.ok) { notify.success('Banner deleted'); load() }
  }

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <style>{`
        .promo-back { display: flex; align-items: center; gap: 4px; color: #717171; text-decoration: none; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .promo-back:hover { color: #fff; }
        .promo-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 12px; }
        .promo-new-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; border: none; background: #2563eb; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .promo-new-btn:hover { background: #1d4ed8; }
        .promo-card { background: #111; border: 1px solid #1f1f1f; border-radius: 14px; overflow: hidden; margin-bottom: 10px; }
        .promo-preview { height: 80px; padding: 16px 20px; display: flex; align-items: flex-end; position: relative; }
        .promo-preview-title { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
        .promo-preview-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
        .promo-card-body { padding: 14px 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .promo-card-info { flex: 1; min-width: 0; }
        .promo-card-sub { font-size: 12px; color: #555; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .promo-card-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .promo-pill-live { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #4ade80; }
        .promo-pill-draft { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; background: rgba(255,255,255,0.04); border: 1px solid #2a2a2a; color: #555; }
        .promo-icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #2a2a2a; background: #1a1a1a; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #717171; transition: all .15s; }
        .promo-icon-btn:hover { border-color: #3a3a3a; color: #fff; }

        /* Form */
        .promo-form-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
        @media (min-width: 640px) { .promo-form-overlay { align-items: center; padding: 20px; } }
        .promo-form-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); }
        .promo-form-sheet {
          position: relative; z-index: 1; background: #141414;
          border: 1px solid #2a2a2a; width: 100%; max-width: 560px;
          border-radius: 20px 20px 0 0; max-height: 92vh; overflow-y: auto;
          padding: 24px 20px 32px;
        }
        @media (min-width: 640px) { .promo-form-sheet { border-radius: 20px; padding: 28px; } }
        .promo-form-title { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; margin-bottom: 20px; }
        .promo-field { margin-bottom: 16px; }
        .promo-label { font-size: 12px; font-weight: 600; color: #b3b3b3; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 7px; display: block; }
        .promo-input { width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; color: #fff; font-size: 14px; padding: 11px 14px; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color .15s; }
        .promo-input:focus { border-color: #2563eb; }
        .promo-input::placeholder { color: #555; }
        .promo-gradient-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        @media (min-width: 400px) { .promo-gradient-grid { grid-template-columns: repeat(4, 1fr); } }
        .promo-gradient-swatch { height: 36px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all .15s; position: relative; }
        .promo-gradient-swatch.active { border-color: #fff; transform: scale(1.05); }
        .promo-preview-live { border-radius: 12px; overflow: hidden; padding: 18px 20px; margin-bottom: 20px; }
        .promo-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #1a1a1a; border-radius: 10px; border: 1px solid #2a2a2a; margin-bottom: 16px; }
        .promo-toggle-label { font-size: 14px; font-weight: 600; color: #fff; }
        .promo-toggle-sub { font-size: 12px; color: #717171; margin-top: 1px; }
        .promo-toggle { width: 40px; height: 22px; border-radius: 100px; border: none; cursor: pointer; transition: background .2s; position: relative; flex-shrink: 0; }
        .promo-toggle-thumb { position: absolute; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .2s; }
        .promo-form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .promo-btn-cancel { flex: 1; padding: 12px; background: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .promo-btn-save { flex: 2; padding: 12px; background: #2563eb; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .promo-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .promo-date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .promo-empty { text-align: center; padding: 48px 20px; color: #555; font-size: 14px; }
      `}</style>

      <Link href="/admin" className="promo-back">
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>

      <div className="promo-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.4px', marginBottom: '3px' }}>
            Promotions
          </h1>
          <p style={{ color: '#717171', fontSize: '13px' }}>
            Manage the banner shown on the home page
          </p>
        </div>
        <button className="promo-new-btn" onClick={openNew}>
          <Plus size={14} /> New Banner
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: '26px', height: '26px', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : promos.length === 0 ? (
        <div className="promo-empty">No banners yet — create your first one.</div>
      ) : promos.map(p => (
        <div key={p.id} className="promo-card">
          {/* Live preview of the banner */}
          <div className="promo-preview" style={{ background: p.gradient }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
              <svg viewBox="0 0 400 80" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
                <g stroke="white" strokeWidth="1">
                  {[0,40,80,120,160,200,240,280,320,360,400].map((x, i) => (
                    <line key={i} x1={x} y1="0" x2={x - 20} y2="80" />
                  ))}
                </g>
              </svg>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              {p.label && <div className="promo-preview-label">{p.label}</div>}
              <div className="promo-preview-title">{p.title}</div>
            </div>
          </div>

          {/* Card body */}
          <div className="promo-card-body">
            <div className="promo-card-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {p.published
                  ? <span className="promo-pill-live"><Check size={10} /> Live</span>
                  : <span className="promo-pill-draft">Draft</span>
                }
                <span style={{ fontSize: '12px', color: '#555' }}>
                  CTA: {p.cta_text} → {p.cta_url}
                </span>
              </div>
              {p.subtitle && (
                <div className="promo-card-sub">{p.subtitle}</div>
              )}
            </div>
            <div className="promo-card-actions">
              <button
                className="promo-icon-btn"
                onClick={() => togglePublish(p)}
                title={p.published ? 'Unpublish' : 'Publish'}
                style={{ color: p.published ? '#4ade80' : undefined }}
              >
                {p.published ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button className="promo-icon-btn" onClick={() => openEdit(p)} title="Edit">
                <Pencil size={14} />
              </button>
              <button className="promo-icon-btn" onClick={() => remove(p)} title="Delete"
                style={{ color: '#ef4444' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Form sheet */}
      {showForm && (
        <div className="promo-form-overlay">
          <div className="promo-form-backdrop" onClick={() => setShowForm(false)} />
          <div className="promo-form-sheet">
            <h2 className="promo-form-title">{editing ? 'Edit Banner' : 'New Banner'}</h2>

            {/* Live preview */}
            <div className="promo-preview-live" style={{ background: form.gradient }}>
              <div style={{ position: 'relative' }}>
                {form.label && (
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    {form.label}
                  </p>
                )}
                <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
                  {form.title || 'Your banner title'}
                </p>
                {form.subtitle && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '3px' }}>{form.subtitle}</p>
                )}
              </div>
            </div>

            {/* Gradient picker */}
            <div className="promo-field">
              <label className="promo-label">Background</label>
              <div className="promo-gradient-grid">
                {GRADIENTS.map(g => (
                  <div
                    key={g.value}
                    className={`promo-gradient-swatch ${form.gradient === g.value ? 'active' : ''}`}
                    style={{ background: g.value }}
                    onClick={() => set('gradient', g.value)}
                    title={g.label}
                  />
                ))}
              </div>
            </div>

            <div className="promo-field">
              <label className="promo-label">Eyebrow label</label>
              <input className="promo-input" placeholder="e.g. 🎵 Limited Offer" value={form.label} onChange={e => set('label', e.target.value)} />
            </div>

            <div className="promo-field">
              <label className="promo-label">Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="promo-input" placeholder="Upload Your Music Free" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div className="promo-field">
              <label className="promo-label">Subtitle</label>
              <input className="promo-input" placeholder="Short description shown below the title" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
            </div>

            <div className="promo-date-row" style={{ marginBottom: '16px' }}>
              <div>
                <label className="promo-label">CTA Button text</label>
                <input className="promo-input" placeholder="Get Started" value={form.cta_text} onChange={e => set('cta_text', e.target.value)} />
              </div>
              <div>
                <label className="promo-label">CTA Link</label>
                <input className="promo-input" placeholder="/become-artist" value={form.cta_url} onChange={e => set('cta_url', e.target.value)} />
              </div>
            </div>

            <div className="promo-date-row" style={{ marginBottom: '16px' }}>
              <div>
                <label className="promo-label">Start date (optional)</label>
                <input className="promo-input" type="datetime-local" value={form.starts_at?.slice(0, 16) ?? ''} onChange={e => set('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </div>
              <div>
                <label className="promo-label">End date (optional)</label>
                <input className="promo-input" type="datetime-local" value={form.ends_at?.slice(0, 16) ?? ''} onChange={e => set('ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </div>
            </div>

            {/* Publish toggle */}
            <div className="promo-toggle-row">
              <div>
                <div className="promo-toggle-label">Publish immediately</div>
                <div className="promo-toggle-sub">Makes this the active banner on the home page</div>
              </div>
              <button
                className="promo-toggle"
                style={{ background: form.published ? '#2563eb' : '#2a2a2a' }}
                onClick={() => set('published', !form.published)}
              >
                <div className="promo-toggle-thumb" style={{ left: form.published ? '21px' : '3px' }} />
              </button>
            </div>

            <div className="promo-form-actions">
              <button className="promo-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="promo-btn-save" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

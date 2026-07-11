'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import Link from 'next/link'

export default function AdminBrandingPage() {
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setCurrentLogo(data.logoUrl)
      setLoading(false)
    })()
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { notify.error('Please choose an image file'); return }
    if (f.size > 5 * 1024 * 1024) { notify.error('Image must be under 5MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const save = async () => {
    if (!file) return
    setSaving(true)
    try {
      const signRes = await fetch('/api/admin/upload/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })
      const { signedUrl, path, error: signError } = await signRes.json()
      if (signError || !signedUrl) throw new Error(signError ?? 'Could not get upload URL')

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('File upload failed')

      const saveRes = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoPath: path }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveData.error ?? 'Could not save logo')

      setCurrentLogo(saveData.logoUrl)
      setFile(null)
      setPreview(null)
      notify.success('Logo updated', 'It now shows everywhere across the app.')
    } catch (err: any) {
      notify.error(err?.message ?? 'Could not update logo')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#717171', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
        <ChevronLeft size={15} /> Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Branding</h1>
      <p style={{ fontSize: '13px', color: '#717171', marginBottom: '28px' }}>
        Upload a new logo and it will update everywhere the logo appears across the app — sidebar, auth pages, landing page, admin header, and favicon.
      </p>

      <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#717171', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
          Current Logo
        </p>

        {loading ? (
          <div style={{ width: '96px', height: '96px', borderRadius: '20px', background: '#0d0d0d' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '20px', overflow: 'hidden', background: '#0d0d0d', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {(preview || currentLogo)
                ? <img src={preview || currentLogo || undefined} alt="Current logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <ImageIcon size={28} color="#2a2a2a" />
              }
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>
                {preview ? 'New logo (preview)' : currentLogo ? 'Custom logo active' : 'Using default logo'}
              </p>
              <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>Square image recommended, PNG with transparency works best</p>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: '#181818', border: '1px solid #2a2a2a', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Upload size={14} /> Choose Image
          </button>
          {file && (
            <button
              onClick={save}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: '#2563eb', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save & Apply Everywhere'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

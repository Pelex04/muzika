'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Image as ImageIcon, Loader2, Send } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import MobileTopBar from '@/components/layout/MobileTopBar'

const CATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'artist_blog', label: 'Artist Blog' },
  { value: 'interview', label: 'Interview' },
]

export default function NewPostForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('news')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#2563EB'
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#2a2a2a'
    e.target.style.boxShadow = 'none'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { notify.error('Title is required'); return }
    if (!content.trim()) { notify.error('Write something in the body'); return }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('excerpt', excerpt.trim())
      formData.append('content', content.trim())
      formData.append('category', category)
      if (coverFile) formData.append('cover', coverFile)

      const res = await fetch('/api/blog', { method: 'POST', body: formData })
      const result = await res.json()

      if (!res.ok) {
        notify.error(result.error ?? 'Failed to publish post')
        setSubmitting(false)
        return
      }

      notify.success('Post published!')
      router.push('/admin?tab=blog')
      router.refresh()
    } catch {
      notify.error('Connection error. Please try again.')
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #2a2a2a', borderRadius: '8px',
    fontSize: '14px', color: '#ffffff', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color .2s, box-shadow .2s', background: '#181818',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#b3b3b3', textTransform: 'uppercase',
    letterSpacing: '0.7px', marginBottom: '7px',
  }

  return (
    <>
      <style>{`
        .new-post-wrap { max-width: 680px; margin: 0 auto; padding: 20px 16px 100px; }
        .desktop-header { display: none; }
        @media (min-width: 768px) { .desktop-header { display: flex; } }
        .cat-pill {
          padding: 8px 16px; border-radius: 20px; cursor: pointer;
          font-size: 13px; font-weight: 600; border: 1.5px solid #2a2a2a;
          background: transparent; color: #b3b3b3; transition: all .15s;
        }
        .cat-pill.on { background: #ffffff; border-color: #ffffff; color: #000000; }
        .drop-zone-mini {
          border: 2px dashed #3a3a3a; border-radius: 12px;
          padding: 24px; text-align: center; cursor: pointer;
          transition: all .2s; background: #181818;
        }
        .drop-zone-mini:hover { border-color: #2563EB; background: #1a2332; }
      `}</style>

      <MobileTopBar eyebrow="Admin" title="Write Post" />

      <div className="new-post-wrap">
        <div className="desktop-header" style={{ alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b3b3b3', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            <ChevronLeft size={18} /> Back to Admin
          </Link>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Write a new post
        </h1>
        <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px' }}>
          Share news, an artist update, or an interview with the Playback community.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.value} type="button"
                  className={`cat-pill ${category === c.value ? 'on' : ''}`}
                  onClick={() => setCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cover image */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Cover Image (optional)</label>
            <label className="drop-zone-mini" style={{ display: 'block' }}>
              {coverPreview ? (
                <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#DBEAFE', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                    <ImageIcon size={20} color="#2563EB" />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Click to upload a cover image</p>
                  <p style={{ fontSize: '12px', color: '#717171', marginTop: '2px' }}>JPG, PNG · Max 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={onCoverChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Title</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Give your post a title…"
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Short summary <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(shown in the feed)</span>
            </label>
            <input
              type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="One sentence that sums it up…"
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Story</label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write your post here…"
              rows={10}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '220px', lineHeight: 1.6 }}
              onFocus={focus} onBlur={blur}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '14px',
              background: submitting ? '#717171' : '#ffffff',
              color: '#000000', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'background .15s',
            }}
          >
            {submitting
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Publishing…</>
              : <><Send size={16} /> Publish Post</>
            }
          </button>
        </form>

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </>
  )
}

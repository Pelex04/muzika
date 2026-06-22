'use client'

import { useState, useRef } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, Artist } from '@/types'

const GENRES = ['Afropop', 'Gospel', 'Hip-Hop', 'Reggae', 'RnB', 'Traditional', 'Jazz', 'Dancehall']
const CITIES = ['Blantyre', 'Lilongwe', 'Mzuzu', 'Zomba', 'Kasungu', 'Balaka', 'Mangochi', 'Other']

interface Props {
  profile: Profile
  artist: Artist | null
  onClose: () => void
  onSaved: () => void
}

export default function EditProfileModal({ profile, artist, onClose, onSaved }: Props) {
  const isArtist = !!artist
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [stageName, setStageName] = useState(artist?.stage_name ?? '')
  const [genre, setGenre] = useState(artist?.genre ?? '')
  const [location, setLocation] = useState(artist?.location ?? '')
  const [artistBio, setArtistBio] = useState(artist?.bio ?? '')

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    isArtist ? artist?.avatar_url ?? null : profile.avatar_url ?? null
  )
  const [saving, setSaving] = useState(false)

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#2563EB'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#3a3a3a'
  }

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB')
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let avatarPath: string | undefined

      if (avatarFile) {
        const urlRes = await fetch('/api/profile/avatar-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: avatarFile.name }),
        })
        const { signedUrl, path, error } = await urlRes.json()
        if (error || !signedUrl) throw new Error(error ?? 'Could not get upload URL')

        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': avatarFile.type || 'application/octet-stream' },
          body: avatarFile,
        })
        if (!uploadRes.ok) throw new Error('Photo upload failed')
        avatarPath = path
      }

      const payload: Record<string, any> = {
        full_name: fullName,
        bio,
      }
      if (avatarPath) {
        // Photo applies to whichever identity is shown publicly
        if (isArtist) payload.artist_avatar_path = avatarPath
        else payload.avatar_path = avatarPath
      }
      if (isArtist) {
        payload.stage_name = stageName
        payload.genre = genre
        payload.location = location
        payload.artist_bio = artistBio
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) { toast.error(result.error ?? 'Could not save changes'); setSaving(false); return }

      toast.success('Profile updated')
      onSaved()
    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong')
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #3a3a3a', borderRadius: '8px',
    fontSize: '14px', color: '#ffffff', background: '#121212',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color .15s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#b3b3b3', textTransform: 'uppercase',
    letterSpacing: '0.6px', marginBottom: '6px',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#181818', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: '480px',
          maxHeight: '85vh', overflowY: 'auto',
          padding: '20px',
          animation: 'slideUpEdit .25s ease-out',
        }}
        className="md:rounded-2xl md:mb-[5vh]"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: '#2a2a2a', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <X size={16} color="#b3b3b3" />
          </button>
        </div>

        {/* Avatar picker */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'relative', width: '88px', height: '88px',
              borderRadius: '50%', cursor: 'pointer',
              background: isArtist ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : '#0D1B3E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '32px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>
                  {(isArtist ? stageName : fullName)?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
            }
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#ffffff', display: 'grid', placeItems: 'center',
              border: '3px solid #181818',
            }}>
              <Camera size={14} color="#000000" />
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarChange} style={{ display: 'none' }} />
        </div>

        {/* Listener fields */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Full Name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ marginBottom: isArtist ? '20px' : '16px' }}>
          <label style={labelStyle}>About You</label>
          <textarea
            value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Tell us a little about yourself…"
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
            onFocus={focus} onBlur={blur}
          />
        </div>

        {/* Artist-only fields */}
        {isArtist && (
          <>
            <div style={{ height: '1px', background: '#2a2a2a', margin: '20px 0' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#717171', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
              Artist Profile
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Stage Name</label>
              <input value={stageName} onChange={e => setStageName(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Genre</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {GENRES.map(g => (
                  <button
                    key={g} type="button"
                    onClick={() => setGenre(g)}
                    style={{
                      padding: '6px 13px', borderRadius: '20px', cursor: 'pointer',
                      fontSize: '12.5px', fontWeight: 600, fontFamily: 'inherit',
                      border: '1.5px solid', borderColor: genre === g ? '#ffffff' : '#3a3a3a',
                      background: genre === g ? '#ffffff' : 'transparent',
                      color: genre === g ? '#000000' : '#b3b3b3',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>City</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {CITIES.map(city => (
                  <button
                    key={city} type="button"
                    onClick={() => setLocation(city)}
                    style={{
                      padding: '6px 13px', borderRadius: '20px', cursor: 'pointer',
                      fontSize: '12.5px', fontWeight: 600, fontFamily: 'inherit',
                      border: '1.5px solid', borderColor: location === city ? '#ffffff' : '#3a3a3a',
                      background: location === city ? '#ffffff' : 'transparent',
                      color: location === city ? '#000000' : '#b3b3b3',
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Artist Bio</label>
              <textarea
                value={artistBio} onChange={e => setArtistBio(e.target.value)}
                placeholder="Tell fans about your music…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                onFocus={focus} onBlur={blur}
              />
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '13px',
            background: saving ? '#717171' : '#ffffff',
            color: '#000000', border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : 'Save Changes'}
        </button>

        <style>{`
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes slideUpEdit { from{transform:translateY(100%)} to{transform:translateY(0)} }
        `}</style>
      </div>
    </div>
  )
}

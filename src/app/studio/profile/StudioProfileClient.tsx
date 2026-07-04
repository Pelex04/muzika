'use client'

import { useState } from 'react'
import { notify } from '@/components/ui/notify'
import { Globe } from 'lucide-react'

const GENRES = ['Afropop','Gospel','Hip-Hop','Reggae','RnB','Traditional','Jazz','Dancehall']
const SOCIALS = [
  { key: 'instagram', label: 'Instagram', ph: 'instagram.com/yourname' },
  { key: 'twitter',   label: 'X / Twitter', ph: 'x.com/yourname' },
  { key: 'facebook',  label: 'Facebook', ph: 'facebook.com/yourname' },
  { key: 'youtube',   label: 'YouTube', ph: 'youtube.com/@yourname' },
  { key: 'website',   label: 'Website', ph: 'yourwebsite.com' },
]

const inp = (extra?: object): React.CSSProperties => ({
  width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
  borderRadius: '10px', color: '#fff', fontSize: '14px',
  padding: '11px 14px', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', ...extra,
})
const lbl: React.CSSProperties = { display: 'block', color: '#b3b3b3', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px' }

interface Props {
  artist: { id: string; stage_name: string; genre: string; location: string; bio: string | null; avatar_url: string | null; social_links: Record<string,string> | null }
  profile: { full_name: string; email: string } | null
}

export default function StudioProfileClient({ artist, profile }: Props) {
  const sl = artist.social_links ?? {}
  const [stageName, setStageName] = useState(artist.stage_name)
  const [genre, setGenre] = useState(artist.genre)
  const [location, setLocation] = useState(artist.location ?? '')
  const [bio, setBio] = useState(artist.bio ?? '')
  const [instagram, setInstagram] = useState(sl.instagram ?? '')
  const [twitter, setTwitter] = useState(sl.twitter ?? '')
  const [facebook, setFacebook] = useState(sl.facebook ?? '')
  const [youtube, setYoutube] = useState(sl.youtube ?? '')
  const [website, setWebsite] = useState(sl.website ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: stageName, genre, location, artist_bio: bio,
        social_links: { instagram: instagram || null, twitter: twitter || null, facebook: facebook || null, youtube: youtube || null, website: website || null },
      }),
    })
    setSaving(false)
    if (res.ok) notify.success('Profile updated')
    else notify.error('Could not save changes')
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0 }}>Artist Profile</h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>Edit your public profile</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={lbl}>Stage Name</label>
          <input value={stageName} onChange={e => setStageName(e.target.value)} style={inp()} />
        </div>

        <div>
          <label style={lbl}>Genre</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {GENRES.map(g => (
              <button key={g} type="button" onClick={() => setGenre(g)}
                style={{ padding: '7px 14px', borderRadius: '100px', border: `1.5px solid ${genre === g ? '#2563eb' : '#2a2a2a'}`, background: genre === g ? 'rgba(37,99,235,0.15)' : 'transparent', color: genre === g ? '#60a5fa' : '#717171', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" style={inp()} />
        </div>

        <div>
          <label style={lbl}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell fans about your music…"
            style={{ ...inp(), resize: 'vertical', minHeight: '90px' }} />
        </div>

        {/* Social links */}
        <div>
          <label style={{ ...lbl, marginBottom: '12px' }}>Social Links</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SOCIALS.map(({ key, label, ph }) => {
              const vals: Record<string,string> = { instagram, twitter, facebook, youtube, website }
              const setters: Record<string,(v:string)=>void> = { instagram: setInstagram, twitter: setTwitter, facebook: setFacebook, youtube: setYoutube, website: setWebsite }
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={14} style={{ color: '#555', flexShrink: 0 }} />
                  <span style={{ color: '#555', fontSize: '12px', width: '90px', flexShrink: 0 }}>{label}</span>
                  <input value={vals[key]} onChange={e => setters[key](e.target.value)} placeholder={ph} style={{ ...inp(), flex: 1, padding: '9px 12px', fontSize: '13px' }} />
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={save} disabled={saving}
          style={{ background: '#2563eb', border: 'none', borderRadius: '12px', color: '#fff', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Music2, Mic, MapPin, FileText, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

const GENRES = ['Afropop', 'Gospel', 'Hip-Hop', 'Reggae', 'RnB', 'Traditional', 'Jazz', 'Dancehall', 'Amapiano']
const CITIES = ['Blantyre', 'Lilongwe', 'Mzuzu', 'Zomba', 'Kasungu', 'Balaka', 'Mangochi', 'Other']

const schema = z.object({
  stage_name: z.string().min(2, 'Stage name must be at least 2 characters').max(50),
  genre: z.string().min(1, 'Select a genre'),
  location: z.string().min(1, 'Select your city'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
})
type FormData = z.infer<typeof schema>

export default function BecomeArtistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { genre: '', location: '' },
  })

  const bio = watch('bio') || ''
  const selectedGenre = watch('genre')
  const selectedLocation = watch('location')

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#2563EB'
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#2a2a2a'
    e.target.style.boxShadow = 'none'
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/become-artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error ?? 'Something went wrong')
        setLoading(false)
        return
      }
      toast.success('Welcome to Playback as an artist!')
      router.push('/profile')
      router.refresh()
    } catch {
      toast.error('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const S = {
    page: {
      minHeight: '100vh', background: '#121212',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    } as React.CSSProperties,
    card: {
      background: '#181818', borderRadius: '20px', padding: '48px 44px',
      width: '100%', maxWidth: '520px',
      boxShadow: '0 4px 6px rgba(0,0,0,.3), 0 12px 40px rgba(0,0,0,.4)',
    } as React.CSSProperties,
    label: {
      display: 'block', fontSize: '11px', fontWeight: 700,
      color: '#b3b3b3', textTransform: 'uppercase' as const,
      letterSpacing: '0.7px', marginBottom: '7px',
    },
    input: {
      width: '100%', padding: '12px 14px 12px 40px',
      border: '1.5px solid #2a2a2a', borderRadius: '8px',
      fontSize: '14px', color: '#ffffff', outline: 'none',
      boxSizing: 'border-box' as const, fontFamily: 'inherit',
      transition: 'border-color .2s, box-shadow .2s', background: '#121212',
    },
    iconWrap: {
      position: 'absolute' as const, left: '13px',
      display: 'flex', alignItems: 'center', pointerEvents: 'none' as const,
    },
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <Mic size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Become an Artist
          </h1>
          <p style={{ fontSize: '14px', color: '#b3b3b3', lineHeight: 1.6 }}>
            Set up your artist profile to start uploading and selling your music on Playback.
          </p>
        </div>

        {/* What you get */}
        <div style={{ background: '#121212', borderRadius: '12px', padding: '16px 18px', marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>What you unlock</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Upload unlimited tracks',
              'Set your own MWK download prices',
              'Receive 85% of every sale directly',
              'Artist profile page with stats',
              'Write blog posts & artist updates',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#b3b3b3' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#DBEAFE', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Stage Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={S.label}>Stage Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={S.iconWrap}><Mic size={15} color="#717171" /></span>
              <input {...register('stage_name')} type="text" placeholder="Your artist name" style={S.input} onFocus={focus} onBlur={blur} />
            </div>
            {errors.stage_name && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.stage_name.message}</p>}
          </div>

          {/* Genre */}
          <div style={{ marginBottom: '18px' }}>
            <label style={S.label}>Primary Genre</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {GENRES.map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setValue('genre', g)}
                  style={{
                    padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    border: '1.5px solid',
                    borderColor: selectedGenre === g ? '#ffffff' : '#2a2a2a',
                    background: selectedGenre === g ? '#ffffff' : 'transparent',
                    color: selectedGenre === g ? '#000000' : '#b3b3b3',
                    transition: 'all .15s',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.genre && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.genre.message}</p>}
          </div>

          {/* Location */}
          <div style={{ marginBottom: '18px' }}>
            <label style={S.label}>Your City</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CITIES.map(city => (
                <button
                  key={city} type="button"
                  onClick={() => setValue('location', city)}
                  style={{
                    padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    border: '1.5px solid',
                    borderColor: selectedLocation === city ? '#ffffff' : '#2a2a2a',
                    background: selectedLocation === city ? '#ffffff' : 'transparent',
                    color: selectedLocation === city ? '#000000' : '#b3b3b3',
                    transition: 'all .15s',
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
            {errors.location && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.location.message}</p>}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '28px' }}>
            <label style={S.label}>
              Bio <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                {...register('bio')}
                placeholder="Tell fans about yourself and your music…"
                rows={3}
                style={{
                  ...S.input,
                  padding: '12px 14px',
                  resize: 'vertical',
                  minHeight: '90px',
                  fontFamily: 'inherit',
                }}
                onFocus={focus}
                onBlur={blur}
              />
              <span style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '11px', color: bio.length > 270 ? '#EF4444' : '#717171' }}>
                {bio.length}/300
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#717171' : '#ffffff',
              color: '#000000', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'background .15s', marginBottom: '14px',
            }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Setting up profile…</>
              : <><ChevronRight size={16} /> Create Artist Profile</>
            }
          </button>

          <Link href="/discover" style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: '#717171', textDecoration: 'none' }}>
            Not now — continue as listener
          </Link>
        </form>

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  )
}

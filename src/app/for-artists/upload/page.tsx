import PublicPageShell from '@/components/public/PublicPageShell'
import Link from 'next/link'
import { Music2, BarChart3, DollarSign, Star, Mail, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload Music · Playback',
  description: 'Why upload on Playback? Reach new fans, track your performance, and grow your career as an artist.',
}

const BENEFITS = [
  { icon: Music2, title: 'Reach New Fans', body: 'Share your music with listeners searching for new sounds.' },
  { icon: BarChart3, title: 'Track Your Performance', body: 'View plays, downloads, listeners, and audience insights.' },
  { icon: DollarSign, title: 'Earn from Your Music', body: 'Participate in future monetization opportunities and revenue sharing.' },
  { icon: Star, title: 'Build Your Artist Profile', body: 'Create your official artist page and grow your following.' },
]

const STEPS = [
  { title: 'Create an Artist Account', body: 'Sign up and create your artist profile.' },
  { title: 'Upload Your Music', body: 'Add your song, cover artwork, genre, lyrics, and credits.' },
  { title: 'Get Discovered', body: 'Your music becomes available for listeners to stream and share.' },
  { title: 'Grow Your Career', body: 'Track your performance and connect with your audience.' },
]

const REQUIREMENTS = [
  'You own the rights to the music',
  'Audio quality meets requirements',
  'Cover artwork follows guidelines',
  'Song information is complete',
]

export default function UploadMusicInfoPage() {
  return (
    <PublicPageShell>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>
        For Artists
      </p>
      <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '24px' }}>
        Why Upload on Playback?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '40px' }}>
        {BENEFITS.map(b => (
          <div key={b.title} style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '18px' }}>
            <b.icon size={20} color="#3b82f6" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{b.title}</p>
            <p style={{ color: '#717171', fontSize: '12px', lineHeight: 1.5 }}>{b.body}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '18px' }}>How It Works</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
        {STEPS.map((s, i) => (
          <div key={s.title} style={{ display: 'flex', gap: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
              {i + 1}
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>{s.title}</p>
              <p style={{ color: '#717171', fontSize: '13px', margin: 0 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>Upload Requirements</h2>
      <p style={{ color: '#717171', fontSize: '13px', marginBottom: '12px' }}>Before uploading, make sure:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {REQUIREMENTS.map(r => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={16} color="#4ade80" />
            <span style={{ color: '#b3b3b3', fontSize: '13px' }}>{r}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <div>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Supported audio</p>
          <p style={{ color: '#717171', fontSize: '13px' }}>MP3 · WAV · FLAC</p>
        </div>
        <div>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Supported artwork</p>
          <p style={{ color: '#717171', fontSize: '13px' }}>JPG · PNG</p>
        </div>
      </div>

      <Link
        href="/become-artist"
        style={{ display: 'inline-block', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '13px 28px', borderRadius: '10px', textDecoration: 'none', marginBottom: '32px' }}
      >
        Become an Artist
      </Link>

      <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Mail size={15} color="#717171" />
        <span style={{ color: '#717171', fontSize: '13px' }}>Need more help? </span>
        <a href="mailto:playbackcharts@gmail.com" style={{ color: '#60a5fa', fontSize: '13px' }}>playbackcharts@gmail.com</a>
      </div>
    </PublicPageShell>
  )
}

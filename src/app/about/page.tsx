import PublicPageShell from '@/components/public/PublicPageShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us · Playback',
  description: 'Discover. Share. Connect Through Music. Learn about Playback, Malawi\'s home for streaming and supporting local artists.',
}

export default function AboutPage() {
  return (
    <PublicPageShell>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>
        About Us
      </p>
      <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '10px' }}>
        Discover. Share. Connect Through Music.
      </h1>

      <div style={{ color: '#b3b3b3', fontSize: '15px', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '18px' }}>
          <strong style={{ color: '#fff' }}>Playback</strong> is a digital music platform built to connect artists and listeners through the power of music.
        </p>
        <p style={{ marginBottom: '18px' }}>
          We provide a space where artists can share their creativity, grow their audience, and connect with fans, while listeners can discover new songs, follow their favourite artists, and enjoy music from emerging and established creators.
        </p>
        <p style={{ marginBottom: '18px' }}>
          Our mission is to make music discovery easier and create more opportunities for artists to showcase their talent. We believe every artist deserves a platform where their music can be heard and every listener deserves access to fresh, diverse sounds.
        </p>
        <p>
          From local talent to global sounds, <strong style={{ color: '#fff' }}>Playback</strong> is building a community where music moves freely, artists grow, and fans stay connected.
        </p>
      </div>
    </PublicPageShell>
  )
}

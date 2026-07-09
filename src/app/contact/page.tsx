import PublicPageShell from '@/components/public/PublicPageShell'
import { Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us · Playback',
  description: 'Get in touch with the Playback team — general inquiries, artist support, and business partnerships.',
}

const CONTACTS = [
  { label: 'General Inquiries', email: 'playbackcharts@gmail.com' },
  { label: 'Artist Support', email: 'playbackcharts@gmail.com' },
  { label: 'Business & Partnerships', email: 'playbackcharts@gmail.com' },
]

export default function ContactPage() {
  return (
    <PublicPageShell>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>
        Contact Us
      </p>
      <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '10px' }}>
        Get in Touch
      </h1>
      <p style={{ color: '#b3b3b3', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px' }}>
        Have a question, feedback, or need support? We would love to hear from you. Whether you are an artist looking to share your music, a listener needing help, or a business interested in partnering with us, our team is here to assist you.
      </p>

      <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Contact Information</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CONTACTS.map(c => (
          <a
            key={c.label}
            href={`mailto:${c.email}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px',
              padding: '16px 18px', textDecoration: 'none',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Mail size={16} color="#3b82f6" />
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, margin: 0 }}>{c.label}</p>
              <p style={{ color: '#60a5fa', fontSize: '13px', margin: 0 }}>{c.email}</p>
            </div>
          </a>
        ))}
      </div>
    </PublicPageShell>
  )
}

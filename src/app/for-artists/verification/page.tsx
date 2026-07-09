import PublicPageShell from '@/components/public/PublicPageShell'
import Link from 'next/link'
import { BadgeCheck, ShieldCheck, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artist Verification · Playback',
  description: 'Verify your artist profile on Playback — get the blue checkmark badge and help fans find the real you.',
}

const BENEFITS = [
  { icon: BadgeCheck, title: 'Official Verified Badge', body: 'Display a verification badge on your artist profile to show listeners that your account is authentic.' },
  { icon: ShieldCheck, title: 'Increase Trust', body: 'Help fans easily recognize your official profile and avoid impersonation.' },
  { icon: TrendingUp, title: 'Better Visibility', body: 'Verified artists may receive increased visibility in search results, artist recommendations, and featured sections.' },
  { icon: Users, title: 'Build Your Audience', body: 'Make it easier for listeners to follow your profile and explore your music.' },
]

const ELIGIBILITY = [
  'You are the official owner or representative of the artist profile',
  'You have uploaded original music to Playback',
  'Your profile is complete with a profile picture, biography, and artist information',
  'You can provide proof that you represent the artist',
]

const NEEDED = [
  'Your stage name',
  'Your real name (kept private)',
  'Links to your official social media accounts',
  'Links to your official website or music profiles (if available)',
  'A valid government-issued ID or other proof of identity (only if requested)',
]

const STEPS = [
  'Sign in to your Artist Dashboard.',
  'Select Request Verification.',
  'Complete the verification form.',
  'Submit your application for review.',
]

export default function ArtistVerificationInfoPage() {
  return (
    <PublicPageShell>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>
        For Artists
      </p>
      <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Verify Your Artist Profile <BadgeCheck size={26} color="#3b82f6" />
      </h1>
      <p style={{ color: '#b3b3b3', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px' }}>
        Artist Verification helps listeners identify official artist profiles on Playback. A verified badge shows that an account represents the genuine artist, making it easier for fans to discover authentic music and follow the right profile.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '18px' }}>Benefits of Verification</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '40px' }}>
        {BENEFITS.map(b => (
          <div key={b.title} style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '18px' }}>
            <b.icon size={20} color="#3b82f6" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{b.title}</p>
            <p style={{ color: '#717171', fontSize: '12px', lineHeight: 1.5 }}>{b.body}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>Who Can Apply?</h2>
      <p style={{ color: '#717171', fontSize: '13px', marginBottom: '12px' }}>You can apply for verification if:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {ELIGIBILITY.map(e => (
          <div key={e} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.5 }}>{e}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>What You'll Need</h2>
      <p style={{ color: '#717171', fontSize: '13px', marginBottom: '12px' }}>To verify your account, you may be asked to provide:</p>
      <ol style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '32px' }}>
        {NEEDED.map(n => <li key={n}>{n}</li>)}
      </ol>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>How to Apply</h2>
      <ol style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '16px' }}>
        {STEPS.map(s => <li key={s}>{s}</li>)}
      </ol>
      <p style={{ color: '#717171', fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>
        Our team will review your request and notify you of the outcome. Most applications are reviewed within 5–10 business days.
      </p>
      <p style={{ color: '#717171', fontSize: '13px', lineHeight: 1.7, marginBottom: '32px' }}>
        Verification may be removed if an account violates our Terms of Service or Community Guidelines.
      </p>

      <Link
        href="/studio/verification"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '13px 28px', borderRadius: '10px', textDecoration: 'none' }}
      >
        <BadgeCheck size={16} /> Request Verification
      </Link>
    </PublicPageShell>
  )
}

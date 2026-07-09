'use client'

import { useState } from 'react'
import { BadgeCheck, CheckCircle2, XCircle, Clock, Link2, Globe } from 'lucide-react'
import { notify } from '@/components/ui/notify'
import Link from 'next/link'

interface VerificationRequest {
  id: string; status: 'pending' | 'approved' | 'rejected'
  legal_name: string; press_link: string | null; message: string | null; admin_note: string | null; created_at: string
}

interface SocialLinks {
  instagram?: string; twitter?: string; facebook?: string; youtube?: string; tiktok?: string; website?: string
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  website: Globe,
}

export default function StudioVerificationClient({
  verificationRequest: initial, verified, socialLinks = {}, defaultLegalName = '',
}: {
  verificationRequest: VerificationRequest | null
  verified: boolean
  socialLinks?: SocialLinks
  defaultLegalName?: string
}) {
  const [request, setRequest] = useState(initial)
  const [legalName, setLegalName] = useState(initial?.legal_name ?? defaultLegalName)
  const [pressLink, setPressLink] = useState(initial?.press_link ?? '')
  const [message, setMessage] = useState(initial?.message ?? '')
  const [submitting, setSubmitting] = useState(false)

  const hasSocialLinks = Object.values(socialLinks).some(Boolean)

  const submit = async () => {
    if (!legalName.trim()) { notify.error('Legal name is required'); return }
    setSubmitting(true)
    const res = await fetch('/api/verification-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legalName, pressLink, message }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setRequest(data.request)
      notify.success('Request submitted', 'Our team will review it shortly.')
    } else {
      notify.error(data.error ?? 'Could not submit request')
    }
  }

  const StatusIcon = request?.status === 'approved' ? CheckCircle2 : request?.status === 'rejected' ? XCircle : Clock
  const statusColor = request?.status === 'approved' ? '#4ade80' : request?.status === 'rejected' ? '#ef4444' : '#fbbf24'

  return (
    <div style={{ padding: '28px 24px 100px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Verified Badge {verified && <BadgeCheck size={20} style={{ color: '#3b82f6' }} />}
        </h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>Apply for the blue checkmark next to your artist name</p>
      </div>

      {/* How it works */}
      <div style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
        <p style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
          The verified badge lets listeners know your profile is authentic. Submit a request and tell us a bit about yourself — our team reviews all requests.
        </p>
      </div>

      {verified ? (
        <div style={{ background: '#161616', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BadgeCheck size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>You're verified!</p>
            <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>The blue badge now shows on your profile everywhere on Playback.</p>
          </div>
        </div>
      ) : request ? (
        <div style={{ background: '#161616', border: `1px solid ${statusColor}30`, borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <StatusIcon size={20} style={{ color: statusColor, flexShrink: 0 }} />
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>
                {request.status === 'approved' ? 'Request Approved!' : request.status === 'rejected' ? 'Request Rejected' : 'Under Review'}
              </p>
              <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {request.message && (
            <div style={{ background: '#0d0d0d', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Your message</p>
              <p style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>"{request.message}"</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: '#0d0d0d', borderRadius: '10px', padding: '12px', flex: '1 1 200px' }}>
              <p style={{ color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Legal name</p>
              <p style={{ color: '#b3b3b3', fontSize: '13px', margin: 0 }}>{request.legal_name}</p>
            </div>
            {request.press_link && (
              <div style={{ background: '#0d0d0d', borderRadius: '10px', padding: '12px', flex: '1 1 200px' }}>
                <p style={{ color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Press link</p>
                <a href={request.press_link} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '13px', wordBreak: 'break-all' }}>{request.press_link}</a>
              </div>
            )}
          </div>
          {request.admin_note && (
            <div style={{ background: '#0d0d0d', borderRadius: '10px', padding: '12px' }}>
              <p style={{ color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Admin note</p>
              <p style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{request.admin_note}</p>
            </div>
          )}
          {request.status === 'rejected' && (
            <button onClick={() => setRequest(null)} style={{ marginTop: '14px', background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#60a5fa', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
              Submit new request
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '20px' }}>
          {!hasSocialLinks && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
              <p style={{ color: '#fbbf24', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                You haven't added any social media links to your profile yet. Adding at least one (Instagram, TikTok, etc.) in{' '}
                <Link href="/studio/profile" style={{ color: '#fbbf24', textDecoration: 'underline' }}>My Profile</Link> helps us confirm you're a real artist.
              </p>
            </div>
          )}
          {hasSocialLinks && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#b3b3b3', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Your linked socials</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {Object.entries(socialLinks).filter(([, v]) => v).map(([key, val]) => {
                  const Icon = SOCIAL_ICONS[key] ?? Link2
                  return (
                    <a key={key} href={val as string} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#60a5fa', fontSize: '12px', textDecoration: 'none', background: '#0d0d0d', padding: '6px 10px', borderRadius: '8px' }}>
                      <Icon size={13} /> {key}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          <label style={{ display: 'block', color: '#b3b3b3', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            Legal name
          </label>
          <input
            value={legalName}
            onChange={e => setLegalName(e.target.value)}
            placeholder="Your full legal name"
            style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '12px 14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}
          />

          <label style={{ display: 'block', color: '#b3b3b3', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            Press or media mention <span style={{ color: '#555', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={pressLink}
            onChange={e => setPressLink(e.target.value)}
            placeholder="Link to an article, interview, or feature about you"
            style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '12px 14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}
          />

          <label style={{ display: 'block', color: '#b3b3b3', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            Your pitch <span style={{ color: '#555', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself and why you'd like to be verified…"
            style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '12px 14px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}
          />
          <button
            onClick={submit}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', borderRadius: '10px', color: '#fff', padding: '12px 20px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
            <BadgeCheck size={15} />
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      )}
    </div>
  )
}

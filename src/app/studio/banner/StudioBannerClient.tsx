'use client'

import { useState } from 'react'
import { Megaphone, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { notify } from '@/components/ui/notify'

interface BannerRequest {
  id: string; status: 'pending' | 'approved' | 'rejected'; message: string | null; admin_note: string | null; created_at: string
}

export default function StudioBannerClient({ bannerRequest: initial }: { bannerRequest: BannerRequest | null }) {
  const [request, setRequest] = useState(initial)
  const [message, setMessage] = useState(initial?.message ?? '')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    const res = await fetch('/api/banner-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
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
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0 }}>Banner Request</h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>Request to be featured in the home page promotional banner</p>
      </div>

      {/* How it works */}
      <div style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
        <p style={{ color: '#b3b3b3', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
          The promotional banner on the Muzika home page is seen by all users. Submit a request and tell us about your latest release — our team reviews all requests and will feature the most compelling ones.
        </p>
      </div>

      {request ? (
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
          <label style={{ display: 'block', color: '#b3b3b3', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            Your pitch (optional)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Tell us about your release and why it should be featured on the home page…"
            style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#fff', fontSize: '14px', padding: '12px 14px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}
          />
          <button
            onClick={submit}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', borderRadius: '10px', color: '#fff', padding: '12px 20px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
            <Megaphone size={15} />
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      )}
    </div>
  )
}

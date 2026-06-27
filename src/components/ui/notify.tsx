'use client'

/**
 * Muzika notification system
 * Wraps sonner with consistent, premium-feeling toasts.
 */

import { toast } from 'sonner'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

const base: React.CSSProperties = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '13.5px',
  fontWeight: 500,
  borderRadius: '12px',
  padding: '13px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  border: '1px solid',
  letterSpacing: '-0.1px',
  lineHeight: '1.4',
  maxWidth: '320px',
}

const VARIANTS = {
  success: {
    style: { ...base, background: '#0a1a0f', borderColor: '#166534', color: '#86efac' } as React.CSSProperties,
    icon: <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />,
  },
  error: {
    style: { ...base, background: '#1a0a0a', borderColor: '#7f1d1d', color: '#fca5a5' } as React.CSSProperties,
    icon: <XCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />,
  },
  warning: {
    style: { ...base, background: '#1a130a', borderColor: '#78350f', color: '#fcd34d' } as React.CSSProperties,
    icon: <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />,
  },
  info: {
    style: { ...base, background: '#0a0f1a', borderColor: '#1e3a8a', color: '#93c5fd' } as React.CSSProperties,
    icon: <Info size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />,
  },
}

function makeOpts(type: keyof typeof VARIANTS, desc?: string) {
  return {
    style: VARIANTS[type].style,
    icon: VARIANTS[type].icon,
    duration: type === 'error' ? 4500 : 2800,
    description: desc ?? undefined,
  }
}

export const notify = {
  success: (msg: string, desc?: string) => toast(msg, makeOpts('success', desc)),
  error:   (msg: string, desc?: string) => toast(msg, makeOpts('error', desc)),
  warning: (msg: string, desc?: string) => toast(msg, makeOpts('warning', desc)),
  info:    (msg: string, desc?: string) => toast(msg, makeOpts('info', desc)),
}

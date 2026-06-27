'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm, onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          position: 'relative', zIndex: 1,
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#717171', padding: '4px', display: 'flex',
          }}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
          border: `1px solid ${isDanger ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          {isDanger
            ? <Trash2 size={20} style={{ color: '#ef4444' }} />
            : <AlertTriangle size={20} style={{ color: '#fbbf24' }} />
          }
        </div>

        <h3
          id="confirm-title"
          style={{
            fontSize: '16px', fontWeight: 700, color: '#ffffff',
            marginBottom: '8px', letterSpacing: '-0.2px',
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: '13.5px', color: '#b3b3b3', lineHeight: 1.6, marginBottom: '24px' }}>
          {description}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px',
              background: '#282828', border: '1px solid #3a3a3a',
              borderRadius: '10px', color: '#ffffff',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#282828')}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px',
              background: isDanger ? '#ef4444' : '#f59e0b',
              border: 'none', borderRadius: '10px',
              color: '#ffffff', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'opacity .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

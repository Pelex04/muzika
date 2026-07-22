'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

const DISMISS_KEY = 'pwa-install-dismissed'

// beforeinstallprompt is a real Chrome/Android-only event, not yet part of
// the standard DOM lib types.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari's own flag for "launched from home screen"
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  // A fresh login clears the dismiss flag even mid-session, via a
  // ?fresh_login=1 marker (password login sets this directly; the OAuth
  // callback route appends it since that's a server redirect with no
  // access to sessionStorage).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('fresh_login') === '1') {
      sessionStorage.removeItem(DISMISS_KEY)
      params.delete('fresh_login')
      const clean = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (clean ? `?${clean}` : ''))
    }
  }, [])

  useEffect(() => {
    if (isStandalone()) return // already installed/running as the app

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    const onInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 88, zIndex: 200,
        maxWidth: '420px', margin: '0 auto',
        background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '14px',
        padding: '14px 14px 14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <img src="/icons/icon-192.png" alt="" width={40} height={40} style={{ borderRadius: '10px', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Install Playback Music</p>
        <p style={{ fontSize: '12px', color: '#717171', margin: '2px 0 0' }}>Add to your home screen for the best experience</p>
      </div>
      <button
        onClick={handleInstall}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
          background: '#2563EB', color: '#ffffff', border: 'none', borderRadius: '8px',
          padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        <Download size={14} />
        Install
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{ background: 'none', border: 'none', color: '#717171', cursor: 'pointer', flexShrink: 0, padding: 4 }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

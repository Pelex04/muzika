'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability is best-effort -- silently ignore registration
        // failures rather than surfacing anything to the user.
      })
    }
  }, [])

  return null
}

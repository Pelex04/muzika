'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'

export default function NotificationBell({ size = 36 }: { size?: number }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        if (!cancelled) setUnreadCount(data.unreadCount ?? 0)
      } catch {}
    }
    load()
    const interval = setInterval(load, 60_000) // light polling, no infra needed
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return (
    <Link
      href="/notifications"
      style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: '#181818', display: 'grid', placeItems: 'center',
        textDecoration: 'none', flexShrink: 0, position: 'relative',
      }}
    >
      <Bell size={17} color="rgba(255,255,255,0.8)" />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: '4px', right: '4px',
          width: '9px', height: '9px', borderRadius: '50%',
          background: '#3b82f6', border: '1.5px solid #121212',
        }} />
      )}
    </Link>
  )
}

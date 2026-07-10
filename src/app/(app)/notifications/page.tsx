'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BadgeCheck } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const TYPE_ICON: Record<string, any> = {
  featured_credit: BadgeCheck,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setLoading(false)
      // Mark everything read now that the user has actually viewed the list
      if ((data.notifications ?? []).some((n: Notification) => !n.read)) {
        fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      }
    })()
  }, [])

  return (
    <div>
      <MobileTopBar eyebrow="Activity" title="Notifications" />
      <div className="max-w-[640px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px] mb-1">Activity</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
        </div>

        {loading ? (
          <div className="text-center py-16"><p className="text-[#717171] text-sm">Loading…</p></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="text-[#2a2a2a] mx-auto mb-4" />
            <p className="text-[#717171] text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map(n => {
              const Icon = TYPE_ICON[n.type] ?? Bell
              const content = (
                <div className={`flex items-start gap-3 p-3.5 rounded-xl transition-colors ${n.read ? '' : 'bg-[#161b2e]'} hover:bg-[#181818]`}>
                  <div className="w-9 h-9 rounded-full bg-[#0d1b3e] grid place-items-center flex-shrink-0">
                    <Icon size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{n.title}</p>
                    {n.body && <p className="text-xs text-[#b3b3b3] mt-0.5 leading-relaxed">{n.body}</p>}
                    <p className="text-[11px] text-[#555] mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </div>
              )
              return n.link
                ? <Link key={n.id} href={n.link}>{content}</Link>
                : <div key={n.id}>{content}</div>
            })}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { usePlayerStore } from '@/store/player'

// Mobile shortcut from the app to the admin dashboard, the admin
// counterpart to StudioSwitcher. Only rendered for admins. When the user
// is also an artist the Studio button already occupies the bottom-right
// corner, so `stacked` lifts this one above it instead of overlapping.
export default function AdminSwitcher({ stacked = false }: { stacked?: boolean }) {
  const pathname = usePathname()
  const currentTrack = usePlayerStore(s => s.currentTrack)
  const onNowPlaying = pathname === '/now-playing'

  if (onNowPlaying) return null

  // Same base offsets as StudioSwitcher (clear of the tab bar, and of the
  // mini player when a track is loaded), plus one button's height + gap.
  const base = currentTrack ? 158 : 72
  const bottomOffset = stacked ? base + 56 : base

  return (
    <>
      <style>{`
        .admin-fab { display: none; }
        @media (max-width: 768px) {
          .admin-fab {
            display: flex; align-items: center; justify-content: center;
            position: fixed; right: 16px; z-index: 200;
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            box-shadow: 0 4px 16px rgba(99,102,241,0.45);
            text-decoration: none; color: #fff;
            transition: transform .15s, box-shadow .15s, bottom .25s ease;
          }
          .admin-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(99,102,241,0.55); }
        }
      `}</style>
      <Link href="/admin" className="admin-fab" style={{ bottom: `${bottomOffset}px` }} title="Switch to Admin" aria-label="Switch to Admin dashboard">
        <ShieldCheck size={20} />
      </Link>
    </>
  )
}

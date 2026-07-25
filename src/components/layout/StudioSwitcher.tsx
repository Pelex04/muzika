'use client'

import Link from 'next/link'
import { Mic2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { usePlayerStore } from '@/store/player'

export default function StudioSwitcher() {
  const pathname = usePathname()
  const { currentTrack } = usePlayerStore()
  const onNowPlaying = pathname === '/now-playing'

  // The mini player (when visible) sits directly above BottomTabs and is
  // ~76px tall -- this FAB's fixed bottom offset was set assuming the mini
  // player would never be showing at the same time, so it needs to lift
  // itself above it rather than overlapping the play/pause button.
  const bottomOffset = currentTrack && !onNowPlaying ? 158 : 72

  if (onNowPlaying) return null

  return (
    <>
      <style>{`
        .studio-fab { display: none; }
        @media (max-width: 768px) {
          .studio-fab {
            display: flex; align-items: center; justify-content: center;
            position: fixed; right: 16px; z-index: 200;
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, #0abab5, #0f9490);
            box-shadow: 0 4px 16px rgba(10,186,181,0.45);
            text-decoration: none; color: #fff;
            transition: transform .15s, box-shadow .15s, bottom .25s ease;
          }
          .studio-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(10,186,181,0.55); }
        }
      `}</style>
      <Link href="/studio" className="studio-fab" style={{ bottom: `${bottomOffset}px` }} title="Switch to Studio">
        <Mic2 size={20} />
      </Link>
    </>
  )
}

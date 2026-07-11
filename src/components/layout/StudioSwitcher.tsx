'use client'

import Link from 'next/link'
import { Mic2 } from 'lucide-react'

export default function StudioSwitcher() {
  return (
    <>
      <style>{`
        .studio-fab { display: none; }
        @media (max-width: 768px) {
          .studio-fab {
            display: flex; align-items: center; justify-content: center;
            position: fixed; bottom: 72px; right: 16px; z-index: 200;
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, #0abab5, #0f9490);
            box-shadow: 0 4px 16px rgba(10,186,181,0.45);
            text-decoration: none; color: #fff;
            transition: transform .15s, box-shadow .15s;
          }
          .studio-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(10,186,181,0.55); }
        }
      `}</style>
      <Link href="/studio" className="studio-fab" title="Switch to Studio">
        <Mic2 size={20} />
      </Link>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AppLaunchSplash({ hasSession }: { hasSession: boolean }) {
  const router = useRouter()
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const destination = hasSession ? '/discover' : '/signin'
    const exitTimer = setTimeout(() => setExiting(true), 1100)
    const navTimer = setTimeout(() => router.replace(destination), 1400)
    return () => { clearTimeout(exitTimer); clearTimeout(navTimer) }
  }, [hasSession, router])

  return (
    <div className={`launch-root ${exiting ? 'exiting' : ''}`}>
      <style>{`
        .launch-root {
          position: fixed; inset: 0; background: #000000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 300ms ease;
        }
        .launch-root.exiting { opacity: 0; }

        .launch-mark {
          width: 104px; height: 104px; border-radius: 28px;
          opacity: 0;
          animation: fade-in 400ms ease forwards;
        }

        @keyframes fade-in {
          to { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .launch-mark { animation: none; opacity: 1; }
          .launch-root.exiting { transition: none; }
        }
      `}</style>

      <Image src="/logo.png" alt="" width={104} height={104} className="launch-mark" priority />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AppLaunchSplash({ hasSession }: { hasSession: boolean }) {
  const router = useRouter()
  const [exiting, setExiting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  useEffect(() => {
    const destination = hasSession ? '/discover' : '/signin'
    // Reduced motion: skip the choreographed sequence but still hold on the
    // brand for a beat rather than redirecting instantly.
    const holdTime = reducedMotion ? 700 : 2200
    const fadeTime = reducedMotion ? 150 : 400

    const exitTimer = setTimeout(() => setExiting(true), holdTime)
    const navTimer = setTimeout(() => router.replace(destination), holdTime + fadeTime)
    return () => { clearTimeout(exitTimer); clearTimeout(navTimer) }
  }, [hasSession, reducedMotion, router])

  return (
    <div className={`launch-root ${reducedMotion ? 'reduced' : ''} ${exiting ? 'exiting' : ''}`}>
      <style>{`
        .launch-root {
          position: fixed; inset: 0; background: #000000;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; transition: opacity 400ms ease;
        }
        .launch-root.exiting { opacity: 0; }
        .launch-root.reduced.exiting { transition-duration: 150ms; }

        .launch-glow {
          position: absolute; width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(10,186,181,0.35) 0%, rgba(10,186,181,0) 70%);
          animation: glow-pulse 2.4s ease-in-out infinite;
        }
        .reduced .launch-glow { animation: none; }

        .launch-content {
          position: relative; display: flex; flex-direction: column; align-items: center;
        }

        .launch-mark-clip {
          clip-path: circle(0% at 50% 50%);
          animation: mark-reveal 900ms cubic-bezier(0.22, 1, 0.36, 1) 150ms forwards;
        }
        .reduced .launch-mark-clip { clip-path: none; animation: none; }

        .launch-mark {
          width: 96px; height: 96px; border-radius: 26px;
          filter: drop-shadow(0 0 24px rgba(10,186,181,0.45));
          animation: mark-scale 900ms cubic-bezier(0.22, 1, 0.36, 1) 150ms both,
                     mark-glow 2.4s ease-in-out 1.2s infinite;
        }
        .reduced .launch-mark {
          animation: none; opacity: 1; transform: none;
          filter: drop-shadow(0 0 16px rgba(10,186,181,0.35));
        }

        .launch-word {
          margin-top: 22px; font-size: 22px; font-weight: 800; letter-spacing: -0.4px;
          color: #ffffff; opacity: 0; transform: translateY(8px);
          animation: fade-up 500ms ease 650ms forwards;
        }
        .reduced .launch-word { opacity: 1; transform: none; animation: none; }

        .launch-tagline {
          margin-top: 8px; font-size: 13px; color: #717171; letter-spacing: 0.2px;
          opacity: 0; transform: translateY(6px);
          animation: fade-up 500ms ease 900ms forwards;
        }
        .reduced .launch-tagline { opacity: 1; transform: none; animation: none; }

        .launch-dots {
          margin-top: 32px; display: flex; gap: 6px;
          opacity: 0; animation: fade-up 400ms ease 1300ms forwards;
        }
        .reduced .launch-dots { opacity: 1; animation: none; }
        .launch-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #0ABAB5;
          animation: dot-pulse 1.2s ease-in-out infinite;
        }
        .reduced .launch-dot { animation: none; opacity: 0.5; }
        .launch-dot:nth-child(2) { animation-delay: 0.15s; }
        .launch-dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes glow-pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes mark-reveal {
          to { clip-path: circle(75% at 50% 50%); }
        }
        @keyframes mark-scale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes mark-glow {
          0%, 100% { filter: drop-shadow(0 0 24px rgba(10,186,181,0.45)); }
          50% { filter: drop-shadow(0 0 36px rgba(10,186,181,0.7)); }
        }
        @keyframes fade-up {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="launch-glow" />
      <div className="launch-content">
        <div className="launch-mark-clip">
          <Image src="/logo.png" alt="" width={96} height={96} className="launch-mark" priority />
        </div>
        <p className="launch-word">Playback Music</p>
        <p className="launch-tagline">Malawi&apos;s Music Platform</p>
        <div className="launch-dots">
          <span className="launch-dot" />
          <span className="launch-dot" />
          <span className="launch-dot" />
        </div>
      </div>
    </div>
  )
}

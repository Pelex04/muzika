'use client'

import { useEffect, useRef, useState } from 'react'

export default function MarqueeText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflowPx, setOverflowPx] = useState(0)

  useEffect(() => {
    const check = () => {
      if (!containerRef.current || !textRef.current) return
      const diff = textRef.current.scrollWidth - containerRef.current.clientWidth
      setOverflowPx(diff > 0 ? diff : 0)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [text])

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <span
        ref={textRef}
        style={
          overflowPx > 0
            ? {
                display: 'inline-block',
                animation: `marquee-scroll ${3 + overflowPx / 40}s ease-in-out 1.2s infinite`,
                ['--marquee-distance' as string]: `-${overflowPx}px`,
              }
            : { display: 'inline-block' }
        }
      >
        {text}
      </span>
      {overflowPx > 0 && (
        <style>{`
          @keyframes marquee-scroll {
            0%, 15% { transform: translateX(0); }
            50%, 65% { transform: translateX(var(--marquee-distance)); }
            100% { transform: translateX(0); }
          }
        `}</style>
      )}
    </div>
  )
}

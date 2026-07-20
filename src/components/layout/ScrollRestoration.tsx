'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// TEMPORARY DEBUG BUILD -- shows a small on-screen readout of what the
// scroll-restoration logic is doing, so we can see exactly what's
// happening on-device instead of guessing. Remove the debug block (marked
// below) once the underlying issue is diagnosed.

// The app's main content area is a custom scrollable <main> div, not the
// browser's native window scroll -- so neither the browser's built-in
// back/forward scroll restoration nor Next.js's own scroll handling ever
// applies to it (both only target window.scrollTo). This restores/saves
// scroll position for that specific element manually, keyed by pathname,
// so navigating with the browser back button (e.g. from a "See all" page)
// returns you to where you were instead of resetting to the top.
export default function ScrollRestoration() {
  const pathname = usePathname()
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [log, setLog] = useState<string[]>([])

  const addLog = (line: string) => {
    setLog((prev) => {
      const next = [...prev, `${new Date().toISOString().slice(11, 23)} ${line}`]
      return next.slice(-10)
    })
  }

  useEffect(() => {
    const main = document.querySelector('.muzika-main') as HTMLElement | null
    if (!main) {
      addLog(`NO .muzika-main FOUND for ${pathname}`)
      return
    }

    // Restore saved position for this path, if any
    const key = `scrollpos:${pathname}`
    const saved = sessionStorage.getItem(key)
    addLog(`mount ${pathname} saved="${saved}"`)

    let resizeObserver: ResizeObserver | null = null
    let giveUpTimer: ReturnType<typeof setTimeout> | null = null

    if (saved) {
      const target = parseInt(saved, 10) || 0
      let restored = false

      const tryRestore = () => {
        if (restored) return
        const reach = main.scrollHeight - main.clientHeight
        addLog(`try target=${target} scrollH=${main.scrollHeight} clientH=${main.clientHeight} reach=${reach}`)
        if (reach >= target) {
          main.scrollTop = target
          restored = true
          addLog(`RESTORED scrollTop=${main.scrollTop}`)
          resizeObserver?.disconnect()
          if (giveUpTimer) clearTimeout(giveUpTimer)
        }
      }

      resizeObserver = new ResizeObserver(tryRestore)
      resizeObserver.observe(main)
      tryRestore() // in case content is already there

      giveUpTimer = setTimeout(() => {
        if (!restored) addLog(`GAVE UP after 2s, scrollTop stuck at ${main.scrollTop}`)
        restored = true
        resizeObserver?.disconnect()
      }, 2000)
    } else {
      main.scrollTop = 0
    }

    const onScroll = () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        sessionStorage.setItem(key, String(main.scrollTop))
        addLog(`SAVED ${main.scrollTop} for ${pathname}`)
      }, 150)
    }

    main.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      main.removeEventListener('scroll', onScroll)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      resizeObserver?.disconnect()
      if (giveUpTimer) clearTimeout(giveUpTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // --- TEMPORARY DEBUG OVERLAY: remove this whole return block (and the
  // log state/addLog above) once we're done diagnosing ---
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 60,
        left: 4,
        right: 4,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontSize: 10,
        fontFamily: 'monospace',
        padding: '6px 8px',
        borderRadius: 6,
        maxHeight: 160,
        overflowY: 'auto',
        pointerEvents: 'none',
        whiteSpace: 'pre-wrap',
      }}
    >
      {log.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  )
}

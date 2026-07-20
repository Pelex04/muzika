'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

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

  useEffect(() => {
    const main = document.querySelector('.muzika-main')
    if (!main) return

    // Restore saved position for this path, if any
    const key = `scrollpos:${pathname}`
    const saved = sessionStorage.getItem(key)

    let resizeObserver: ResizeObserver | null = null
    let giveUpTimer: ReturnType<typeof setTimeout> | null = null

    if (saved) {
      const target = parseInt(saved, 10) || 0
      let restored = false

      const tryRestore = () => {
        if (restored) return
        // Only scroll once the page has actually grown tall enough to
        // reach the saved position -- pages here fetch data server-side
        // (e.g. force-dynamic routes), so on remount the container starts
        // out short/empty and a one-time scroll attempt lands before the
        // real content (and real scroll height) exists.
        if (main.scrollHeight - main.clientHeight >= target) {
          main.scrollTop = target
          restored = true
          resizeObserver?.disconnect()
          if (giveUpTimer) clearTimeout(giveUpTimer)
        }
      }

      resizeObserver = new ResizeObserver(tryRestore)
      resizeObserver.observe(main)
      tryRestore() // in case content is already there

      // Don't watch forever -- if the saved position is no longer
      // reachable (e.g. the list is now shorter), stop trying after 2s.
      giveUpTimer = setTimeout(() => {
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
      }, 150)
    }

    main.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      main.removeEventListener('scroll', onScroll)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      resizeObserver?.disconnect()
      if (giveUpTimer) clearTimeout(giveUpTimer)
    }
  }, [pathname])

  return null
}

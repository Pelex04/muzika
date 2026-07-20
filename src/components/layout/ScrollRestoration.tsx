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
    if (saved) {
      // Wait a tick for content to render before restoring
      requestAnimationFrame(() => {
        main.scrollTop = parseInt(saved, 10) || 0
      })
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
    }
  }, [pathname])

  return null
}

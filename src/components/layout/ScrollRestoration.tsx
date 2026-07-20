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
  const lastScrollTop = useRef(0)

  useEffect(() => {
    const main = document.querySelector('.muzika-main') as HTMLElement | null
    if (!main) return

    // Restore saved position for this path, if any
    const key = `scrollpos:${pathname}`
    const saved = sessionStorage.getItem(key)
    if (saved) {
      const pos = parseInt(saved, 10) || 0
      lastScrollTop.current = pos
      // Wait a tick for content to render before restoring
      requestAnimationFrame(() => {
        main.scrollTop = pos
      })
    } else {
      main.scrollTop = 0
      lastScrollTop.current = 0
    }

    const onScroll = () => {
      // Track the live value synchronously so it's available on cleanup
      // even if the debounce below hasn't fired yet.
      lastScrollTop.current = main.scrollTop
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        sessionStorage.setItem(key, String(lastScrollTop.current))
      }, 150)
    }

    main.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      main.removeEventListener('scroll', onScroll)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      // Flush using the ref, not main.scrollTop -- this cleanup is a
      // passive effect, which fires *after* React has already committed
      // the next route's content into this same persistent scroll
      // container. Reading main.scrollTop here reflects the new page,
      // not the one being left, so it must not be used as the save value.
      sessionStorage.setItem(key, String(lastScrollTop.current))
    }
  }, [pathname])

  return null
}

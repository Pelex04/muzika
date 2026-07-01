'use client'

import { useEffect, useRef } from 'react'
import { prefetchStreamUrl } from '@/lib/stream-cache'

/**
 * Prefetches a track's signed URL when the element enters the viewport.
 * Uses IntersectionObserver with a 200ms delay to avoid hammering
 * the server on fast scrolls.
 */
export function usePrefetchTrack(trackId: string) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    let timer: ReturnType<typeof setTimeout>

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Only prefetch if track stays visible for 200ms (avoids fast-scroll spam)
          timer = setTimeout(() => prefetchStreamUrl(trackId), 200)
        } else {
          clearTimeout(timer)
        }
      },
      { rootMargin: '100px' }  // prefetch 100px before visible
    )

    observer.observe(el)
    return () => { observer.disconnect(); clearTimeout(timer) }
  }, [trackId])

  return ref
}

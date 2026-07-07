'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Watches a list of release dates. Once any of them is due (or already
 * passed), it periodically calls router.refresh() to re-fetch this route's
 * server data -- so if the DB has since flipped published=true (via
 * pg_cron / Vercel Cron), the page updates on its own without the user
 * needing to manually reload. Harmless no-op if nothing is due yet, and
 * stops mattering once the parent re-renders with isScheduled=false.
 */
export function useAutoRefreshOnRelease(releaseDates: (string | null | undefined)[]) {
  const router = useRouter()
  const lastRefresh = useRef(0)
  const key = releaseDates.filter(Boolean).join(',')

  useEffect(() => {
    const dates = key ? key.split(',') : []
    if (dates.length === 0) return

    const check = () => {
      const now = Date.now()
      const dueSoonOrPast = dates.some(d => new Date(d).getTime() - now <= 60_000)
      if (dueSoonOrPast && now - lastRefresh.current > 15_000) {
        lastRefresh.current = now
        router.refresh()
      }
    }

    check()
    const interval = setInterval(check, 5_000)
    return () => clearInterval(interval)
  }, [key, router])
}

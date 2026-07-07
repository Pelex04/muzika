'use client'

import { useAutoRefreshOnRelease } from '@/hooks/useAutoRefreshOnRelease'

export default function AlbumsAutoRefresh({ releaseDates }: { releaseDates: string[] }) {
  useAutoRefreshOnRelease(releaseDates)
  return null
}

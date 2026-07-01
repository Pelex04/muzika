/**
 * In-memory cache for signed stream URLs.
 *
 * Supabase signed URLs are valid for 1 hour (3600s).
 * We cache them for 55 minutes to give a 5-minute safety margin.
 * This means replaying a track, going back in the queue, or
 * re-entering the now-playing screen never hits the server again.
 */

interface CacheEntry {
  url: string
  expiresAt: number   // epoch ms
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 55 * 60 * 1000   // 55 minutes

export function getCachedUrl(trackId: string): string | null {
  const entry = cache.get(trackId)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(trackId)
    return null
  }
  return entry.url
}

export function setCachedUrl(trackId: string, url: string): void {
  cache.set(trackId, { url, expiresAt: Date.now() + TTL_MS })
}

/**
 * Fetch and cache the stream URL for a track.
 * Returns immediately if a cached URL is available.
 * Safe to call multiple times — deduplicates in-flight requests.
 */
const inflight = new Map<string, Promise<string | null>>()

export async function fetchStreamUrl(trackId: string): Promise<string | null> {
  // Return cached URL instantly
  const cached = getCachedUrl(trackId)
  if (cached) return cached

  // Deduplicate concurrent fetches for the same track
  if (inflight.has(trackId)) return inflight.get(trackId)!

  const promise = (async () => {
    try {
      const res = await fetch(`/api/tracks/${trackId}/stream`)
      if (!res.ok) return null
      const data = await res.json()
      if (!data.url) return null
      setCachedUrl(trackId, data.url)
      return data.url as string
    } catch {
      return null
    } finally {
      inflight.delete(trackId)
    }
  })()

  inflight.set(trackId, promise)
  return promise
}

/**
 * Prefetch a track's URL silently in the background.
 * Call this when a track becomes visible on screen.
 * No-ops if already cached or already in flight.
 */
export function prefetchStreamUrl(trackId: string): void {
  if (getCachedUrl(trackId)) return
  if (inflight.has(trackId)) return
  fetchStreamUrl(trackId).catch(() => {})
}

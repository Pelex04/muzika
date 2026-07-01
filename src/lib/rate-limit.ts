/**
 * Edge-compatible in-memory rate limiter.
 *
 * Uses a sliding window algorithm. Each Entry stores the timestamps
 * of requests from that key within the current window.
 *
 * Limitations: resets on Edge cold-start (acceptable for auth rate limiting —
 * an attacker would need to stay on the same Edge instance to benefit).
 * For production at scale, replace with Upstash Redis.
 */

interface Entry {
  timestamps: number[]
}

const store = new Map<string, Entry>()

// Clean stale entries every 5 minutes to prevent memory leaks
let lastClean = Date.now()
function maybeClean(windowMs: number) {
  const now = Date.now()
  if (now - lastClean < 5 * 60 * 1000) return
  lastClean = now
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInMs: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  maybeClean(windowMs)
  const now = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]
    const resetInMs = windowMs - (now - oldest)
    store.set(key, entry)
    return { allowed: false, remaining: 0, resetInMs }
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetInMs: 0,
  }
}

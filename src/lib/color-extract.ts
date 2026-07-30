'use client'

import { useEffect, useState } from 'react'

// Cache extracted colors per image URL so we don't recompute on every
// re-render or re-visit of the same track.
const colorCache = new Map<string, string | null>()

function scoreVibrancy(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const lightness = (max + min) / 2
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1))
  // Peaks at mid-lightness, weighted by saturation -- avoids picking
  // near-black/near-white pixels that a plain average would wash out to.
  return saturation * (1 - Math.abs(lightness - 0.5) * 2)
}

export const __colorDebug: Record<string, any> = {}

function extractDominantColor(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 48
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) { __colorDebug[url] = { error: 'no ctx' }; return resolve(null) }
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        // Bin pixels into coarse color buckets and track both how often
        // each occurs and its average color. A single very saturated
        // pixel (e.g. a small bright badge/logo) would otherwise win over
        // a large dominant-but-only-moderately-saturated area (e.g. a
        // deep navy background covering most of the image) -- weighting
        // by frequency as well as vibrancy favors the color that actually
        // represents the artwork, not a rare accent.
        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>()
        const BUCKET = 24
        let opaquePixels = 0
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
          if (a < 200) continue
          opaquePixels++
          const key = `${Math.round(r / BUCKET)}-${Math.round(g / BUCKET)}-${Math.round(b / BUCKET)}`
          const existing = buckets.get(key)
          if (existing) {
            existing.r += r; existing.g += g; existing.b += b; existing.count++
          } else {
            buckets.set(key, { r, g, b, count: 1 })
          }
        }

        let bestScore = -1
        let bestColor: [number, number, number] = [24, 24, 24]
        for (const bucket of buckets.values()) {
          const r = bucket.r / bucket.count, g = bucket.g / bucket.count, b = bucket.b / bucket.count
          const score = scoreVibrancy(r, g, b) * Math.sqrt(bucket.count)
          if (score > bestScore) { bestScore = score; bestColor = [Math.round(r), Math.round(g), Math.round(b)] }
        }
        __colorDebug[url] = {
          naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
          opaquePixels, bucketCount: buckets.size, bestScore: bestScore.toFixed(3), bestColor,
        }
        resolve(`rgb(${bestColor[0]}, ${bestColor[1]}, ${bestColor[2]})`)
      } catch (e: any) {
        // Canvas tainted (CORS) or any other failure -- just fall back to
        // the default background rather than breaking the player.
        __colorDebug[url] = { error: e?.message || String(e) }
        resolve(null)
      }
    }
    img.onerror = (e) => { __colorDebug[url] = { error: 'image failed to load' }; resolve(null) }
    img.src = url
  })
}

export function useDominantColor(url: string | null | undefined) {
  const [color, setColor] = useState<string | null>(null)

  useEffect(() => {
    if (!url) { setColor(null); return }
    if (colorCache.has(url)) { setColor(colorCache.get(url)!); return }

    let cancelled = false
    extractDominantColor(url).then((result) => {
      // Only cache real successes. Podcast episodes commonly share the
      // exact same cover (the show's own art, reused across episodes
      // without one of their own) -- caching a failure here would
      // permanently break the background color for every other episode
      // sharing that URL for the rest of the session, even though a
      // retry would likely succeed. Unique per-track covers rarely hit
      // this since a one-time failure wouldn't recur across other tracks.
      if (result) colorCache.set(url, result)
      if (!cancelled) setColor(result)
    })
    return () => { cancelled = true }
  }, [url])

  return color
}

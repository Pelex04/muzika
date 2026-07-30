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

function extractDominantColor(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 24
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        let bestScore = -1
        let bestColor: [number, number, number] = [24, 24, 24]
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
          if (a < 200) continue
          const score = scoreVibrancy(r, g, b)
          if (score > bestScore) { bestScore = score; bestColor = [r, g, b] }
        }
        resolve(`rgb(${bestColor[0]}, ${bestColor[1]}, ${bestColor[2]})`)
      } catch {
        // Canvas tainted (CORS) or any other failure -- just fall back to
        // the default background rather than breaking the player.
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
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

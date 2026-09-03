'use client'

import { useCallback, useEffect, useState } from 'react'

export type GenreCategory = 'music' | 'podcast'

// Shown immediately while the real (possibly artist-extended) list loads,
// so the picker never renders empty.
const FALLBACK: Record<GenreCategory, string[]> = {
  music: ['Afropop', 'Gospel', 'Hip-Hop', 'Reggae', 'RnB', 'Traditional', 'Jazz', 'Dancehall', 'Amapiano'],
  podcast: ['Music', 'Comedy', 'News', 'Education', 'Sports', 'Culture', 'Business', 'Religion', 'Other'],
}

export function useGenres(category: GenreCategory) {
  const [options, setOptions] = useState<string[]>(FALLBACK[category])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/genres?category=${category}`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: { genres?: string[] } | null) => {
        if (!cancelled && data?.genres?.length) setOptions(data.genres)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [category])

  // Adds a genre if it's genuinely new (case-insensitive check against the
  // current list, then a server-side check that also catches names added
  // by other users since this list was fetched). Returns the resolved
  // name to select — either the newly created one or the existing match.
  const addGenre = useCallback(async (raw: string): Promise<string | null> => {
    const trimmed = raw.trim()
    if (!trimmed) return null

    const localMatch = options.find(g => g.toLowerCase() === trimmed.toLowerCase())
    if (localMatch) return localMatch

    try {
      const res = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, category }),
      })
      const data = await res.json()
      if (!res.ok || !data?.name) return null
      setOptions(prev => (prev.some(g => g.toLowerCase() === data.name.toLowerCase()) ? prev : [...prev, data.name]))
      return data.name as string
    } catch {
      return null
    }
  }, [category, options])

  return { options, loading, addGenre }
}

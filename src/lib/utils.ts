import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatMWK(amount: number): string {
  return `MK ${amount.toLocaleString()}`
}

export function calcPlatformFee(price: number, feePercent = 0.15) {
  const fee = Math.round(price * feePercent)
  return { fee, artistPayout: price - fee }
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Given an album's tracks (each with a featured_artists array) and its
// main artist's name, returns the other collaborating artist names —
// deduped case-insensitively and never including the main artist.
export function getAlbumOtherArtists(
  tracks: Array<{ featured_artists?: string[] | null }> | null | undefined,
  mainArtistName?: string | null
): string[] {
  if (!tracks?.length) return []
  const mainLower = (mainArtistName ?? '').trim().toLowerCase()
  const seen = new Set<string>()
  const others: string[] = []
  for (const t of tracks) {
    for (const name of t.featured_artists ?? []) {
      const trimmed = name.trim()
      const lower = trimmed.toLowerCase()
      if (!trimmed || lower === mainLower || seen.has(lower)) continue
      seen.add(lower)
      others.push(trimmed)
    }
  }
  return others
}

// "Main Artist" or "Main Artist, Feat A, Feat B" (capped, with "& N more"
// once there are more collaborators than fit comfortably in a UI label).
export function formatAlbumArtistLabel(
  mainArtistName?: string | null,
  others: string[] = [],
  maxShown = 2
): string {
  const main = mainArtistName ?? ''
  if (!others.length) return main
  const shown = others.slice(0, maxShown)
  const remaining = others.length - shown.length
  const suffix = remaining > 0 ? `, & ${remaining} more` : ''
  return `${main}, ${shown.join(', ')}${suffix}`
}

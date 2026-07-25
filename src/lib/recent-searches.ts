export interface RecentSearchEntry {
  id: string
  type: 'query' | 'track' | 'artist' | 'album'
  label: string
  subLabel?: string
  image?: string
  href?: string
  ts: number
}

const KEY = 'recent-searches'
const MAX_ENTRIES = 10

export function getRecentSearches(): RecentSearchEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentSearch(entry: Omit<RecentSearchEntry, 'ts'>) {
  if (typeof window === 'undefined') return
  const existing = getRecentSearches().filter(e => !(e.type === entry.type && e.id === entry.id))
  const next = [{ ...entry, ts: Date.now() }, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function removeRecentSearch(type: RecentSearchEntry['type'], id: string) {
  if (typeof window === 'undefined') return []
  const next = getRecentSearches().filter(e => !(e.type === type && e.id === id))
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

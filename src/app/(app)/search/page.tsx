'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Music, Users, Loader2, Disc3 } from 'lucide-react'
import MobileTopBar from '@/components/layout/MobileTopBar'
import { usePlayerStore } from '@/store/player'
import { toast } from 'sonner'
import Link from 'next/link'

interface SearchResult {
  tracks: any[]
  artists: any[]
  albums: any[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ tracks: [], artists: [], albums: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { play } = usePlayerStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const runSearch = async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      setSearched(true)
    } catch {
      toast.error('Search failed')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tracks: [], artists: [], albums: [] })
      setSearched(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query), 400)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handlePlay = async (track: any) => {
    const res = await fetch(`/api/tracks/${track.id}/stream`)
    const data = await res.json()
    if (!data.url) { toast.error('Could not load track'); return }
    play({ ...track, audio_url: data.url }, results.tracks)
  }

  const artBg = (genre: string) => {
    const m: Record<string, string> = {
      'Afropop':'#1e3a8a','Gospel':'#065f46','Reggae':'#7f1d1d',
      'Hip-Hop':'#4c1d95','RnB':'#78350f','Traditional':'#134e4a',
    }
    return `linear-gradient(135deg,${m[genre]??'#0d1b3e'},#0d1b3e)`
  }

  const hasResults = results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0

  return (
    <>
      <style>{`
        .search-wrap { max-width: 860px; margin: 0 auto; padding: 20px 16px 100px; }
        .search-bar-wrap {
          display: flex; align-items: center; gap: 10px;
          background: #181818; border: 1.5px solid #2a2a2a;
          border-radius: 12px; padding: 12px 16px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,.3);
          transition: border-color .2s, box-shadow .2s;
        }
        .search-bar-wrap:focus-within {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(59,130,246,.10);
        }
        .search-input {
          flex: 1; border: none; background: transparent;
          font-size: 15px; color: #ffffff; outline: none;
          font-family: inherit;
        }
        .search-input::placeholder { color: #717171; }
        .section-title { font-size: 13px; font-weight: 700; color: #717171; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 10px; margin-top: 20px; }
        .result-row { display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-radius: 10px; cursor: pointer; transition: background .12s; }
        .result-row:hover { background: #282828; }
        .result-art { width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0; overflow: hidden; }
        .result-name { font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .result-sub { font-size: 12px; color: #717171; margin-top: 1px; }
        .empty-search { text-align: center; padding: 60px 20px; }
        .empty-search-icon { width: 64px; height: 64px; border-radius: 20px; background: #282828; display: grid; place-items: center; margin: 0 auto 16px; }
        .empty-search-title { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
        .empty-search-sub { font-size: 14px; color: #717171; line-height: 1.6; }
        .no-results { text-align: center; padding: 40px 20px; color: #717171; font-size: 14px; }
        .artist-result-av { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: rgba(255,255,255,0.85); }
      `}</style>

      {/* Mobile top bar */}
      <MobileTopBar eyebrow="Discover" title="Search" />

      <div className="search-wrap">
        {/* Desktop header */}
        <div className="pg-hdr" style={{ marginBottom: '20px' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:'#60a5fa', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:'4px' }}>Discover</p>
          <h1 style={{ fontSize:'28px', fontWeight:800, color:'#ffffff', letterSpacing:'-0.6px' }}>Search</h1>
        </div>

        {/* Search bar */}
        <div className="search-bar-wrap">
          <Search size={18} color="#717171" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search songs, artists…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <Loader2 size={17} color="#717171" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
          {query && !loading && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={17} color="#717171" />
            </button>
          )}
        </div>

        {/* Empty state */}
        {!query && (
          <div className="empty-search">
            <div className="empty-search-icon"><Search size={28} color="#717171" /></div>
            <p style={{ fontSize:'18px', fontWeight:800, color:'#ffffff', marginBottom:'8px' }}>Find your music</p>
            <p style={{ fontSize:'14px', color:'#717171', lineHeight:1.6 }}>Search for songs, artists, genres and more.</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && !hasResults && query && (
          <div className="no-results">
            <p style={{ fontSize:'16px', fontWeight:700, color:'#ffffff', marginBottom:'6px' }}>No results for &ldquo;{query}&rdquo;</p>
            <p>Try a different search term or artist name.</p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <>
            {results.tracks.length > 0 && (
              <>
                <p className="section-title">
                  <Music size={12} style={{ display:'inline', marginRight:'5px' }} />
                  Songs ({results.tracks.length})
                </p>
                {results.tracks.map((track: any) => (
                  <div key={track.id} className="result-row" onClick={() => handlePlay(track)}>
                    <div className="result-art" style={{ background: artBg(track.genre) }}>
                      {track.cover_url && <img src={track.cover_url} alt={track.title} style={{ width:'100%',height:'100%',objectFit:'cover' }} />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="result-name">{track.title}</div>
                      <div className="result-sub">{track.artist?.stage_name ?? 'Unknown'} · {track.genre}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#717171"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                ))}
              </>
            )}

            {results.albums.length > 0 && (
              <>
                <p className="section-title">
                  <Disc3 size={12} style={{ display:'inline', marginRight:'5px' }} />
                  Albums ({results.albums.length})
                </p>
                {results.albums.map((album: any) => (
                  <Link key={album.id} href={`/albums/${album.id}`} style={{ textDecoration:'none' }}>
                    <div className="result-row">
                      <div className="result-art" style={{ background: artBg(album.genre) }}>
                        {album.cover_url && <img src={album.cover_url} alt={album.title} style={{ width:'100%',height:'100%',objectFit:'cover' }} />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="result-name">{album.title}</div>
                        <div className="result-sub">{album.artist?.stage_name ?? 'Unknown'} · Album</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#717171" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </Link>
                ))}
              </>
            )}

            {results.artists.length > 0 && (
              <>
                <p className="section-title">
                  <Users size={12} style={{ display:'inline', marginRight:'5px' }} />
                  Artists ({results.artists.length})
                </p>
                {results.artists.map((artist: any) => {
                  const colors: Record<string,string> = {
                    'Afropop':'linear-gradient(135deg,#1e3a8a,#2563eb)',
                    'Gospel':'linear-gradient(135deg,#065f46,#059669)',
                    'Reggae':'linear-gradient(135deg,#7f1d1d,#dc2626)',
                    'Hip-Hop':'linear-gradient(135deg,#4c1d95,#7c3aed)',
                    'RnB':'linear-gradient(135deg,#78350f,#d97706)',
                  }
                  const bg = colors[artist.genre] ?? 'linear-gradient(135deg,#0d1b3e,#1e3a8a)'
                  return (
                    <Link key={artist.id} href={`/artists/${artist.id}`} style={{ textDecoration:'none' }}>
                      <div className="result-row">
                        <div className="artist-result-av" style={{ background: bg }}>
                          {artist.stage_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="result-name">{artist.stage_name}</div>
                          <div className="result-sub">{artist.genre} · {artist.location}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#717171" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </Link>
                  )
                })}
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (min-width: 768px) { .pg-hdr { display: block; } }
        @media (max-width: 768px) { .pg-hdr { display: none; } }
      `}</style>
    </>
  )
}

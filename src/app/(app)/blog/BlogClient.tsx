'use client'

import { useState } from 'react'
import { Search, Mic, PenSquare } from 'lucide-react'
import Link from 'next/link'
import MobileTopBar from '@/components/layout/MobileTopBar'
import type { BlogPost } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const CATS = ['All', 'News', 'Artist Blog', 'Interviews']

const CAT_MAP: Record<string, string> = {
  'News': 'news', 'Artist Blog': 'artist_blog', 'Interviews': 'interview'
}

const CAT_COLORS: Record<string, string> = {
  news: 'text-red-500',
  artist_blog: 'text-blue-600',
  interview: 'text-emerald-600',
}
const CAT_TEXT: Record<string, string> = {
  news: 'NEWS',
  artist_blog: 'ARTIST BLOG',
  interview: 'INTERVIEW',
}
function CatIcon({ category, size = 11 }: { category: string; size?: number }) {
  if (category === 'news') {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  }
  if (category === 'artist_blog') {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
}

interface Props { posts: BlogPost[] }

export default function BlogClient({ posts }: Props) {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('All')

  const filtered = posts.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCat === 'All' || p.category === CAT_MAP[activeCat]
    return matchSearch && matchCat
  })

  const hero = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div>
      <MobileTopBar
        eyebrow="Stories from the scene"
        title="Blog & News"
        rightSlot={
          <Link href="/blog/new" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'#0D1B3E', color:'#fff', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
            <PenSquare size={13} /> Write
          </Link>
        }
      />

      <div className="max-w-[1080px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[.7px] mb-1">Stories from the scene</p>
            <h1 className="text-3xl font-black text-[#0D1B3E] tracking-tight">Blog &amp; News</h1>
          </div>
          <Link href="/blog/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold hover:bg-[#152f6e] transition-colors">
            <PenSquare className="w-4 h-4" /> Write
          </Link>
        </div>

        <div className="flex items-center gap-3 bg-white border-[1.5px] border-[#E2E5F0] rounded-xl px-4 py-3 mb-5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-[#8B95A8] flex-shrink-0" />
          <input className="flex-1 bg-transparent text-sm text-[#0D1B3E] outline-none placeholder:text-[#8B95A8]" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
          <Mic className="w-4 h-4 text-[#8B95A8] flex-shrink-0" />
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {CATS.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={cn(
                'px-4 py-1.5 rounded-full border-[1.5px] text-[13px] font-semibold whitespace-nowrap transition-all flex-shrink-0',
                activeCat === c
                  ? 'bg-[#0D1B3E] border-[#0D1B3E] text-white'
                  : 'bg-white border-[#E2E5F0] text-[#5C677D] hover:border-blue-500'
              )}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#8B95A8]">
            <p className="text-lg font-semibold">No posts yet</p>
            <p className="text-sm mt-1">Be the first to write something!</p>
          </div>
        ) : (
          <>
            {/* Hero post */}
            {hero && (
              <div className="rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(13,27,62,.06),0_4px_16px_rgba(13,27,62,.08)] mb-3.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(13,27,62,.04),0_12px_40px_rgba(13,27,62,.14)] transition-all">
                <div className="h-[210px] overflow-hidden">
                  {hero.cover_url
                    ? <img src={hero.cover_url} alt={hero.title} className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full" style={{ background: 'linear-gradient(130deg, #0D1B3E 0%, #152b6e 55%, #1e4a9e 100%)' }}>
                        <svg viewBox="0 0 700 210" className="w-full h-full opacity-50" preserveAspectRatio="xMidYMid slice">
                          <g stroke="#d4af37" strokeWidth="2">
                            {[100, 200, 300, 350, 400, 500, 600].map((x, i) => (
                              <line key={i} x1="350" y1="0" x2={x} y2="210" />
                            ))}
                          </g>
                          <circle cx="350" cy="90" r="65" fill="rgba(59,130,246,0.2)"/>
                        </svg>
                      </div>
                    )
                  }
                </div>
                <div className="bg-white p-4">
                  <p className={cn('flex items-center gap-1.5 text-[10px] font-black tracking-[.9px] uppercase mb-1.5', CAT_COLORS[hero.category])}>
                    <CatIcon category={hero.category} /> {CAT_TEXT[hero.category]}
                  </p>
                  <h3 className="text-base font-bold text-[#0D1B3E] leading-snug">{hero.title}</h3>
                  {hero.excerpt && <p className="text-sm text-[#5C677D] mt-1 line-clamp-2">{hero.excerpt}</p>}
                </div>
              </div>
            )}

            {/* Rest of posts */}
            <div className="flex flex-col gap-2.5">
              {rest.map(post => (
                <div key={post.id} className="bg-white rounded-xl p-3.5 flex gap-3.5 cursor-pointer shadow-[0_1px_3px_rgba(13,27,62,.06),0_4px_16px_rgba(13,27,62,.08)] hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(13,27,62,.04),0_12px_40px_rgba(13,27,62,.14)] transition-all">
                  <div className="w-20 h-20 rounded-[9px] overflow-hidden flex-shrink-0 bg-[#0D1B3E]">
                    {post.cover_url
                      ? <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0d1b3e, #1e4a9e)' }}/>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('flex items-center gap-1.5 text-[10px] font-black tracking-[.9px] uppercase mb-1', CAT_COLORS[post.category])}>
                      <CatIcon category={post.category} size={10} /> {CAT_TEXT[post.category]}
                    </p>
                    <h3 className="text-sm font-bold text-[#0D1B3E] leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-[#8B95A8] mt-1">
                      {post.author?.full_name} · {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import MobileTopBar from '@/components/layout/MobileTopBar'
import type { BlogPost } from '@/types'

const CAT_COLORS: Record<string, string> = {
  news: 'text-red-500',
  artist_blog: 'text-blue-400',
  interview: 'text-emerald-500',
}
const CAT_TEXT: Record<string, string> = {
  news: 'NEWS',
  artist_blog: 'ARTIST BLOG',
  interview: 'INTERVIEW',
}

export default function BlogPostClient({ post }: { post: BlogPost }) {
  return (
    <div>
      <MobileTopBar eyebrow={CAT_TEXT[post.category]} title="Article" />

      <div className="max-w-[680px] mx-auto px-5 md:px-9 py-5 md:py-10">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[#b3b3b3] hover:text-white text-sm font-semibold mb-6">
          <ChevronLeft size={16} /> Blog &amp; News
        </Link>

        <p className={`flex items-center gap-1.5 text-xs font-black tracking-[.9px] uppercase mb-3 ${CAT_COLORS[post.category]}`}>
          {CAT_TEXT[post.category]}
        </p>

        <h1 className="text-2xl md:text-[34px] font-black text-white leading-tight tracking-tight mb-4">
          {post.title}
        </h1>

        <p className="text-sm text-[#717171] mb-6">
          {post.author?.full_name ?? 'Playback'} · {format(new Date(post.created_at), 'MMMM d, yyyy')}
        </p>

        {post.cover_url && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={post.cover_url} alt={post.title} className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="text-[15px] text-[#dadada] leading-[1.8] whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </div>
  )
}

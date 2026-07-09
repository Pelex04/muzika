import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogPostClient from './BlogPostClient'
import type { Metadata } from 'next'

const BASE_URL = 'https://muziqa.vercel.app'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient() as any
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_url, author:profiles(full_name)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) return { title: 'Post not found' }

  const title = `${post.title} · Playback Blog`
  const description = post.excerpt?.slice(0, 155) ?? `Read "${post.title}" on the Playback blog.`
  const image = post.cover_url ?? `${BASE_URL}/og-default.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blog/${slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      type: 'article',
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient() as any

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  // Fire-and-forget view count increment -- not critical if it fails
  supabase
    .from('blog_posts')
    .update({ view_count: (post.view_count ?? 0) + 1 })
    .eq('id', post.id)
    .then(() => {})

  return <BlogPostClient post={post} />
}

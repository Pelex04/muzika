import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogPostClient from './BlogPostClient'

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

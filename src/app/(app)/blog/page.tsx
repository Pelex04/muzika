import { createClient } from '@/lib/supabase/server'
import BlogClient from './BlogClient'

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return <BlogClient posts={posts ?? []} />
}

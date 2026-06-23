import { createClient } from '@/lib/supabase/server'
import BlogClient from './BlogClient'

export default async function BlogPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return <BlogClient posts={posts ?? []} isAdmin={isAdmin} />
}

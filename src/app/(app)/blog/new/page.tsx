import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewPostForm from './NewPostForm'

// Only admins can write blog posts -- everyone else gets redirected
// before the form ever renders. The database also enforces this via
// RLS (only_admins_can_create_posts), so this is a UX guard on top of
// a real security boundary, not a substitute for it.
export default async function NewBlogPostPage() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/blog')

  return <NewPostForm />
}

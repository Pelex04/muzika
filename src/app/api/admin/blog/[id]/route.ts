import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction, getAdminClient } from '@/lib/admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const { reason } = await req.json().catch(() => ({ reason: undefined }))
  const db = getAdminClient()

  const { data: post } = await db
    .from('blog_posts')
    .select('id, title, cover_url')
    .eq('id', id)
    .single()

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Delete cover image from storage if exists
  if (post.cover_url) {
    try {
      const url = new URL(post.cover_url)
      const match = url.pathname.match(/\/public\/blog-covers\/(.+)$/)
      if (match) await db.storage.from('blog-covers').remove([match[1]])
    } catch {}
  }

  const { error } = await db.from('blog_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction(user.id, 'delete_blog_post', id, 'blog_post', reason)
  return NextResponse.json({ deleted: true })
}

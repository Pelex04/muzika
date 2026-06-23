import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only admins can write blog posts. This mirrors the database RLS
  // policy (only_admins_can_create_posts) -- checking here too gives a
  // clean error message and avoids uploading a cover image for a post
  // that's going to be rejected anyway.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can publish blog posts' }, { status: 403 })
  }

  const formData = await req.formData()
  const title = (formData.get('title') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim() ?? ''
  const content = (formData.get('content') as string)?.trim()
  const category = (formData.get('category') as string) ?? 'news'
  const coverFile = formData.get('cover') as File | null

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  // Generate a unique slug
  const baseSlug = slugify(title)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  // Upload cover image if provided
  let coverUrl: string | null = null
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop()
    const path = `blog/${user.id}/${Date.now()}-${baseSlug}.${ext}`
    const buffer = await coverFile.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, buffer, { contentType: coverFile.type })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)
      coverUrl = publicUrl
    }
  }

  // Auto-generate excerpt from content if not provided
  const finalExcerpt = excerpt || content.slice(0, 140).trim() + (content.length > 140 ? '…' : '')

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      author_id: user.id,
      title,
      slug,
      excerpt: finalExcerpt,
      content,
      category,
      cover_url: coverUrl,
      published: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post }, { status: 201 })
}

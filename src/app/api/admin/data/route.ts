import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const db = getAdminClient()
  const { tab = 'tracks' } = Object.fromEntries(new URL(req.url).searchParams)

  if (tab === 'banner_requests') {
    const { data } = await db
      .from('banner_requests')
      .select('*, artist:artists(id, stage_name, avatar_url, genre)')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ items: data ?? [] })
  }

  if (tab === 'promotions') {
    const { data } = await db
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ items: data ?? [] })
  }

  if (tab === 'blog') {
    const { data } = await db
      .from('blog_posts')
      .select('id, title, category, cover_url, published, created_at, author:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ items: data ?? [] })
  }

  if (tab === 'tracks') {
    const { data } = await db
      .from('tracks')
      .select('id, title, genre, cover_url, play_count, download_count, published, created_at, artist:artists(id, stage_name, profile:profiles(email))')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ items: data ?? [] })
  }

  if (tab === 'albums') {
    const { data } = await db
      .from('albums')
      .select('id, title, genre, cover_url, published, created_at, artist:artists(id, stage_name, profile:profiles(email))')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ items: data ?? [] })
  }

  if (tab === 'users') {
    const { data } = await db
      .from('profiles')
      .select('id, email, full_name, role, suspended_at, suspended_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    return NextResponse.json({ items: data ?? [] })
  }

  return NextResponse.json({ error: 'Invalid tab' }, { status: 400 })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: artistId } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Cheap, scriptable action -- cap it so someone can't spam
  // follow/unfollow to inflate or grief follower counts.
  const { allowed } = rateLimit(`follow:${user.id}`, 30, 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })

  // Check existing follow
  const { data: existing } = await supabase
    .from('artist_follows')
    .select('id')
    .eq('user_id', user.id)
    .eq('artist_id', artistId)
    .single()

  if (existing) {
    // Unfollow
    await supabase.from('artist_follows').delete()
      .eq('user_id', user.id).eq('artist_id', artistId)
    return NextResponse.json({ following: false })
  } else {
    // Follow
    await (supabase as any).from('artist_follows').insert({
      user_id: user.id,
      artist_id: artistId,
    })
    return NextResponse.json({ following: true })
  }
}

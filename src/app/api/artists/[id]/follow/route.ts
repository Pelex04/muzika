import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: artistId } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

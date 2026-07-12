import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackId } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = rateLimit(`save:${user.id}`, 60, 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })

  const { data: existing } = await supabase
    .from('saved_tracks')
    .select('id')
    .eq('user_id', user.id)
    .eq('track_id', trackId)
    .single()

  if (existing) {
    await supabase.from('saved_tracks').delete()
      .eq('user_id', user.id).eq('track_id', trackId)
    return NextResponse.json({ saved: false })
  } else {
    await (supabase as any).from('saved_tracks').insert({ user_id: user.id, track_id: trackId })
    return NextResponse.json({ saved: true })
  }
}

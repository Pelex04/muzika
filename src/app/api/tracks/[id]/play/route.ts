import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called by the player after a track has been listened to for at least 30 seconds.
// Separating this from /stream prevents bot-inflated play counts.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.rpc('increment_play_count', { track_id: id })

  // Feeds the "Continue Listening" rail on Discover. Not critical to the
  // play-count itself, so we don't fail the request if this errors.
  await supabase
    .from('listening_history')
    .upsert(
      { user_id: user.id, track_id: id, last_played_at: new Date().toISOString() },
      { onConflict: 'user_id,track_id' }
    )

  return NextResponse.json({ ok: true })
}

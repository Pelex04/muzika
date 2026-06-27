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
  return NextResponse.json({ ok: true })
}

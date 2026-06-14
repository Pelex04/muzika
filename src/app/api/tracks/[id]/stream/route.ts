import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get track
  const { data: track, error } = await supabase
    .from('tracks')
    .select('audio_path, price_mwk, artist_id')
    .eq('id', id)
    .single()

  if (error || !track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Check if artist owns track (can always stream own tracks)
  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('id', track.artist_id)
    .eq('profile_id', user.id)
    .single()

  // Check if user has purchased track
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('track_id', id)
    .eq('payment_status', 'completed')
    .single()

  if (!artist && !purchase && track.price_mwk > 0) {
    return NextResponse.json({ error: 'Purchase required', requiresPurchase: true }, { status: 403 })
  }

  // Generate 1-hour signed URL
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('tracks')
    .createSignedUrl(track.audio_path, 3600)

  if (signErr || !signed) return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 })

  // Increment play count
  await supabase.rpc('increment_play_count', { track_id: id })

  return NextResponse.json({ url: signed.signedUrl })
}

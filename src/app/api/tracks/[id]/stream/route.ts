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
    .select('audio_path')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error || !track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // No purchase check — streaming is free for everyone
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('tracks')
    .createSignedUrl(track.audio_path, 3600)

  if (signErr || !signed) return NextResponse.json({ error: 'Could not load track' }, { status: 500 })

  // Play count is incremented via /api/tracks/[id]/play after 30s of listening
  return NextResponse.json({ url: signed.signedUrl })
}

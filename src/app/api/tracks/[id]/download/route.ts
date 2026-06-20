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

  const { data: track, error } = await supabase
    .from('tracks')
    .select('audio_path, title')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error || !track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })

  // Generate a signed URL with a forced download filename
  const ext = track.audio_path.split('.').pop()
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('tracks')
    .createSignedUrl(track.audio_path, 3600, {
      download: `${track.title.replace(/[^a-zA-Z0-9 ]/g, '')}.${ext}`,
    })

  if (signErr || !signed) return NextResponse.json({ error: 'Could not generate download' }, { status: 500 })

  // Increment download count
  await supabase.rpc('increment_download_count', { track_id: id })

  return NextResponse.json({ url: signed.signedUrl, filename: `${track.title}.${ext}` })
}

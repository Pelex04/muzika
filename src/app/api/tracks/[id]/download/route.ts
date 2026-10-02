import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getB2DownloadUrl } from '@/lib/b2'

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
    .select('audio_path, title, is_downloadable, audio_storage')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error || !track) return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  if (track.is_downloadable === false) {
    return NextResponse.json({ error: 'The artist has made this track streaming-only' }, { status: 403 })
  }

  const ext = track.audio_path.split('.').pop()
  const filename = `${track.title.replace(/[^a-zA-Z0-9 ]/g, '')}.${ext}`

  if (track.audio_storage === 'b2') {
    try {
      const url = await getB2DownloadUrl(track.audio_path, { downloadFilename: filename })
      await supabase.rpc('increment_download_count', { track_id: id })
      return NextResponse.json({ url, filename })
    } catch (err) {
      console.error('B2 download URL error:', err)
      return NextResponse.json({ error: 'Could not generate download' }, { status: 500 })
    }
  }

  // Generate a signed URL with a forced download filename
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('tracks')
    .createSignedUrl(track.audio_path, 3600, { download: filename })

  if (signErr || !signed) return NextResponse.json({ error: 'Could not generate download' }, { status: 500 })

  // Increment download count
  await supabase.rpc('increment_download_count', { track_id: id })

  return NextResponse.json({ url: signed.signedUrl, filename })
}

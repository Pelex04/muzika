import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

// Issues a signed upload URL so the browser can upload the audio file
// DIRECTLY to Supabase Storage, bypassing our serverless function entirely.
// This matters because Vercel hard-caps serverless request bodies at
// 4.5MB regardless of any Next.js config -- any track larger than that
// would previously fail silently (uploads "succeed" with no error, but
// the file never actually lands in storage, so it can't play).
export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { filename, kind } = await req.json() as { filename: string; kind: 'audio' | 'cover' }

  if (!filename || !kind) {
    return NextResponse.json({ error: 'Missing filename or kind' }, { status: 400 })
  }

  const ext = filename.split('.').pop()
  const bucket = kind === 'audio' ? 'tracks' : 'covers'
  const path = `${artist.id}/${Date.now()}-${slugify(filename.replace(/\.[^.]+$/, ''))}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    bucket,
  })
}

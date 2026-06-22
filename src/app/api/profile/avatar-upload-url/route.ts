import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

// Issues a signed upload URL for profile/artist avatars. Unlike the
// track upload signed-url route, this is available to ANY authenticated
// user (listener or artist) since both can have a profile photo.
export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { filename } = await req.json() as { filename: string }
  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })

  const ext = filename.split('.').pop()
  const path = `${user.id}/${Date.now()}-${slugify(filename.replace(/\.[^.]+$/, ''))}.${ext}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path })
}

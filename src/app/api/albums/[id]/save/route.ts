import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: albumId } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = rateLimit(`save-album:${user.id}`, 60, 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })

  const { data: existing } = await supabase
    .from('saved_albums')
    .select('id')
    .eq('user_id', user.id)
    .eq('album_id', albumId)
    .single()

  if (existing) {
    await supabase.from('saved_albums').delete()
      .eq('user_id', user.id).eq('album_id', albumId)
    return NextResponse.json({ saved: false })
  } else {
    await (supabase as any).from('saved_albums').insert({ user_id: user.id, album_id: albumId })
    return NextResponse.json({ saved: true })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: albumId } = await params
  const supabase = await createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ saved: false })

  const { data: existing } = await supabase
    .from('saved_albums')
    .select('id')
    .eq('user_id', user.id)
    .eq('album_id', albumId)
    .single()

  return NextResponse.json({ saved: !!existing })
}

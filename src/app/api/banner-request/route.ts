import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase.from('artists').select('id').eq('profile_id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { data } = await supabase.from('banner_requests').select('*').eq('artist_id', artist.id).single()
  return NextResponse.json({ request: data ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase.from('artists').select('id').eq('profile_id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { message } = await req.json()

  const { data, error } = await supabase
    .from('banner_requests')
    .upsert({
      artist_id: artist.id,
      message: message ?? null,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'artist_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ request: data })
}

export async function DELETE() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artist } = await supabase.from('artists').select('id').eq('profile_id', user.id).single()
  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const { error } = await supabase.from('banner_requests').delete().eq('artist_id', artist.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}

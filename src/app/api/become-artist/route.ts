import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stage_name, genre, location, bio } = await req.json()

  if (!stage_name?.trim() || !genre?.trim()) {
    return NextResponse.json({ error: 'Stage name and genre are required' }, { status: 400 })
  }

  // Check if already an artist
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already an artist' }, { status: 409 })
  }

  // Create artist record
  const { data: artist, error } = await supabase
    .from('artists')
    .insert({
      profile_id: user.id,
      stage_name: stage_name.trim(),
      genre: genre.trim(),
      location: location?.trim() || 'Malawi',
      bio: bio?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update profile role to artist
  await supabase
    .from('profiles')
    .update({ role: 'artist' })
    .eq('id', user.id)

  return NextResponse.json({ artist }, { status: 201 })
}

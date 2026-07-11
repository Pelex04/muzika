import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stage_name, genre, location, bio, creatorType } = await req.json()
  const type: 'artist' | 'podcast_creator' = creatorType === 'podcast_creator' ? 'podcast_creator' : 'artist'

  if (!stage_name?.trim() || !genre?.trim()) {
    return NextResponse.json({ error: type === 'podcast_creator' ? 'Show name and category are required' : 'Stage name and genre are required' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Defensive: a profiles row should already exist (created by the
  // on_auth_user_created trigger at signup), but if it's somehow
  // missing -- older account, trigger hiccup -- the artists insert
  // below would fail its foreign key check with a confusing raw
  // Postgres error. Regular users can't insert their own profiles row
  // (no RLS insert policy for it), so this uses the admin client,
  // which bypasses RLS, to fill the gap before continuing.
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    const { error: profileErr } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
      })
    if (profileErr) return NextResponse.json({ error: 'Could not set up your profile. Please try again or contact support.' }, { status: 500 })
  }

  // Check if already a creator of either type -- profile_id is unique on
  // artists, so this also structurally prevents being both an artist
  // and a podcast creator at once.
  const { data: existing } = await supabase
    .from('artists')
    .select('id, creator_type')
    .eq('profile_id', user.id)
    .single()

  if (existing) {
    const already = existing.creator_type === 'podcast_creator' ? 'a podcast creator' : 'an artist'
    return NextResponse.json({ error: `You're already registered as ${already}. You can't also become ${type === 'podcast_creator' ? 'a podcast creator' : 'an artist'}.` }, { status: 409 })
  }

  // Create creator record
  const { data: artist, error } = await supabase
    .from('artists')
    .insert({
      profile_id: user.id,
      stage_name: stage_name.trim(),
      genre: genre.trim(),
      location: location?.trim() || 'Malawi',
      bio: bio?.trim() || null,
      creator_type: type,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update profile role to match
  await supabase
    .from('profiles')
    .update({ role: type })
    .eq('id', user.id)

  return NextResponse.json({ artist }, { status: 201 })
}

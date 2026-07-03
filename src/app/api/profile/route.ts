import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Updates the listener profile (name, bio, avatar) and, if the user is
// also an artist, the artist record (stage name, genre, location, bio,
// avatar) in the same call.
export async function PATCH(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    full_name?: string
    bio?: string
    avatar_path?: string | null
    // Artist-only fields
    stage_name?: string
    genre?: string
    location?: string
    artist_bio?: string
    artist_avatar_path?: string | null
    social_links?: Record<string, string | null>
  }

  // Update profile (listener-facing identity)
  const profileUpdates: Record<string, any> = {}
  if (body.full_name !== undefined) profileUpdates.full_name = body.full_name.trim()
  if (body.bio !== undefined) profileUpdates.bio = body.bio.trim() || null
  if (body.avatar_path !== undefined) {
    if (body.avatar_path) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(body.avatar_path)
      profileUpdates.avatar_url = publicUrl
    } else {
      profileUpdates.avatar_url = null
    }
  }

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Update artist record if the caller included artist fields
  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (artist) {
    const artistUpdates: Record<string, any> = {}
    if (body.stage_name !== undefined) artistUpdates.stage_name = body.stage_name.trim()
    if (body.genre !== undefined) artistUpdates.genre = body.genre
    if (body.location !== undefined) artistUpdates.location = body.location.trim()
    if (body.artist_bio !== undefined) artistUpdates.bio = body.artist_bio.trim() || null
    if (body.social_links !== undefined) artistUpdates.social_links = body.social_links
    if (body.artist_avatar_path !== undefined) {
      if (body.artist_avatar_path) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(body.artist_avatar_path)
        artistUpdates.avatar_url = publicUrl
        // Also sync to profiles so the top bar avatar stays current
        profileUpdates.avatar_url = publicUrl
      } else {
        artistUpdates.avatar_url = null
        profileUpdates.avatar_url = null
      }
    }

    if (Object.keys(artistUpdates).length > 0) {
      const { error: artistError } = await supabase
        .from('artists')
        .update(artistUpdates)
        .eq('id', artist.id)
      if (artistError) return NextResponse.json({ error: artistError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

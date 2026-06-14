import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check artist profile
  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!artist) return NextResponse.json({ error: 'Artist profile required' }, { status: 403 })

  const formData = await req.formData()
  const audioFile = formData.get('audio') as File
  const coverFile = formData.get('cover') as File | null
  const title = formData.get('title') as string
  const genre = formData.get('genre') as string
  const priceMwk = parseInt(formData.get('price_mwk') as string)

  if (!audioFile || !title || !genre || isNaN(priceMwk)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Upload audio to private bucket
  const audioExt = audioFile.name.split('.').pop()
  const audioPath = `${artist.id}/${Date.now()}-${slugify(title)}.${audioExt}`
  const audioBuffer = await audioFile.arrayBuffer()

  const { error: audioError } = await supabase.storage
    .from('tracks')
    .upload(audioPath, audioBuffer, {
      contentType: audioFile.type,
      upsert: false,
    })

  if (audioError) return NextResponse.json({ error: `Audio upload failed: ${audioError.message}` }, { status: 500 })

  // Upload cover art (optional) to public bucket
  let coverUrl: string | null = null
  if (coverFile) {
    const coverExt = coverFile.name.split('.').pop()
    const coverPath = `${artist.id}/${Date.now()}-${slugify(title)}.${coverExt}`
    const coverBuffer = await coverFile.arrayBuffer()

    const { data: coverData, error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, coverBuffer, { contentType: coverFile.type })

    if (!coverError && coverData) {
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath)
      coverUrl = publicUrl
    }
  }

  // Create track record
  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .insert({
      artist_id: artist.id,
      title,
      genre,
      price_mwk: priceMwk,
      audio_path: audioPath,
      cover_url: coverUrl,
      published: true,
    })
    .select()
    .single()

  if (trackError) return NextResponse.json({ error: trackError.message }, { status: 500 })

  // Update artist track count
  await supabase
    .from('artists')
    .update({ track_count: supabase.rpc('increment', { x: 1 }) as any })
    .eq('id', artist.id)

  return NextResponse.json({ track }, { status: 201 })
}

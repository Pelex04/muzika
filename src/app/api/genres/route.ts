import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Category = 'music' | 'podcast'

function normalizeCategory(value: string | null): Category {
  return value === 'podcast' ? 'podcast' : 'music'
}

export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const category = normalizeCategory(req.nextUrl.searchParams.get('category'))

  const { data, error } = await supabase
    .from('genres')
    .select('name')
    .eq('category', category)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ genres: (data ?? []).map((g: { name: string }) => g.name) })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, category: rawCategory } = await req.json() as { name?: string; category?: string }
  const category = normalizeCategory(rawCategory ?? null)
  const trimmed = (name ?? '').trim()

  if (trimmed.length < 2) return NextResponse.json({ error: 'Genre must be at least 2 characters' }, { status: 400 })
  if (trimmed.length > 30) return NextResponse.json({ error: 'Genre must be under 30 characters' }, { status: 400 })

  // Case-insensitive dedupe: if it already exists (in any casing), just
  // hand back the existing name instead of creating a near-duplicate.
  const { data: existing } = await supabase
    .from('genres')
    .select('name')
    .eq('category', category)
    .ilike('name', trimmed)
    .maybeSingle()

  if (existing) return NextResponse.json({ name: existing.name, created: false })

  const { data: inserted, error } = await supabase
    .from('genres')
    .insert({ name: trimmed, category, created_by: user.id })
    .select('name')
    .single()

  if (error) {
    // Unique-index race: someone else added the same genre a moment ago.
    if (error.code === '23505') {
      const { data: race } = await supabase
        .from('genres')
        .select('name')
        .eq('category', category)
        .ilike('name', trimmed)
        .maybeSingle()
      if (race) return NextResponse.json({ name: race.name, created: false })
    }
    return NextResponse.json({ error: 'Could not add genre' }, { status: 500 })
  }

  return NextResponse.json({ name: inserted.name, created: true })
}

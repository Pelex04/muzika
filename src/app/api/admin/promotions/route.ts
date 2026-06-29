import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient } from '@/lib/admin'

// GET all promotions
export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }
  const db = getAdminClient()
  const { data } = await db.from('promotions').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ promotions: data ?? [] })
}

// POST create promotion
export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const body = await req.json()
  const db = getAdminClient()

  // If publishing this one, unpublish all others first — one active banner at a time
  if (body.published) {
    await db.from('promotions').update({ published: false }).eq('published', true)
  }

  const { data, error } = await db.from('promotions').insert({
    label:    body.label    ?? '',
    title:    body.title,
    subtitle: body.subtitle ?? '',
    cta_text: body.cta_text ?? 'Get Started',
    cta_url:  body.cta_url  ?? '/become-artist',
    gradient: body.gradient ?? 'linear-gradient(130deg,#0f2460 0%,#1a3a8f 50%,#2563eb 100%)',
    published: body.published ?? false,
    starts_at: body.starts_at ?? null,
    ends_at:   body.ends_at   ?? null,
    created_by: user.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promotion: data })
}

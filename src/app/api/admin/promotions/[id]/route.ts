import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient } from '@/lib/admin'

// PATCH — update a promotion
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const body = await req.json()
  const db = getAdminClient()

  // If publishing this one, unpublish all others first
  if (body.published === true) {
    await db.from('promotions').update({ published: false }).neq('id', id)
  }

  const { data, error } = await db
    .from('promotions')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promotion: data })
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const db = getAdminClient()
  const { error } = await db.from('promotions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient, logAdminAction } from '@/lib/admin'

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

  const { status, admin_note } = await req.json()
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const db = getAdminClient()

  const { data: request, error } = await db
    .from('verification_requests')
    .update({
      status,
      admin_note: admin_note ?? null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // This is the step that actually makes the blue badge appear: approving
  // the request flips artists.verified, which every existing artist card /
  // profile / detail view already renders a checkmark badge for.
  if (status === 'approved') {
    const { error: verifyErr } = await db
      .from('artists')
      .update({ verified: true })
      .eq('id', request.artist_id)

    if (verifyErr) return NextResponse.json({ error: verifyErr.message }, { status: 500 })
  }

  await logAdminAction(user.id, `verification_request_${status}`, id, 'verification_request', admin_note)
  return NextResponse.json({ request })
}

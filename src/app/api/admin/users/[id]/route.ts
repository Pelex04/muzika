import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction, getAdminClient } from '@/lib/admin'

// PATCH — suspend or unsuspend a user
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

  // Admins cannot suspend themselves
  if (id === user.id) return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })

  const { action, reason } = await req.json() as { action: 'suspend' | 'unsuspend'; reason?: string }
  const db = getAdminClient()

  const { data: target } = await db.from('profiles').select('role, suspended_at').eq('id', id).single()
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Cannot suspend another admin
  if (target.role === 'admin') return NextResponse.json({ error: 'Cannot suspend an admin account' }, { status: 400 })

  if (action === 'suspend') {
    await db.from('profiles').update({
      suspended_at: new Date().toISOString(),
      suspended_reason: reason ?? null,
    }).eq('id', id)

    // Revoke all active sessions so they are kicked out immediately
    await db.auth.admin.signOut(id, 'others')

    await logAdminAction(user.id, 'suspend_user', id, 'user', reason)
    return NextResponse.json({ suspended: true })
  }

  if (action === 'unsuspend') {
    await db.from('profiles').update({
      suspended_at: null,
      suspended_reason: null,
    }).eq('id', id)

    await logAdminAction(user.id, 'unsuspend_user', id, 'user', reason)
    return NextResponse.json({ suspended: false })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

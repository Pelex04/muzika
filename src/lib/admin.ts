/**
 * Admin guard — used by every admin API route.
 *
 * Security model:
 * - Role is read from DB using the SERVICE-ROLE key, never from the
 *   JWT or any client-supplied value. This means even if a user
 *   somehow had a JWT claiming role=admin, it would be ignored.
 * - The service-role client bypasses RLS, so the read is always
 *   authoritative and cannot be spoofed via RLS manipulation.
 * - Admin promotion is only possible via direct SQL in Supabase
 *   console — there is no API endpoint to grant admin.
 */

import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Verifies the request user is an admin.
 * Returns { admin, userId } on success, throws a Response on failure.
 */
export async function requireAdmin(userId: string): Promise<{ adminId: string }> {
  const db = getAdminClient()

  const { data: profile, error } = await db
    .from('profiles')
    .select('role, suspended_at')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
  }

  if (profile.role !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  return { adminId: userId }
}

/**
 * Logs an admin action to the audit table.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string,
  targetType: string,
  reason?: string
) {
  const db = getAdminClient()
  await db.from('admin_actions').insert({
    admin_id: adminId,
    action,
    target_id: targetId,
    target_type: targetType,
    reason: reason ?? null,
  })
}

export { getAdminClient }

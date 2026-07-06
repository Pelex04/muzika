import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }
  const db = getAdminClient()
  const { data } = await db
    .from('verification_requests')
    .select('*, artist:artists(id, stage_name, avatar_url, genre, verified, social_links)')
    .order('created_at', { ascending: false })
  return NextResponse.json({ requests: data ?? [] })
}

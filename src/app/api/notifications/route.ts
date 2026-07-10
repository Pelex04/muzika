import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 })

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = (data ?? []).filter((n: any) => !n.read).length
  return NextResponse.json({ notifications: data ?? [], unreadCount })
}

// Mark notifications as read. Body: { id?: string } to mark one, or
// omit id to mark all of the user's notifications as read.
export async function PATCH(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))

  let query = supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
  if (id) query = query.eq('id', id)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

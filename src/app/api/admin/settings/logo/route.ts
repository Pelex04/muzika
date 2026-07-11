import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient, logAdminAction } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const { logoPath } = await req.json() as { logoPath?: string }
  if (!logoPath) return NextResponse.json({ error: 'logoPath is required' }, { status: 400 })

  const db = getAdminClient()
  const { data: { publicUrl } } = db.storage.from('covers').getPublicUrl(logoPath)

  // Cache-bust so browsers/CDNs pick up the change immediately even
  // though old and new logos may share a filename pattern.
  const versionedUrl = `${publicUrl}?v=${Date.now()}`

  const { error } = await db
    .from('site_settings')
    .update({ logo_url: versionedUrl, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction(user.id, 'logo_updated', '1', 'site_settings', logoPath)
  return NextResponse.json({ logoUrl: versionedUrl })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, getAdminClient } from '@/lib/admin'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const { filename } = await req.json() as { filename: string }
  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })

  const ext = filename.split('.').pop()
  const path = `branding/${Date.now()}-${slugify(filename.replace(/\.[^.]+$/, ''))}.${ext}`

  const db = getAdminClient()
  const { data, error } = await db.storage.from('covers').createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ signedUrl: data.signedUrl, path })
}

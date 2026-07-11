import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getAdminClient()
  const { data } = await db.from('site_settings').select('logo_url').eq('id', 1).single()
  return NextResponse.json({ logoUrl: data?.logo_url ?? null })
}

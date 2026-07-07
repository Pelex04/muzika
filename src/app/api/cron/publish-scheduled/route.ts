import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin'

// Triggered on a schedule by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer $CRON_SECRET` automatically for cron-triggered
// requests as long as CRON_SECRET is set as an env var on the project --
// we check that instead of a user session, since there's no logged-in
// admin during a cron run.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminClient()
  const { data, error } = await db.rpc('publish_scheduled_content')

  if (error) {
    console.error('publish_scheduled_content failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ published: data ?? 0, ranAt: new Date().toISOString() })
}

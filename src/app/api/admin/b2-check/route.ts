import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { getB2UploadUrl, deleteB2Object } from '@/lib/b2'

// Admin-only diagnostic + one-shot fixer for the B2 bucket's CORS rules.
// Runs on the server (Vercel), which -- unlike a browser -- isn't subject
// to CORS, so it can show exactly what B2 answers to a browser preflight
// and can set the rules via B2's native API.
//
//   GET /api/admin/b2-check           -> report only
//   GET /api/admin/b2-check?fix=1     -> apply CORS rules, then report
//
// Never returns credentials.

const ORIGINS = [
  'https://playbackmusic.live',
  'https://www.playbackmusic.live',
]

const CORS_RULES = [
  {
    corsRuleName: 'muzikaBrowserUploads',
    allowedOrigins: ORIGINS,
    allowedOperations: ['s3_put', 's3_get', 's3_head'],
    allowedHeaders: ['*'],
    exposeHeaders: ['ETag'],
    maxAgeSeconds: 3600,
  },
]

async function b2Authorize() {
  const basic = Buffer.from(`${process.env.B2_KEY_ID}:${process.env.B2_APPLICATION_KEY}`).toString('base64')
  const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${basic}` },
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`b2_authorize_account failed: ${json.code ?? res.status} ${json.message ?? ''}`)
  return {
    accountId: json.accountId as string,
    token: json.authorizationToken as string,
    apiUrl: json.apiInfo?.storageApi?.apiUrl as string,
  }
}

async function b2Call(auth: { token: string; apiUrl: string }, op: string, body: unknown) {
  const res = await fetch(`${auth.apiUrl}/b2api/v3/${op}`, {
    method: 'POST',
    headers: { Authorization: auth.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${op} failed: ${json.code ?? res.status} ${json.message ?? ''}`)
  return json
}

export async function GET(req: NextRequest) {
  const supabase = await createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await requireAdmin(user.id) } catch (r: any) {
    return NextResponse.json(await r.json(), { status: r.status })
  }

  const report: Record<string, unknown> = {}
  const bucketName = process.env.B2_BUCKET

  report.env = {
    B2_ENDPOINT: !!process.env.B2_ENDPOINT,
    B2_REGION: process.env.B2_REGION ?? null,
    B2_BUCKET: bucketName ?? null,
    B2_KEY_ID: !!process.env.B2_KEY_ID,
    B2_APPLICATION_KEY: !!process.env.B2_APPLICATION_KEY,
  }

  // 1) Read (and optionally set) the bucket's CORS rules via B2's native API
  try {
    const auth = await b2Authorize()
    const list = await b2Call(auth, 'b2_list_buckets', { accountId: auth.accountId, bucketName })
    const bucket = list.buckets?.[0]
    if (!bucket) throw new Error(`Bucket "${bucketName}" not visible to this key`)

    if (req.nextUrl.searchParams.get('fix') === '1') {
      const updated = await b2Call(auth, 'b2_update_bucket', {
        accountId: auth.accountId,
        bucketId: bucket.bucketId,
        corsRules: CORS_RULES,
      })
      report.corsApplied = true
      report.corsRulesNow = updated.corsRules
    } else {
      report.corsRulesNow = bucket.corsRules
    }
    report.authorize = 'ok'
  } catch (e: any) {
    report.authorize = `FAILED: ${e.message}`
  }

  // 2) Simulate the browser's CORS preflight for each origin
  try {
    const url = await getB2UploadUrl('_healthcheck/preflight.mp3', 'audio/mpeg', 120)
    const preflights: Record<string, unknown> = {}
    for (const origin of ORIGINS) {
      const res = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'content-type',
        },
        cache: 'no-store',
      })
      preflights[origin] = {
        status: res.status,
        allowOrigin: res.headers.get('access-control-allow-origin'),
        allowMethods: res.headers.get('access-control-allow-methods'),
        allowHeaders: res.headers.get('access-control-allow-headers'),
      }
    }
    report.preflight = preflights
  } catch (e: any) {
    report.preflight = `FAILED: ${e.message}`
  }

  // 3) Real upload from the server (no CORS involved): verifies the
  //    credentials, region, signing and checksum handling end to end.
  try {
    const key = `_healthcheck/${Date.now()}.txt`
    const url = await getB2UploadUrl(key, 'text/plain', 120)
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: 'ok', cache: 'no-store' })
    report.serverUpload = { status: res.status, body: res.ok ? 'ok' : (await res.text()).slice(0, 300) }
    if (res.ok) await deleteB2Object(key).catch(() => {})
  } catch (e: any) {
    report.serverUpload = `FAILED: ${e.message}`
  }

  return NextResponse.json(report, { status: 200 })
}

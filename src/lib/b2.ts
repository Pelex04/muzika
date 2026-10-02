import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Backblaze B2's S3-compatible API, used for audio storage. We moved
// tracks here because Supabase's 1GB free storage quota filled up fast
// (and exceeding it restricts every project in the Supabase org, not
// just the one that's over). B2's free tier is 10GB, no card required.
//
// Required env vars:
//   B2_ENDPOINT            e.g. "s3.us-east-005.backblazeb2.com" (no https://)
//   B2_REGION               e.g. "us-east-005"
//   B2_BUCKET               e.g. "Muziqa"
//   B2_KEY_ID               application key ID, scoped to this bucket only
//   B2_APPLICATION_KEY      the matching application key secret

const REQUIRED_ENV = ['B2_ENDPOINT', 'B2_REGION', 'B2_BUCKET', 'B2_KEY_ID', 'B2_APPLICATION_KEY'] as const

function assertEnv() {
  const missing = REQUIRED_ENV.filter(key => !process.env[key])
  if (missing.length) throw new Error(`Missing B2 env vars: ${missing.join(', ')}`)
}

let client: S3Client | null = null

function getB2Client(): S3Client {
  if (client) return client
  assertEnv()
  client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
    // B2's S3 compatibility layer expects path-style addressing
    // (bucket in the URL path, not as a subdomain).
    forcePathStyle: true,
  })
  return client
}

// Presigned URL the browser can PUT the file to directly, so uploads
// bypass our serverless function entirely (same reasoning as the
// Supabase signed-upload-url flow this replaces for audio).
export async function getB2UploadUrl(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
  const s3 = getB2Client()
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET!,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}

// Presigned URL for streaming/downloading. Pass downloadFilename to
// force a "Save As" with that name (used by the download endpoint);
// omit it for in-browser streaming/playback.
export async function getB2DownloadUrl(
  key: string,
  opts?: { downloadFilename?: string; expiresInSeconds?: number }
): Promise<string> {
  const s3 = getB2Client()
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET!,
    Key: key,
    ...(opts?.downloadFilename
      ? { ResponseContentDisposition: `attachment; filename="${opts.downloadFilename.replace(/"/g, '')}"` }
      : {}),
  })
  return getSignedUrl(s3, command, { expiresIn: opts?.expiresInSeconds ?? 3600 })
}

// Deletes an object outright (track removal, so it doesn't sit around
// using up the quota for a track nobody can even play anymore).
export async function deleteB2Object(key: string): Promise<void> {
  const s3 = getB2Client()
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET!, Key: key }))
}

// Batch version for album/podcast deletes, which remove several tracks'
// audio at once. Each delete is independent -- one failure (e.g. a
// path that's already gone) shouldn't block the others.
export async function deleteB2Objects(keys: string[]): Promise<void> {
  await Promise.allSettled(keys.map(key => deleteB2Object(key)))
}

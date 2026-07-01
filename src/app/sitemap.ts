import type { MetadataRoute } from 'next'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const BASE_URL = 'https://muziqa.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [artistsRes, postsRes] = await Promise.all([
    db.from('artists').select('id, updated_at').eq('is_active', true).limit(500),
    db.from('blog_posts').select('slug, updated_at').eq('published', true).limit(200),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/landing`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/discover`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/songs`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/artists`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/charts`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/blog`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
  ]

  const artistRoutes: MetadataRoute.Sitemap = (artistsRes.data ?? []).map(a => ({
    url: `${BASE_URL}/artists/${a.id}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const blogRoutes: MetadataRoute.Sitemap = (postsRes.data ?? []).map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...artistRoutes, ...blogRoutes]
}

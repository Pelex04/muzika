import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/landing', '/blog', '/artists'],
        disallow: ['/admin', '/api/', '/profile', '/library', '/upload'],
      },
    ],
    sitemap: 'https://muziqa.vercel.app/sitemap.xml',
  }
}

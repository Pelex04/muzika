import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { getAdminClient } from '@/lib/admin'
import { LogoProvider } from '@/lib/logo-context'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'
import './globals.css'

const BASE_URL = 'https://muziqa.vercel.app'

export const viewport: Viewport = {
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Playback',
  },
  title: {
    default: 'Playback · Stream & Own Malawian Music',
    template: '%s · Playback',
  },
  description: "Buy, stream and discover the best of Malawi's artists — from Afropop to Gospel. Pay in MWK, download forever.",
  keywords: ['Malawi music', 'streaming', 'download', 'MWK', 'Afropop', 'Gospel', 'Malawian artists'],
  authors: [{ name: 'Playback' }],
  creator: 'Playback',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Playback',
    title: 'Playback · Stream & Own Malawian Music',
    description: "Buy, stream and discover the best of Malawi's artists — from Afropop to Gospel.",
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'Playback — Stream & Own Malawian Music',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playback · Stream & Own Malawian Music',
    description: "Buy, stream and discover the best of Malawi's artists.",
    images: [`${BASE_URL}/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = getAdminClient()
  const { data: settings } = await db.from('site_settings').select('logo_url').eq('id', 1).single()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <ServiceWorkerRegister />
        <LogoProvider logoUrl={settings?.logo_url ?? null}>
          {children}
        </LogoProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "'Inter', system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  )
}

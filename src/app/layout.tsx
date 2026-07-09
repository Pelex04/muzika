import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

const BASE_URL = 'https://muziqa.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
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

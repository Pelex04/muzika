import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Muzika · Stream & Own Malawian Music',
  description: "Buy, stream and discover the best of Malawi's artists — from Afropop to Gospel. Pay in MWK, download forever.",
  keywords: ['Malawi music', 'streaming', 'download', 'MWK', 'Afropop', 'Gospel'],
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
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}

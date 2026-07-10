import Link from 'next/link'
import { Music2, ArrowLeft } from 'lucide-react'

export default function PublicPageShell({
  children,
  backHref = '/landing',
}: {
  children: React.ReactNode
  backHref?: string
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#121212' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: '1px solid #2a2a2a',
        position: 'sticky', top: 0, background: '#121212', zIndex: 10,
      }}>
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Playback" style={{ width: '32px', height: '32px', borderRadius: '9px' }} />
          <span className="font-wordmark" style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
            playback
          </span>
        </Link>
        <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#717171', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back
        </Link>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 100px' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid #2a2a2a', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#555' }}>© {new Date().getFullYear()} Playback · All rights reserved</p>
      </footer>
    </div>
  )
}

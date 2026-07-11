import { ImageResponse } from 'next/og'
import { getAdminClient } from '@/lib/admin'

export const runtime = 'edge'
export const alt = 'Playback — Stream & Own Malawian Music'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const db = getAdminClient()
  const { data: settings } = await db.from('site_settings').select('logo_url').eq('id', 1).single()

  const logoData = settings?.logo_url
    ? await fetch(settings.logo_url).then(res => res.arrayBuffer())
    : await fetch(new URL('../../public/logo.png', import.meta.url)).then(res => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #080f24 0%, #0d1b3e 50%, #1a2f5e 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
          top: '-150px', left: '-150px',
        }} />

        {/* Logo mark */}
        <img
          src={logoData as any}
          width={100} height={100}
          style={{ borderRadius: '24px', marginBottom: '24px', boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}
        />

        <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', letterSpacing: '0.5px' }}>
          Stream &amp; Own Malawian Music
        </div>
      </div>
    ),
    { ...size }
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Muzika — Stream & Own Malawian Music'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
        <div style={{
          width: '80px', height: '80px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px', fontWeight: 900, color: '#fff',
          marginBottom: '24px',
          boxShadow: '0 0 40px rgba(37,99,235,0.5)',
        }}>M</div>

        <div style={{ fontSize: '64px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', display: 'flex' }}>
          MUZI<span style={{ color: '#2563eb' }}>KA</span>
        </div>

        <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.55)', marginTop: '16px', letterSpacing: '0.5px' }}>
          Stream &amp; Own Malawian Music
        </div>
      </div>
    ),
    { ...size }
  )
}

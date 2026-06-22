export default function Loading() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ height: '18px', width: '80px', background: '#2a2a2a', borderRadius: '4px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '16px', background: '#2a2a2a', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '26px', width: '60%', background: '#2a2a2a', borderRadius: '6px', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '14px', width: '40%', background: '#2a2a2a', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

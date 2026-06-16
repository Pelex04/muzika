export default function Loading() {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ height: '28px', background: '#E2E5F0', borderRadius: '6px', width: '180px', marginBottom: '28px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '13px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#E2E5F0', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '14px', background: '#E2E5F0', borderRadius: '4px', marginBottom: '6px', width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '12px', background: '#E2E5F0', borderRadius: '4px', width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

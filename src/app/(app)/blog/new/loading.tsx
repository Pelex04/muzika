export default function Loading() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ height: '24px', background: '#2a2a2a', borderRadius: '6px', width: '220px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '14px', background: '#2a2a2a', borderRadius: '4px', width: '300px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <div style={{ height: '11px', background: '#2a2a2a', borderRadius: '4px', width: '100px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: i === 3 ? '160px' : '44px', background: '#2a2a2a', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

export default function Loading() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        <div style={{ width: '112px', height: '112px', borderRadius: '50%', background: '#181818', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '24px', width: '50%', background: '#181818', borderRadius: '6px', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '14px', width: '70%', background: '#181818', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: '60px', background: '#181818', borderRadius: '10px', marginBottom: '4px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

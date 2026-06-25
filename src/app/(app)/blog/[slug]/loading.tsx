export default function Loading() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ height: '14px', width: '80px', background: '#181818', borderRadius: '4px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '32px', width: '90%', background: '#181818', borderRadius: '6px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '14px', width: '40%', background: '#181818', borderRadius: '4px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '280px', background: '#181818', borderRadius: '16px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: '16px', width: i % 2 === 0 ? '100%' : '85%', background: '#181818', borderRadius: '4px', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

export default function Loading() {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ height: '40px', background: '#181818', borderRadius: '10px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '14px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: '#181818', borderRadius: '12px', aspectRatio: '1', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

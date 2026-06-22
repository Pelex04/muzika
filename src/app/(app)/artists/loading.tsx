export default function Loading() {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ height: '28px', background: '#2a2a2a', borderRadius: '6px', width: '200px', marginBottom: '28px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '14px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(13,27,62,.06)' }}>
            <div style={{ aspectRatio: '1', background: '#2a2a2a', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
            <div style={{ padding: '12px' }}>
              <div style={{ height: '13px', background: '#2a2a2a', borderRadius: '4px', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '11px', background: '#2a2a2a', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

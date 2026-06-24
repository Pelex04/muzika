export default function Loading() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ height: '40px', background: '#181818', borderRadius: '10px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '180px', background: '#181818', borderRadius: '16px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.1s' }} />
      <div style={{ height: '50px', background: '#181818', borderRadius: '10px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }} />
      <div style={{ height: '50px', background: '#181818', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.3s' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

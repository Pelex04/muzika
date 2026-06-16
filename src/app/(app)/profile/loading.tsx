export default function Loading() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(13,27,62,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E2E5F0', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '18px', background: '#E2E5F0', borderRadius: '4px', width: '140px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: '13px', background: '#E2E5F0', borderRadius: '4px', width: '180px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #F4F6FB' }}>
          <div style={{ height: '36px', background: '#E2E5F0', borderRadius: '8px', width: '120px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '36px', background: '#E2E5F0', borderRadius: '8px', width: '100px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

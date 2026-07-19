export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>{children}</p>
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '10px' }}>{children}</h1>
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#b3b3b3', fontSize: '15px', lineHeight: 1.8, marginBottom: '28px' }}>{children}</p>
}

export function Meta({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#555', fontSize: '13px', marginBottom: '24px' }}>{children}</p>
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginTop: '28px', marginBottom: '12px' }}>{children}</h2>
}

export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#b3b3b3', fontSize: '14px', lineHeight: 1.75, marginBottom: '14px' }}>{children}</p>
}

export function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ color: '#b3b3b3', fontSize: '14px', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '14px' }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
      {children}
    </div>
  )
}

export function TagRow({ items, color = '#3b82f6' }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
      {items.map(item => (
        <span key={item} style={{ background: `${color}22`, color, fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '100px' }}>
          {item}
        </span>
      ))}
    </div>
  )
}

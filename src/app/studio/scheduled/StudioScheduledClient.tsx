'use client'

import { Calendar, Music2, Disc3, Clock } from 'lucide-react'

interface ScheduledItem {
  id: string; title: string; genre: string; cover_url: string | null; release_date: string
}

function countdown(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  if (diff <= 0) return 'Going live soon…'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `${d}d ${h}h remaining`
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m remaining`
}

export default function StudioScheduledClient({ scheduledTracks, scheduledAlbums }: { scheduledTracks: ScheduledItem[]; scheduledAlbums: ScheduledItem[] }) {
  const total = scheduledTracks.length + scheduledAlbums.length

  return (
    <div style={{ padding: '28px 24px 100px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0 }}>Scheduled Releases</h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{total} upcoming release{total !== 1 ? 's' : ''}</p>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No scheduled releases. Use the upload form to schedule a track or album.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...scheduledTracks.map(t => ({ ...t, _type: 'track' })), ...scheduledAlbums.map(a => ({ ...a, _type: 'album' }))]
            .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
            .map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#161616', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: '#0d1b3e', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                  {item.cover_url ? <img src={item.cover_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item._type === 'album' ? <Disc3 size={20} color="#2a2a2a" /> : <Music2 size={20} color="#2a2a2a" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: 'rgba(37,99,235,0.15)', color: '#60a5fa', textTransform: 'uppercase', flexShrink: 0 }}>
                      {(item as any)._type}
                    </span>
                  </div>
                  <p style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={11} />
                    {new Date(item.release_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    <span style={{ color: '#555', fontWeight: 500 }}>· {countdown(item.release_date)}</span>
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

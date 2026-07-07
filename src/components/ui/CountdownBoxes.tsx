'use client'

import { useEffect, useState } from 'react'

function getTimeLeft(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  }
}

export default function CountdownBoxes({ targetDate, compact = false }: { targetDate: string; compact?: boolean }) {
  const [time, setTime] = useState(() => getTimeLeft(targetDate))

  useEffect(() => {
    setTime(getTimeLeft(targetDate)) // resync immediately if targetDate changes
    const id = setInterval(() => setTime(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (time.done) {
    return <span style={{ color: '#4ade80', fontSize: compact ? '12px' : '14px', fontWeight: 700 }}>Going live…</span>
  }

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ]

  return (
    <div style={{ display: 'flex', gap: compact ? '4px' : '8px' }}>
      {units.map(u => (
        <div
          key={u.label}
          style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: compact ? '6px' : '10px',
            textAlign: 'center',
            padding: compact ? '4px 6px' : '10px 14px',
            minWidth: compact ? '34px' : '56px',
          }}
        >
          <div style={{ color: '#fff', fontWeight: 800, fontSize: compact ? '13px' : '22px', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
            {String(u.value).padStart(2, '0')}
          </div>
          <div style={{ color: '#717171', fontSize: compact ? '7px' : '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>
            {u.label}
          </div>
        </div>
      ))}
    </div>
  )
}

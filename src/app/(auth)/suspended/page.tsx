'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldX } from 'lucide-react'

export default function SuspendedPage() {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '400px', width: '100%',
        background: '#141414', border: '1px solid #2a2a2a',
        borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <ShieldX size={28} color="#ef4444" />
        </div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
          Account Suspended
        </h1>
        <p style={{ color: '#b3b3b3', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
          Your account has been suspended for violating our community guidelines.
          If you believe this is a mistake, please contact us at{' '}
          <a href="mailto:support@muziqa.app" style={{ color: '#60a5fa' }}>support@muziqa.app</a>.
        </p>
        <button
          onClick={signOut}
          style={{
            width: '100%', padding: '13px',
            background: '#1f1f1f', border: '1px solid #3a3a3a',
            borderRadius: '12px', color: '#fff',
            fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

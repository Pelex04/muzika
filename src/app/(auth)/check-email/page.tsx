import Link from 'next/link'
import { Music2, Mail, ArrowLeft } from 'lucide-react'

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#121212', padding: '24px' }}>
      <div style={{ background: '#181818', borderRadius: '20px', padding: '48px 40px', maxWidth: '460px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,.3), 0 12px 40px rgba(0,0,0,.4)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
            <Music2 size={18} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px' }}>
            MUZI<span style={{ color: '#2563EB' }}>KA</span>
          </span>
        </div>

        {/* Email icon */}
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#DBEAFE', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
          <Mail size={32} color="#2563EB" />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '12px' }}>
          Check your email
        </h1>
        <p style={{ fontSize: '15px', color: '#b3b3b3', lineHeight: 1.65, marginBottom: '8px' }}>
          We sent a confirmation link to:
        </p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '28px', wordBreak: 'break-all' }}>
          your registered email address
        </p>

        <div style={{ background: '#121212', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', color: '#b3b3b3', lineHeight: 1.6 }}>
            <strong style={{ color: '#ffffff' }}>Click the link in the email</strong> to confirm your account, then come back here to sign in.
          </p>
          <p style={{ fontSize: '13px', color: '#717171', marginTop: '8px' }}>
            Didn&apos;t get it? Check your spam folder. The link expires in 24 hours.
          </p>
        </div>

        <Link
          href="/signin"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '14px',
            background: '#ffffff', color: '#000000',
            borderRadius: '8px', textDecoration: 'none',
            fontSize: '15px', fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          Go to Sign In
        </Link>

        <Link
          href="/signup"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#717171', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          Back to sign up
        </Link>
      </div>
    </div>
  )
}

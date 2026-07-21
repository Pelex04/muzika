'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { notify } from '@/components/ui/notify'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AuthVisualPanel from '@/components/auth/AuthVisualPanel'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/api/auth/reset-callback`,
      })
      if (error) {
        notify.error(error.message)
        setLoading(false)
        return
      }
      setSentTo(data.email)
    } catch {
      notify.error('Cannot connect to server. Check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .auth-wrap { display:flex; min-height:100vh; }
        .auth-left { width:42%; position:relative; overflow:hidden; }
        .auth-right {
          flex:1; background:#000000;
          display:flex; align-items:center; justify-content:center;
          padding:48px 72px; overflow-y:auto;
        }
        .auth-form { width:100%; max-width:400px; }
        .field-wrap { position:relative; display:flex; align-items:center; }
        .field-icon { position:absolute; left:13px; display:flex; align-items:center; pointer-events:none; }
        .field-input {
          width:100%; padding:12px 14px 12px 40px;
          border:1.5px solid #2a2a2a; border-radius:8px;
          font-size:14px; color:#ffffff; outline:none;
          box-sizing:border-box; font-family:inherit;
          transition:border-color .2s, box-shadow .2s;
          background:transparent;
        }
        .field-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .btn-primary {
          width:100%; padding:14px; background:#ffffff; color:#000000;
          border:none; border-radius:8px; font-size:15px; font-weight:700;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          gap:8px; margin-bottom:16px; font-family:inherit; transition:background .15s;
        }
        .btn-primary:hover { background:#e5e5e5; }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .form-label {
          display:block; font-size:11px; font-weight:700; color:#b3b3b3;
          text-transform:uppercase; letter-spacing:.7px; margin-bottom:7px;
        }
        @media (max-width:768px) {
          .auth-left { display:none; }
          .auth-right { padding:40px 24px; }
        }
      `}</style>

      <div className="auth-wrap">
        <div className="auth-left">
          <AuthVisualPanel
            headline={<>Forgot your <span style={{ color: '#60A5FA' }}>password?</span></>}
            sub="No worries — enter your email and we'll send you a link to get back in."
          />
        </div>

        <div className="auth-right">
          <div className="auth-form">
            {sentTo ? (
              <>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0a1a0f', border: '1px solid #166534', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
                  <CheckCircle2 size={26} color="#4ade80" />
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-.5px', marginBottom: '12px' }}>
                  Check your email
                </h2>
                <p style={{ fontSize: '14px', color: '#b3b3b3', lineHeight: 1.6, marginBottom: '4px' }}>
                  We sent a password reset link to
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '28px', wordBreak: 'break-all' }}>
                  {sentTo}
                </p>
                <p style={{ fontSize: '13px', color: '#717171', marginBottom: '28px', lineHeight: 1.6 }}>
                  Didn&apos;t get it? Check your spam folder, or try again with a different email.
                </p>
                <Link
                  href="/signin"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '14px',
                    background: '#ffffff', color: '#000000',
                    borderRadius: '8px', textDecoration: 'none',
                    fontSize: '15px', fontWeight: 700,
                  }}
                >
                  Back to Sign In
                </Link>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-.5px', marginBottom: '4px' }}>
                  Reset your password
                </h2>
                <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '28px' }}>
                  Enter the email linked to your account and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Email</label>
                    <div className="field-wrap">
                      <span className="field-icon"><Mail size={16} color="#717171" /></span>
                      <input {...register('email')} type="text" placeholder="thandizo@gmail.com" className="field-input" />
                    </div>
                    {errors.email && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Sending\u2026' : 'Send Reset Link'}
                  </button>
                </form>

                <Link
                  href="/signin"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#717171', textDecoration: 'none' }}
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

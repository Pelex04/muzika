'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { notify } from '@/components/ui/notify'
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AuthVisualPanel from '@/components/auth/AuthVisualPanel'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [validSession, setValidSession] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // The reset link redirects through /api/auth/callback, which exchanges
  // the code for a real (recovery) session before landing here. If that
  // didn't happen -- expired link, direct visit, etc. -- there's no
  // session and we can't let them set a password.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setValidSession(!!data.user)
      setCheckingSession(false)
    })
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) {
        notify.error(error.message)
        setLoading(false)
        return
      }
      notify.success('Password updated', 'You can now use your new password.')
      router.push('/discover')
      router.refresh()
    } catch {
      notify.error('Cannot connect to server. Check your internet connection and try again.')
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
        .field-icon-r { position:absolute; right:13px; display:flex; align-items:center; background:none; border:none; cursor:pointer; padding:0; }
        .field-input {
          width:100%; padding:12px 14px 12px 40px;
          border:1.5px solid #2a2a2a; border-radius:8px;
          font-size:14px; color:#ffffff; outline:none;
          box-sizing:border-box; font-family:inherit;
          transition:border-color .2s, box-shadow .2s;
          background:transparent;
        }
        .field-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .field-input-pr { padding-right:40px; }
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
            headline={<>Set a new <span style={{ color: '#60A5FA' }}>password.</span></>}
            sub="Choose something secure you haven't used before."
          />
        </div>

        <div className="auth-right">
          <div className="auth-form">
            {checkingSession ? (
              <p style={{ fontSize: '14px', color: '#717171' }}>Checking your link\u2026</p>
            ) : !validSession ? (
              <>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1a0a0a', border: '1px solid #7f1d1d', display: 'grid', placeItems: 'center', marginBottom: '24px' }}>
                  <AlertCircle size={26} color="#f87171" />
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-.5px', marginBottom: '12px' }}>
                  Link expired or invalid
                </h2>
                <p style={{ fontSize: '14px', color: '#b3b3b3', lineHeight: 1.6, marginBottom: '28px' }}>
                  This password reset link is no longer valid. Request a new one to continue.
                </p>
                <Link
                  href="/forgot-password"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '14px',
                    background: '#ffffff', color: '#000000',
                    borderRadius: '8px', textDecoration: 'none',
                    fontSize: '15px', fontWeight: 700,
                  }}
                >
                  Request New Link
                </Link>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-.5px', marginBottom: '4px' }}>
                  Set a new password
                </h2>
                <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '28px' }}>
                  Make sure it&apos;s at least 6 characters.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">New Password</label>
                    <div className="field-wrap">
                      <span className="field-icon"><Lock size={16} color="#717171" /></span>
                      <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="field-input field-input-pr" />
                      <button type="button" className="field-icon-r" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} color="#717171" /> : <Eye size={16} color="#717171" />}
                      </button>
                    </div>
                    {errors.password && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Confirm Password</label>
                    <div className="field-wrap">
                      <span className="field-icon"><Lock size={16} color="#717171" /></span>
                      <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="field-input field-input-pr" />
                    </div>
                    {errors.confirmPassword && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword.message}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Updating\u2026' : 'Update Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

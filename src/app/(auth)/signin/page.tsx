'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, Music2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AuthVisualPanel from '@/components/auth/AuthVisualPanel'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('Please confirm your email first. Check your inbox.')
        } else if (error.message.toLowerCase().includes('invalid login')) {
          toast.error('Wrong email or password. Please try again.')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }
      toast.success('Welcome back!')
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get('redirectTo') ?? '/discover'
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      toast.error('Cannot connect to server. Check your internet connection and try again.')
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <>
      <style>{`
        .auth-wrap { display:flex; min-height:100vh; }
        .auth-left {
          width:42%;
          position:relative; overflow:hidden;
        }
        .auth-right {
          flex:1; background:#000000;
          display:flex; align-items:center; justify-content:center;
          padding:48px 72px; overflow-y:auto;
        }
        .auth-form { width:100%; max-width:400px; }
        .auth-mobile-logo { display:none; align-items:center; gap:9px; margin-bottom:32px; }
        .field-wrap { position:relative; display:flex; align-items:center; }
        .field-icon { position:absolute; left:13px; display:flex; align-items:center; pointer-events:none; }
        .field-icon-r { position:absolute; right:13px; display:flex; align-items:center; background:none; border:none; cursor:pointer; padding:0; }
        .field-input {
          width:100%; padding:12px 14px 12px 40px;
          border:1.5px solid #2a2a2a; border-radius:8px;
          font-size:14px; color:#ffffff; outline:none;
          box-sizing:border-box; font-family:inherit;
          transition:border-color .2s, box-shadow .2s;
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
        .btn-social {
          padding:11px; border:1.5px solid #2a2a2a; border-radius:8px;
          background:transparent; font-size:13px; font-weight:600; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          gap:7px; color:#ffffff; font-family:inherit; transition:all .15s;
        }
        .btn-social:hover { border-color:#2563EB; background:#181818; }
        .form-label {
          display:block; font-size:11px; font-weight:700; color:#b3b3b3;
          text-transform:uppercase; letter-spacing:.7px; margin-bottom:7px;
        }
        @media (max-width:768px) {
          .auth-left { display:none; }
          .auth-right { padding:40px 24px; }
          .auth-mobile-logo { display:flex !important; }
        }
      `}</style>

      <div className="auth-wrap">

        {/* LEFT */}
        <div className="auth-left">
          <AuthVisualPanel
            headline={<>Welcome <span style={{ color: '#60A5FA' }}>back.</span></>}
            sub="Sign in to continue your music journey. Your library and downloads are waiting."
            footer={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex' }}>
                  {['#065f46', '#1e3a8a', '#7f1d1d', '#134e4a', '#78350f'].map((c, i) => (
                    <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)', marginRight: '-8px', background: `linear-gradient(135deg,${c},#0d1b3e)` }} />
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.6)', marginLeft: '16px' }}>
                  <strong style={{ color: '#fff' }}>+4,200</strong> joined this week
                </span>
              </div>
            }
          />
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form">
            <div className="auth-mobile-logo">
              <div style={{ width:'36px', height:'36px', borderRadius:'9px', background:'#0D1B3E', display:'grid', placeItems:'center' }}>
                <Music2 size={18} color="white" />
              </div>
              <span style={{ fontSize:'18px', fontWeight:800, color:'#0D1B3E' }}>
                MUZI<span style={{ color:'#2563EB' }}>KA</span>
              </span>
            </div>

            <h2 style={{ fontSize:'26px', fontWeight:800, color:'#0D1B3E', letterSpacing:'-.5px', marginBottom:'4px' }}>Welcome back</h2>
            <p style={{ fontSize:'14px', color:'#b3b3b3', marginBottom:'28px' }}>Sign in to continue your music journey.</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom:'16px' }}>
                <label className="form-label">Email or Phone</label>
                <div className="field-wrap">
                  <span className="field-icon"><Mail size={16} color="#717171" /></span>
                  <input {...register('email')} type="text" placeholder="thandizo@gmail.com" className="field-input" />
                </div>
                {errors.email && <p style={{ color:'#EF4444', fontSize:'12px', marginTop:'4px' }}>{errors.email.message}</p>}
              </div>

              <div style={{ marginBottom:'8px' }}>
                <label className="form-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon"><Lock size={16} color="#717171" /></span>
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="field-input field-input-pr" />
                  <button type="button" className="field-icon-r" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} color="#717171" /> : <Eye size={16} color="#717171" />}
                  </button>
                </div>
                {errors.password && <p style={{ color:'#EF4444', fontSize:'12px', marginTop:'4px' }}>{errors.password.message}</p>}
              </div>

              <div style={{ textAlign:'right', marginBottom:'20px' }}>
                <span style={{ fontSize:'13px', color:'#2563EB', fontWeight:600, cursor:'pointer' }}>Forgot password?</span>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Signing in\u2026' : 'Sign In \u2192'}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ flex:1, height:'1px', background:'#2a2a2a' }} />
              <span style={{ fontSize:'12px', color:'#717171' }}>or sign in with</span>
              <div style={{ flex:1, height:'1px', background:'#2a2a2a' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'24px' }}>
              <button className="btn-social" onClick={signInWithGoogle}>
                <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="btn-social">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
              <button className="btn-social">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Face ID
              </button>
            </div>

            <p style={{ textAlign:'center', fontSize:'13px', color:'#717171' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color:'#2563EB', fontWeight:700 }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

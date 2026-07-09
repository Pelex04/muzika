'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { notify } from '@/components/ui/notify'
import { Eye, EyeOff, Mail, Lock, User, Phone, Music2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AuthVisualPanel from '@/components/auth/AuthVisualPanel'

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  terms: z.boolean().refine(v => v, 'You must accept the terms'),
})
type FormData = z.infer<typeof schema>

function getStrength(p: string): number {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', minHeight: '100vh' },
  left: {
    width: '42%',
    position: 'relative',
    overflow: 'hidden',
  },
  right: {
    flex: 1,
    background: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 72px',
    overflowY: 'auto' as const,
  },
  formWrap: { width: '100%', maxWidth: '400px' },
  logoMark: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #3B82F6, #1d4ed8)',
    display: 'grid', placeItems: 'center',
    boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
    flexShrink: 0,
  },
  logoMarkSm: {
    width: '36px', height: '36px', borderRadius: '9px',
    background: '#0D1B3E',
    display: 'grid', placeItems: 'center', flexShrink: 0,
  },
  label: {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#b3b3b3', textTransform: 'uppercase' as const,
    letterSpacing: '0.7px', marginBottom: '7px',
  },
  fieldWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
  fieldIcon: {
    position: 'absolute' as const, left: '13px',
    display: 'flex', alignItems: 'center', pointerEvents: 'none' as const,
  },
  fieldIconR: {
    position: 'absolute' as const, right: '13px',
    display: 'flex', alignItems: 'center',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  },
  input: {
    width: '100%', paddingTop: '12px', paddingBottom: '12px',
    paddingLeft: '40px', paddingRight: '14px',
    border: '1.5px solid #2a2a2a', borderRadius: '8px',
    fontSize: '14px', color: '#ffffff',
    outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s',
    background: '#000000',
  },
  inputPr: { paddingRight: '40px' },
  errText: { color: '#EF4444', fontSize: '12px', marginTop: '4px' },
  submitBtn: {
    width: '100%', padding: '14px',
    background: '#0D1B3E', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    marginBottom: '16px', transition: 'background .15s',
  },
  dividerLine: { flex: 1, height: '1px', background: '#2a2a2a' },
  socialBtn: {
    flex: 1, padding: '11px',
    border: '1.5px solid #2a2a2a', borderRadius: '8px',
    background: 'transparent', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    color: '#ffffff',
  },
}

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const strength = getStrength(password)
  const strengthColors = ['#2a2a2a', '#EF4444', '#F59E0B', '#F59E0B', '#10B981']
  const watchTerms = watch('terms')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, phone: data.phone },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      notify.error(error.message)
      setLoading(false)
      return
    }
    notify.success('Account created! Check your email to confirm.')
    router.push('/check-email')
  }

  const signUpWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#2563EB'
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#2a2a2a'
    e.target.style.boxShadow = 'none'
  }

  return (
    <>
      <style>{`
        .auth-left-signup { display: flex; }
        @media (max-width: 768px) {
          .auth-left-signup { display: none !important; }
          .auth-right-signup { padding: 40px 24px !important; }
          .auth-mobile-logo-signup { display: flex !important; }
        }
      `}</style>

      <div style={S.wrap}>

        {/* LEFT */}
        <div style={S.left} className="auth-left-signup">
          <AuthVisualPanel
            headline={<>Your music,<br />your <span style={{ color: '#60A5FA' }}>earnings.</span></>}
            sub="Join thousands of Malawian music lovers and artists on the platform built for us."
            footer={
              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '14px', padding: '18px' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '14px' }}>
                  &ldquo;Playback gave me my first MK50,000 from music. I uploaded on a Sunday and had sales by Monday.&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>M</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>Macelina</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>RnB Artist · Mzuzu</p>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* RIGHT */}
        <div style={S.right} className="auth-right-signup">
          <div style={S.formWrap}>

            {/* Mobile logo */}
            <div className="auth-mobile-logo-signup" style={{ display: 'none', alignItems: 'center', gap: '9px', marginBottom: '32px' }}>
              <div style={S.logoMarkSm}><Music2 size={18} color="white" /></div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                PLAY<span style={{ color: '#2563EB' }}>BACK</span>
              </span>
            </div>

            {/* Step row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{
                display: 'inline-flex', padding: '4px 12px',
                border: '1.5px solid #2a2a2a', borderRadius: '20px',
                fontSize: '11px', fontWeight: 700, color: '#b3b3b3',
              }}>STEP 1 OF 2</span>
              <a href="/landing" style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB', cursor: 'pointer', textDecoration: 'none' }}>Skip for now</a>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '28px' }}>
              Join thousands of Malawians already on Playback.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Full Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Full Name</label>
                <div style={S.fieldWrap}>
                  <span style={S.fieldIcon}><User size={16} color="#717171" /></span>
                  <input {...register('full_name')} type="text" placeholder="Thandizo Mwale"
                    style={S.input} onFocus={focus} onBlur={blur} />
                </div>
                {errors.full_name && <p style={S.errText}>{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Email</label>
                <div style={S.fieldWrap}>
                  <span style={S.fieldIcon}><Mail size={16} color="#717171" /></span>
                  <input {...register('email')} type="email" placeholder="thandizo@gmail.com"
                    style={{ ...S.input, borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(59,130,246,0.12)' }}
                    onFocus={focus} onBlur={blur} />
                </div>
                {errors.email && <p style={S.errText}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Password</label>
                <div style={S.fieldWrap}>
                  <span style={S.fieldIcon}><Lock size={16} color="#717171" /></span>
                  <input
                    {...register('password', {
                      onChange: (e) => setPassword(e.target.value)
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    style={{ ...S.input, ...S.inputPr }}
                    onFocus={focus} onBlur={blur}
                  />
                  <button type="button" style={S.fieldIconR} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} color="#717171" /> : <Eye size={16} color="#717171" />}
                  </button>
                </div>
                {/* Strength bars */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '7px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i <= strength ? strengthColors[strength] : '#2a2a2a',
                      transition: 'background .2s',
                    }} />
                  ))}
                </div>
                {errors.password && <p style={S.errText}>{errors.password.message}</p>}
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Phone (Optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    padding: '12px 14px', border: '1.5px solid #2a2a2a', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 600, color: '#ffffff',
                    background: '#000000', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                  }}>
                    🇲🇼 +265
                  </div>
                  <div style={{ ...S.fieldWrap, flex: 1 }}>
                    <span style={S.fieldIcon}><Phone size={16} color="#717171" /></span>
                    <input {...register('phone')} type="tel" placeholder="99 123 4567"
                      style={S.input} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
                <label style={{ position: 'relative', flexShrink: 0, marginTop: '1px', cursor: 'pointer', display: 'block', width: '18px', height: '18px' }}>
                  <input
                    {...register('terms')}
                    type="checkbox"
                    style={{
                      position: 'absolute', inset: 0, width: '18px', height: '18px',
                      margin: 0, opacity: 0, cursor: 'pointer', zIndex: 1,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute', inset: 0,
                      width: '18px', height: '18px', borderRadius: '4px',
                      border: watchTerms ? 'none' : '1.5px solid #717171',
                      background: watchTerms ? '#ffffff' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .12s', pointerEvents: 'none',
                    }}
                  >
                    {watchTerms && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </label>
                <label style={{ fontSize: '13px', color: '#b3b3b3', lineHeight: 1.5, cursor: 'pointer' }}>
                  I agree to Playback&apos;s{' '}
                  <a style={{ color: '#2563EB', fontWeight: 600 }}>Terms of Service</a>
                  {' '}and{' '}
                  <a style={{ color: '#2563EB', fontWeight: 600 }}>Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p style={S.errText}>{errors.terms.message}</p>}

              <button type="submit" disabled={loading}
                style={{ ...S.submitBtn, ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}>
                <User size={16} color="white" />
                {loading ? 'Creating account\u2026' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={S.dividerLine} />
              <span style={{ fontSize: '12px', color: '#717171' }}>or continue with</span>
              <div style={S.dividerLine} />
            </div>

            {/* Social */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <button style={S.socialBtn} onClick={signUpWithGoogle}>
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button style={S.socialBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#717171' }}>
              Already have an account?{' '}
              <Link href="/signin" style={{ color: '#2563EB', fontWeight: 700 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

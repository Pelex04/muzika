export default function EnvCheckPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const urlValid = supabaseUrl?.includes('.supabase.co') && !supabaseUrl?.includes('your-project')

  return (
    <div style={{ fontFamily: 'monospace', padding: '40px', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '20px' }}>Muzika — Environment Check</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px 16px 8px 0', fontWeight: 'bold' }}>SUPABASE_URL</td>
            <td style={{ padding: '8px 0', color: urlValid ? 'green' : 'red' }}>
              {urlValid ? '✓ ' + supabaseUrl : '✗ ' + (supabaseUrl || 'NOT SET')}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 16px 8px 0', fontWeight: 'bold' }}>ANON_KEY</td>
            <td style={{ padding: '8px 0', color: hasAnonKey ? 'green' : 'red' }}>
              {hasAnonKey ? '✓ Set' : '✗ NOT SET'}
            </td>
          </tr>
        </tbody>
      </table>

      {(!urlValid || !hasAnonKey) && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
          <p style={{ fontWeight: 'bold', color: '#DC2626', marginBottom: '8px' }}>⚠ Environment variables not configured</p>
          <p style={{ color: '#7F1D1D', fontSize: '14px', lineHeight: 1.6 }}>
            1. Open <code>.env.local</code> in your project root<br/>
            2. Add your Supabase URL and anon key from:<br/>
            &nbsp;&nbsp;<a href="https://supabase.com/dashboard/project/_/settings/api" style={{ color: '#2563EB' }}>supabase.com/dashboard → Settings → API</a><br/>
            3. Restart <code>npm run dev</code>
          </p>
        </div>
      )}

      {urlValid && hasAnonKey && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
          <p style={{ color: '#166534', fontWeight: 'bold' }}>✓ Environment looks good. <a href="/signin" style={{ color: '#2563EB' }}>Go to Sign In →</a></p>
        </div>
      )}
    </div>
  )
}

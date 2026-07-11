import Link from 'next/link'
import { getAdminClient } from '@/lib/admin'

export default async function LandingPage() {
  const db = getAdminClient()
  const { data: settings } = await db.from('site_settings').select('logo_url').eq('id', 1).single()
  const logoUrl = settings?.logo_url ?? '/logo.png'
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; -webkit-font-smoothing: antialiased; }

        .lp-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #080f24;
          color: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── NAV ── */
        .lp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 52px;
          height: 68px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8,15,36,0.82);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .lp-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .lp-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          overflow: hidden;
          display: grid;
          place-items: center;
        }
        .lp-logo-mark img { width: 100%; height: 100%; object-fit: cover; }
        .lp-logo-text {
          font-family: 'Outfit', 'Inter', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .lp-logo-accent { color: #60a5fa; }
        .lp-nav-links {
          display: flex;
          gap: 36px;
          list-style: none;
        }
        .lp-nav-links a {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.15s;
        }
        .lp-nav-links a:hover { color: rgba(255,255,255,0.9); }
        .lp-nav-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .btn-nav-ghost {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-nav-ghost:hover {
          border-color: rgba(255,255,255,0.35);
          color: #fff;
        }
        .btn-nav-solid {
          padding: 8px 14px;
          border-radius: 8px;
          background: #2563eb;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-nav-solid:hover { background: #1d4ed8; }

        /* ── HERO ── */
        .lp-hero {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 100px 52px 120px;
          position: relative;
          overflow: clip;
          min-height: calc(100vh - 68px);
        }
        .lp-hero-photo {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1546707012-c46675f12716?auto=format&fit=crop&w=1800&q=80');
          background-size: cover;
          background-position: center 30%;
          opacity: 0.22;
          mask-image: linear-gradient(100deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 80%);
          -webkit-mask-image: linear-gradient(100deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 80%);
        }
        .lp-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 65% 40%, rgba(37,99,235,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 30% 80%, rgba(29,78,216,0.10) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Concentric rings */
        .lp-rings {
          position: absolute;
          right: 4%;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* LEFT content */
        .lp-hero-left {
          position: relative;
          z-index: 2;
          max-width: 560px;
          width: 100%;
          flex-shrink: 0;
        }
        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.38);
        }
        .lp-eyebrow-line {
          width: 28px;
          height: 1px;
          background: rgba(255,255,255,0.25);
        }

        .lp-h1 {
          font-size: 64px;
          font-weight: 900;
          line-height: 1.04;
          letter-spacing: -2.5px;
          color: #fff;
          margin-bottom: 24px;
        }
        .lp-h1-accent { color: #60a5fa; }
        .lp-h1-light { font-weight: 300; color: rgba(255,255,255,0.75); }

        .lp-sub {
          font-size: 17px;
          line-height: 1.7;
          color: rgba(255,255,255,0.52);
          max-width: 430px;
          margin-bottom: 40px;
          font-weight: 400;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .lp-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 44px;
        }
        .lp-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.72);
          backdrop-filter: blur(4px);
        }
        .lp-pill svg { opacity: 0.7; flex-shrink: 0; }

        .lp-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
        .btn-cta-primary {
          padding: 14px 30px;
          border-radius: 10px;
          background: #2563eb;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: -0.2px;
        }
        .btn-cta-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .btn-cta-secondary {
          padding: 14px 30px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s;
          backdrop-filter: blur(4px);
        }
        .btn-cta-secondary:hover { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.3); }

        /* Social proof row */
        .lp-proof {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .lp-proof-avatars { display: flex; }
        .lp-proof-av {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #080f24;
          margin-right: -7px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .lp-proof-text {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-left: 18px;
          font-weight: 400;
        }
        .lp-proof-text strong { color: rgba(255,255,255,0.8); font-weight: 600; }

        /* ── FLOATING CARDS (right side) ── */
        .lp-cards {
          position: absolute;
          right: 7%;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .glass-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .card-now-playing {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 272px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
        }
        .card-np-art {
          width: 44px;
          height: 44px;
          border-radius: 9px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .card-np-info { flex: 1; min-width: 0; }
        .card-np-title { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-np-artist { font-size: 11.5px; color: rgba(255,255,255,0.45); margin-top: 2px; }
        .card-np-play {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #fff;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          cursor: pointer;
        }
        .card-np-progress {
          margin-top: 10px;
          height: 2px;
          background: rgba(255,255,255,0.12);
          border-radius: 1px;
        }
        .card-np-progress-fill {
          height: 100%;
          width: 38%;
          background: #60a5fa;
          border-radius: 1px;
        }

        .card-stats {
          padding: 18px 20px;
          min-width: 195px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
        }
        .card-stats-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }
        .card-stats-num {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -1.5px;
          line-height: 1;
          margin-bottom: 14px;
        }
        .card-stats-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 32px;
        }
        .card-stats-bar {
          flex: 1;
          border-radius: 2px;
          background: #3b82f6;
        }

        /* ── FOOTER ── */
        .lp-footer {
          padding: 24px 52px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* ── FOOTER COLUMNS (Company / For Artists / Explore) ── */
        .lp-footer-columns {
          padding: 56px 52px 40px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 40px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        @media (max-width: 720px) {
          .lp-footer-columns { grid-template-columns: 1fr; gap: 32px; padding: 40px 24px 24px; }
        }
        .lp-footer-col-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 16px;
        }
        .lp-footer-col-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lp-footer-col-links a {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: color 0.15s;
        }
        .lp-footer-col-links a:hover { color: #ffffff; }
        .lp-footer-blurb {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.4);
          max-width: 320px;
        }
        .lp-footer-copy {
          font-size: 13px;
          color: rgba(255,255,255,0.22);
        }
        .lp-footer-links {
          display: flex;
          gap: 28px;
          list-style: none;
        }
        .lp-footer-links a {
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          transition: color 0.15s;
        }
        .lp-footer-links a:hover { color: rgba(255,255,255,0.6); }

        .lp-footer-social {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .lp-social-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          transition: all 0.15s;
        }
        .lp-social-icon:hover {
          background: rgba(255,255,255,0.12);
          color: #ffffff;
        }
        .lp-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .lp-cards { display: none; }
          .lp-rings { display: none; }
          .lp-hero-photo {
            opacity: 0.28;
            background-position: center 25%;
            mask-image: linear-gradient(180deg, black 0%, rgba(0,0,0,0.4) 30%, transparent 50%);
            -webkit-mask-image: linear-gradient(180deg, black 0%, rgba(0,0,0,0.4) 30%, transparent 50%);
          }
          .lp-h1 { font-size: 52px; }
        }
        @media (max-width: 768px) {
          .lp-nav { padding: 0 16px; }
          .lp-nav-links { display: none; }
          .lp-hero {
            padding: 56px 20px 72px;
            min-height: auto;
            align-items: flex-start;
          }
          .lp-hero-left {
            max-width: 100%;
            width: 100%;
          }
          .lp-h1 { font-size: 36px; letter-spacing: -1.5px; }
          .lp-sub {
            font-size: 15px;
            max-width: 100%;
            color: rgba(255,255,255,0.55);
          }
          .lp-pills { gap: 8px; }
          .lp-pill { font-size: 12px; padding: 7px 12px; }
          .lp-ctas { gap: 10px; }
          .btn-cta-primary, .btn-cta-secondary {
            padding: 13px 22px;
            font-size: 14px;
          }
          .lp-footer { padding: 20px 24px; flex-direction: column; gap: 12px; text-align: center; }
          .lp-footer-links { justify-content: center; }
          .lp-footer-bottom { flex-direction: column; gap: 16px; }
          .lp-footer-social { justify-content: center; }
        }
        @media (max-width: 480px) {
          .lp-nav { padding: 0 14px; }
          .lp-h1 { font-size: 28px; letter-spacing: -1px; }
          .lp-eyebrow { font-size: 10px; }
          .lp-sub { font-size: 14px; line-height: 1.65; }
          .lp-pill { font-size: 11.5px; padding: 6px 11px; }
          .btn-cta-primary, .btn-cta-secondary { padding: 12px 20px; font-size: 14px; flex: 1; text-align: center; justify-content: center; }
          .lp-ctas { width: 100%; }
          .btn-nav-ghost { padding: 7px 10px; font-size: 12px; }
          .btn-nav-solid { padding: 7px 10px; font-size: 12px; }
          .lp-logo-text { font-size: 16px; }
          .lp-proof-text { font-size: 12px; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <Link href="/landing" className="lp-nav-logo">
            <div className="lp-logo-mark">
              <img src={logoUrl} alt="Playback" />
            </div>
            <span className="lp-logo-text">playback</span>
          </Link>

          <ul className="lp-nav-links">
            <li><Link href="/artists" style={{color:'inherit',textDecoration:'none'}}>Artists</Link></li>
            <li><Link href="/blog" style={{color:'inherit',textDecoration:'none'}}>Blog</Link></li>
          </ul>

          <div className="lp-nav-actions">
            <Link href="/signin" className="btn-nav-ghost">Sign in</Link>
            <Link href="/signup" className="btn-nav-solid">Get started</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-photo" />
          <div className="lp-hero-bg" />

          {/* Concentric rings */}
          <svg className="lp-rings" width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="270" cy="270" r="268" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            <circle cx="270" cy="270" r="210" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            <circle cx="270" cy="270" r="152" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            <circle cx="270" cy="270" r="96"  stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <circle cx="270" cy="270" r="44"  stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          </svg>

          {/* Left copy */}
          <div className="lp-hero-left">
            <div className="lp-eyebrow">
              <div className="lp-eyebrow-line"/>
              Malawi&apos;s music platform
            </div>

            <h1 className="lp-h1">
              Stream &amp; own<br />
              your <span className="lp-h1-accent">favourite</span><br />
              <span className="lp-h1-light">Malawian music</span>
            </h1>

            <p className="lp-sub">
              Buy, stream and discover the best of Malawi&apos;s artists —
              from Afropop to Gospel. Pay in MWK, download forever.
            </p>

            <div className="lp-pills">
              {/* Download */}
              <div className="lp-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Buy &amp; download
              </div>
              {/* Offline */}
              <div className="lp-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
                Offline listening
              </div>
              {/* MWK */}
              <div className="lp-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                MWK payments
              </div>
              {/* Artist payouts */}
              <div className="lp-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
                Artist payouts
              </div>
            </div>

            <div className="lp-ctas">
              <Link href="/signup" className="btn-cta-primary">Get started free</Link>
              <Link href="/signin" className="btn-cta-secondary">Sign in</Link>
            </div>

            {/* Social proof */}
            <div className="lp-proof">
              <div className="lp-proof-avatars">
                {/* Person 1 - warm brown skin */}
                <svg className="lp-proof-av" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#7c4a2a"/>
                  <circle cx="14" cy="11" r="5" fill="#5a3010"/>
                  <path d="M4 26c0-5.52 4.48-10 10-10s10 4.48 10 10" fill="#5a3010"/>
                </svg>
                {/* Person 2 - medium brown */}
                <svg className="lp-proof-av" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#3d6b4f"/>
                  <circle cx="14" cy="11" r="5" fill="#2a4a36"/>
                  <path d="M4 26c0-5.52 4.48-10 10-10s10 4.48 10 10" fill="#2a4a36"/>
                </svg>
                {/* Person 3 - deep brown */}
                <svg className="lp-proof-av" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#8b3a3a"/>
                  <circle cx="14" cy="11" r="5" fill="#5c2020"/>
                  <path d="M4 26c0-5.52 4.48-10 10-10s10 4.48 10 10" fill="#5c2020"/>
                </svg>
                {/* Person 4 - lighter brown */}
                <svg className="lp-proof-av" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#2b5e7e"/>
                  <circle cx="14" cy="11" r="5" fill="#1a3f57"/>
                  <path d="M4 26c0-5.52 4.48-10 10-10s10 4.48 10 10" fill="#1a3f57"/>
                </svg>
              </div>
              <p className="lp-proof-text">
                <strong>12,847</strong> Malawians listening today
              </p>
            </div>
          </div>

          {/* Floating cards */}
          <div className="lp-cards">
            {/* Now playing card */}
            <div className="glass-card card-now-playing">
              <div className="card-np-art">
                <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="npg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#065f46"/>
                      <stop offset="100%" stopColor="#022c22"/>
                    </linearGradient>
                  </defs>
                  <rect width="44" height="44" fill="url(#npg)"/>
                  <g stroke="#34d399" strokeWidth="1.2" opacity="0.55">
                    <line x1="22" y1="0" x2="6"  y2="44"/>
                    <line x1="22" y1="0" x2="22" y2="44"/>
                    <line x1="22" y1="0" x2="38" y2="44"/>
                    <line x1="22" y1="0" x2="0"  y2="32"/>
                    <line x1="22" y1="0" x2="44" y2="32"/>
                  </g>
                  <circle cx="22" cy="22" r="7" fill="rgba(52,211,153,0.2)"/>
                </svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div className="card-np-title">Wachita Bwino</div>
                <div className="card-np-artist">Black Missionaries</div>
                <div className="card-np-progress">
                  <div className="card-np-progress-fill"/>
                </div>
              </div>
              <div className="card-np-play">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#0D1B3E">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>

            {/* Stats card */}
            <div className="glass-card card-stats">
              <div className="card-stats-label">Listeners today</div>
              <div className="card-stats-num">12,847</div>
              <div className="card-stats-bars">
                {[38,55,42,70,48,85,62,95,75,100].map((h, i) => (
                  <div
                    key={i}
                    className="card-stats-bar"
                    style={{
                      height: `${h}%`,
                      opacity: i === 9 ? 1 : 0.4 + (i * 0.06),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER COLUMNS ── */}
        <div className="lp-footer-columns">
          <div>
            <span className="lp-logo-text" style={{ fontSize: '19px', display: 'inline-block', marginBottom: '14px' }}>
              playback
            </span>
            <p className="lp-footer-blurb">
              Discover. Share. Connect through music. Playback connects artists and listeners across Malawi and beyond.
            </p>
          </div>
          <div>
            <p className="lp-footer-col-title">Company</p>
            <ul className="lp-footer-col-links">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="lp-footer-col-title">For Artists</p>
            <ul className="lp-footer-col-links">
              <li><Link href="/for-artists/upload">Upload Music</Link></li>
              <li><Link href="/for-artists/verification">Artist Verification</Link></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-columns" style={{ paddingTop: 0, borderTop: 'none', gridTemplateColumns: '1fr' }}>
          <div>
            <p className="lp-footer-col-title">Explore</p>
            <ul className="lp-footer-col-links" style={{ flexDirection: 'row', gap: '28px', flexWrap: 'wrap' }}>
              <li><Link href="/songs">Songs</Link></li>
              <li><Link href="/artists">Artists</Link></li>
              <li><Link href="/charts">Charts</Link></li>
              <li><Link href="/songs">Genres</Link></li>
            </ul>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-bottom">
            <div>
              <span className="lp-footer-copy">© 2026 Playback</span>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', letterSpacing: '0.3px' }}>
                Powered by <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Rasta Kadema</span>
              </p>
            </div>
            <ul className="lp-footer-links">
              <li><Link href="/artists" style={{color:'inherit',textDecoration:'none'}}>Artists</Link></li>
              <li><Link href="/blog" style={{color:'inherit',textDecoration:'none'}}>Blog</Link></li>
              <li><Link href="/signin" style={{color:'inherit',textDecoration:'none'}}>Sign in</Link></li>
            </ul>
          </div>

          {/* TODO: replace remaining href="#" with real social URLs once provided by client */}
          <div className="lp-footer-social">
            <a href="https://www.facebook.com/MouseGotRich" className="lp-social-icon" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.83c0-2.51 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>
            </a>
            <a href="#" className="lp-social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://x.com/playbackcharts" className="lp-social-icon" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-7-6.2 7H1.5l8.1-9.3L1 2h7l4.9 6.4L18.9 2z"/></svg>
            </a>
            <a href="#" className="lp-social-icon" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82a4.28 4.28 0 01-2.94-1.07v9.93a5.78 5.78 0 11-5-5.74v3.05a2.74 2.74 0 102.74 2.74V0h3.03a4.28 4.28 0 004.28 4.28v3.04a4.28 4.28 0 01-2.11-1.5z"/></svg>
            </a>
            <a href="#" className="lp-social-icon" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2s-.23-1.64-.94-2.36c-.9-.95-1.91-.95-2.37-1C16.8 2.6 12 2.6 12 2.6h-.01s-4.8 0-8.18.24c-.46.05-1.47.05-2.37 1-.71.72-.94 2.36-.94 2.36S0 8.13 0 10.05v1.8c0 1.93.23 3.86.23 3.86s.23 1.64.94 2.36c.9.95 2.08.92 2.6 1.02 1.89.18 8.03.24 8.23.24 0 0 4.8 0 8.18-.25.46-.06 1.47-.06 2.37-1.01.71-.72.94-2.36.94-2.36s.23-1.93.23-3.86v-1.8c0-1.92-.23-3.85-.23-3.85zM9.55 14.6V7.84l6.27 3.39-6.27 3.38z"/></svg>
            </a>
            <a href="#" className="lp-social-icon" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.42 1.27 4.86L2.05 22l5.3-1.27a9.9 9.9 0 004.7 1.2h.01c5.5 0 9.96-4.46 9.96-9.96S17.55 2 12.05 2zm5.85 14.1c-.25.7-1.46 1.34-2 1.43-.52.08-1.18.12-1.9-.12-.44-.14-1-.32-1.72-.63-3.02-1.31-4.99-4.36-5.14-4.56-.15-.2-1.23-1.63-1.23-3.1s.77-2.2 1.04-2.5c.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.32.38-.45.51-.15.15-.31.31-.13.6.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.5 1.53.3.15.49.13.67-.05.18-.18.78-.9.99-1.21.2-.3.4-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.13.07.73-.18 1.43z"/></svg>
            </a>
          </div>
        </footer>

      </div>
    </>
  )
}

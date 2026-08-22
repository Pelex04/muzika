export const dynamic = 'force-static'

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        .m-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0a0505;
          color: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 48px 24px 32px;
          position: relative;
          overflow: hidden;
          animation: m-screen-shake 6s ease-in-out infinite;
        }
        @keyframes m-screen-shake {
          0%, 91%, 100% { transform: translate(0, 0); }
          92% { transform: translate(-2px, 1px); }
          93% { transform: translate(2px, -1px); }
          94% { transform: translate(-1px, 2px); }
          95% { transform: translate(1px, -2px); }
          96% { transform: translate(0, 0); }
        }

        .m-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .m-blob-1 {
          width: 620px; height: 620px;
          background: radial-gradient(circle, rgba(220,38,38,0.22) 0%, transparent 70%);
          top: -220px; left: -220px;
          animation: m-blob-pulse 5s ease-in-out infinite;
        }
        .m-blob-2 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(153,27,27,0.16) 0%, transparent 70%);
          bottom: -160px; right: -160px;
          animation: m-blob-pulse 5s ease-in-out infinite 1.2s;
        }
        @keyframes m-blob-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }

        .m-card {
          position: relative; z-index: 1;
          max-width: 480px; width: 100%;
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 0;
        }

        .m-footer {
          position: relative; z-index: 1;
          text-align: center;
          padding-top: 24px;
        }
        .m-footer-text {
          font-size: 12px; color: rgba(180,140,140,0.4); letter-spacing: 0.2px;
        }

        .m-logo {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 48px;
        }
        .m-logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px rgba(220,38,38,0.5);
          filter: grayscale(0.4);
        }
        .m-logo-mark img { width: 100%; height: 100%; object-fit: cover; }

        /* Dramatic 3D power-off centerpiece */
        .m-scene {
          perspective: 900px;
          width: 120px; height: 120px;
          margin: 0 auto 32px;
        }
        .m-icon-wrap {
          width: 100%; height: 100%; border-radius: 28px;
          background: linear-gradient(160deg, rgba(220,38,38,0.16), rgba(0,0,0,0.4));
          border: 1px solid rgba(220,38,38,0.35);
          display: flex; align-items: center; justify-content: center;
          transform-style: preserve-3d;
          animation: m-icon-3d 5s ease-in-out infinite, m-icon-jolt 5s linear infinite;
          box-shadow: 0 0 50px rgba(220,38,38,0.35), inset 0 0 30px rgba(220,38,38,0.08);
        }
        @keyframes m-icon-3d {
          0%, 100% { transform: rotateY(-18deg) rotateX(6deg); }
          50% { transform: rotateY(18deg) rotateX(-6deg); }
        }
        @keyframes m-icon-jolt {
          0%, 88%, 100% { filter: brightness(1) saturate(1); }
          89% { filter: brightness(2.2) saturate(1.6); }
          90% { filter: brightness(0.7) saturate(1); }
          91% { filter: brightness(1.8) saturate(1.8); }
        }
        .m-icon {
          width: 52px; height: 52px;
          animation: m-icon-pulse 2.2s ease-in-out infinite;
        }
        @keyframes m-icon-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        .m-eyebrow {
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: #f87171; margin-bottom: 14px;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .m-eyebrow-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
          animation: m-dot-blink 1.1s ease-in-out infinite;
        }
        @keyframes m-dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }

        .m-heading {
          font-size: clamp(30px, 7vw, 42px);
          font-weight: 900; letter-spacing: -0.9px; line-height: 1.1;
          margin-bottom: 16px; color: #fff;
        }
        .m-body {
          font-size: 15px; line-height: 1.75; color: #c4a3a3;
          max-width: 380px; margin: 0 auto 32px;
        }

        .m-contact-btn {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: #fff; font-weight: 800; font-size: 15px;
          padding: 15px 30px; border-radius: 100px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(220,38,38,0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          margin-bottom: 44px;
        }
        .m-contact-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 14px 36px rgba(220,38,38,0.5);
        }

        .m-social {
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .m-social-link {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(220,38,38,0.15);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; color: #8b6c6c;
          transition: all 0.2s ease;
        }
        .m-social-link:hover {
          background: rgba(220,38,38,0.14);
          border-color: rgba(220,38,38,0.4);
          color: #f87171;
        }

        @media (max-width: 480px) {
          .m-logo { margin-bottom: 36px; }
          .m-body { font-size: 14px; }
        }
      `}</style>

      <div className="m-root">
        <div className="m-blob m-blob-1" />
        <div className="m-blob m-blob-2" />

        <div className="m-card">
          <div className="m-logo">
            <div className="m-logo-mark"><img src="/logo.png" alt="Playback" /></div>
          </div>

          <div className="m-scene">
            <div className="m-icon-wrap">
              <svg className="m-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12.5" stroke="#ef4444" strokeWidth="2"/>
                <path d="M16 9v6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="16" cy="21.5" r="1.4" fill="#ef4444"/>
              </svg>
            </div>
          </div>

          <p className="m-eyebrow"><span className="m-eyebrow-dot" />Service Down</p>
          <h1 className="m-heading">Playback is down.</h1>
          <p className="m-body">
            Something's broken on our end. Please contact the developer directly so this can get fixed.
          </p>

          <a href="mailto:playbackcharts@gmail.com" className="m-contact-btn">
            Contact Developer
          </a>

          <div className="m-social">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="m-social-link" aria-label="X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="m-social-link" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="m-social-link" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="m-footer">
          <p className="m-footer-text">© {new Date().getFullYear()} Playback · All rights reserved</p>
        </div>
      </div>
    </>
  )
}

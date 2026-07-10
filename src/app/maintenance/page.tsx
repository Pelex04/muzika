export const dynamic = 'force-static'

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        .m-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #080f24;
          color: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 48px 24px 32px;
          position: relative;
          overflow: hidden;
        }

        .m-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .m-blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          top: -200px; left: -200px;
        }
        .m-blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          bottom: -150px; right: -150px;
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
          font-size: 12px; color: rgba(107,122,159,0.5); letter-spacing: 0.2px;
        }

        .m-logo {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 52px;
        }
        .m-logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px rgba(37,99,235,0.4);
        }
        .m-logo-mark img { width: 100%; height: 100%; object-fit: cover; }
        .m-logo-text {
          font-family: 'Outfit', 'Inter', system-ui, sans-serif;
          font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #fff;
        }
        .m-logo-text span { color: #2563eb; }

        .m-icon-wrap {
          width: 72px; height: 72px; border-radius: 20px; margin: 0 auto 28px;
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .m-icon {
          width: 32px; height: 32px;
          animation: m-pulse 3s ease-in-out infinite;
        }
        @keyframes m-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.92); }
        }

        .m-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #2563eb; margin-bottom: 14px;
        }
        .m-heading {
          font-size: clamp(28px, 6vw, 38px);
          font-weight: 900; letter-spacing: -0.8px; line-height: 1.15;
          margin-bottom: 16px; color: #fff;
        }
        .m-body {
          font-size: 15px; line-height: 1.75; color: #8b9cc8;
          max-width: 380px; margin: 0 auto 40px;
        }

        .m-progress-wrap {
          background: rgba(255,255,255,0.05);
          border-radius: 100px; height: 3px;
          overflow: hidden; margin-bottom: 40px;
        }
        .m-progress-bar {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          animation: m-progress 2.8s ease-in-out infinite;
        }
        @keyframes m-progress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }

        .m-status {
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 52px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 7px 16px;
        }
        .m-status-line {
          width: 16px; height: 1.5px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          border-radius: 2px;
          flex-shrink: 0;
        }
        .m-status-text { font-size: 12px; color: #6b7a9f; font-weight: 500; letter-spacing: 0.3px; }

        .m-social {
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .m-social-link {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; color: #6b7a9f;
          transition: all 0.2s ease;
        }
        .m-social-link:hover {
          background: rgba(37,99,235,0.12);
          border-color: rgba(37,99,235,0.3);
          color: #93b4fd;
        }

        @media (max-width: 480px) {
          .m-logo { margin-bottom: 40px; }
          .m-body { font-size: 14px; }
        }
      `}</style>

      <div className="m-root">
        <div className="m-blob m-blob-1" />
        <div className="m-blob m-blob-2" />

        <div className="m-card">
          <div className="m-logo">
            <div className="m-logo-mark"><img src="/logo.png" alt="Playback" /></div>
            <span className="m-logo-text">playback</span>
          </div>

          <div className="m-icon-wrap">
            <svg className="m-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="13" stroke="#2563eb" strokeWidth="1.5"/>
              <path d="M16 9v7l4 4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 3.5C5 5.2 3 7.8 2 10.8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
              <path d="M24.5 3.5C27 5.2 29 7.8 30 10.8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
            </svg>
          </div>

          <p className="m-eyebrow">Scheduled Maintenance</p>
          <h1 className="m-heading">We'll be back<br />shortly.</h1>
          <p className="m-body">
            We're making improvements to give you a better experience.
            Playback will be back online very soon — thank you for your patience.
          </p>

          <div className="m-progress-wrap">
            <div className="m-progress-bar" />
          </div>

          <div className="m-status">
            <div className="m-status-line" />
            <span className="m-status-text">Systems are being updated</span>
          </div>

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
          <p style={{ fontSize: '11px', color: 'rgba(107,122,159,0.35)', marginTop: '5px', letterSpacing: '0.3px' }}>
            Powered by <span style={{ color: 'rgba(107,122,159,0.55)', fontWeight: 600 }}>Rasta Kadema</span>
          </p>
        </div>
      </div>
    </>
  )
}

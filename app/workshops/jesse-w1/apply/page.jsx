import Link from 'next/link';
import WorkshopSignupForm from '@/components/WorkshopSignupForm';

export const metadata = {
  title: 'Reserve a seat — Jesse Horwitz Founder Workshop',
  description:
    'Apply for a free seat at the Igloo Media × Dollar Commerce founder workshop with Jesse Horwitz.',
  alternates: { canonical: '/workshops/jesse-w1/apply' },
  robots: { index: false, follow: false },
};

export default function ApplyPage() {
  return (
    <main className="iga-root" data-dc="fullscreen">
      <header className="iga-nav">
        <div className="iga-nav-inner">
          <Link href="/workshops/jesse-w1" className="iga-back" aria-label="Back to workshop">
            <span aria-hidden>←</span> Back
          </Link>
          <div className="iga-brandline">
            <span className="iga-logo-mark" aria-hidden>
              <svg viewBox="0 0 64 36" width="32" height="18" fill="none">
                <path d="M4 34 A28 28 0 0 1 60 34" stroke="#1AA3F0" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M16 34 A16 16 0 0 1 48 34 Z" fill="#1AA3F0" />
              </svg>
            </span>
            <span className="iga-brand">Igloo Media</span>
          </div>
        </div>
      </header>

      <section className="iga-hero">
        <div className="iga-hero-inner">
          <span className="iga-pill">
            <span className="iga-pill-dot" /> Workshop with Jesse Horwitz
          </span>
          <h1 className="iga-h1">Reserve your seat.</h1>
          <p className="iga-lede">
            A small cohort of DTC founders. Tell us who you are and what you&apos;re
            building &mdash; we&apos;ll send a Zoom link to selected applicants.
          </p>
        </div>
      </section>

      <section className="iga-form-wrap">
        <WorkshopSignupForm workshopId="jesse-w1" />
      </section>

      <footer className="iga-footer">
        <div className="iga-footer-inner">
          <div>
            <span className="iga-brand">Igloo Media</span>
            <span className="iga-footer-sep">·</span>
            <span className="iga-footer-meta">in partnership with Dollar Commerce</span>
          </div>
          <div className="iga-footer-meta">
            © {new Date().getFullYear()} Igloo Media
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .iga-root {
          background: #FFFFFF;
          color: #0A0A0A;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          display: flex;
          flex-direction: column;
        }

        .iga-nav {
          border-bottom: 1px solid #E6ECF1;
          background: #FFFFFF;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .iga-nav-inner {
          max-width: 720px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .iga-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4A5560;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color .15s ease;
        }
        .iga-back:hover { color: #0A0A0A; }
        .iga-brandline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .iga-brand {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #0A0A0A;
        }

        .iga-hero {
          padding: 56px 24px 28px;
        }
        .iga-hero-inner {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .iga-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          background: #DCEFFB;
          color: #0E7FBF;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 22px;
        }
        .iga-pill-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #1AA3F0;
        }
        .iga-root h1.iga-h1 {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: clamp(36px, 5vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          font-weight: 700;
          margin: 0 0 16px;
          color: #0A0A0A;
        }
        .iga-lede {
          font-size: 17px;
          line-height: 1.6;
          color: #4A5560;
          margin: 0 auto;
          max-width: 540px;
        }

        .iga-form-wrap {
          padding: 32px 24px 80px;
          flex: 1;
        }

        .iga-footer {
          border-top: 1px solid #E6ECF1;
          padding: 22px 24px;
          background: #F7FAFC;
        }
        .iga-footer-inner {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #4A5560;
        }
        .iga-footer-meta { color: #8A95A0; }
        .iga-footer-sep { color: #B0B8C2; margin: 0 8px; }

        @media (max-width: 720px) {
          .iga-nav-inner { padding: 12px 18px; }
          .iga-hero { padding: 36px 18px 22px; }
          .iga-root h1.iga-h1 {
            font-size: 34px !important;
            line-height: 1.1 !important;
            text-align: center !important;
          }
          .iga-lede { font-size: 15px; }
          .iga-form-wrap { padding: 22px 18px 60px; }
          .iga-footer { padding: 18px; }
          .iga-footer-inner { flex-direction: column; align-items: flex-start; gap: 6px; }
        }
      ` }} />
    </main>
  );
}

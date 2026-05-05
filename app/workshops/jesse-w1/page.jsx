import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Building & Selling DTC — A Founder Workshop with Jesse Horwitz',
  description:
    'A free 90-minute Zoom workshop for DTC founders. Hosted by Andrew Watson and Alex Knight, with guest Jesse Horwitz (Hubble Contacts). E-commerce, venture capital, team building, and lessons learned. Co-sponsored by Igloo Media and Dollar Commerce.',
  alternates: { canonical: '/workshops/jesse-w1' },
  openGraph: {
    title: 'Founder Workshop with Jesse Horwitz',
    description:
      'Free 90-minute Zoom workshop for DTC founders. Hosted by Igloo Media and Dollar Commerce.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="ig-root" data-dc="fullscreen">
      {/* Top nav */}
      <header className="ig-nav">
        <div className="ig-nav-inner">
          <div className="ig-brandline">
            <span className="ig-logo-mark" aria-hidden>
              {/* Igloo arch mark — drop /igloo-logo.svg into /public to swap */}
              <svg viewBox="0 0 64 36" width="40" height="22" fill="none">
                <path
                  d="M4 34 A28 28 0 0 1 60 34"
                  stroke="#1AA3F0"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M16 34 A16 16 0 0 1 48 34 Z"
                  fill="#1AA3F0"
                />
              </svg>
            </span>
            <span className="ig-brand">Igloo Media</span>
            <span className="ig-brand-divider" />
            <span className="ig-brand-meta">in partnership with Dollar Commerce</span>
          </div>
          <nav className="ig-nav-links">
            <a href="#about">About</a>
            <a href="#agenda">Agenda</a>
            <Link href="/workshops/jesse-w1/apply" className="ig-nav-cta">Reserve seat</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="ig-hero">
        <div className="ig-hero-grid">
          <div className="ig-hero-copy">
            <span className="ig-pill">
              <span className="ig-pill-dot" /> Live workshop · Free for founders
            </span>

            <h1 className="ig-h1">
              Building &amp; selling
              <br />
              <em>DTC, honestly.</em>
            </h1>

            <p className="ig-lede">
              A 90-minute Zoom session with <strong>Jesse Horwitz</strong>, co-founder of
              Hubble Contacts, on what it actually takes to build, scale, raise, and exit a
              direct-to-consumer brand. Hosted by Andrew Watson and Alex Knight.
            </p>

            <div className="ig-meta">
              <div className="ig-meta-item">
                <div className="ig-meta-label">Format</div>
                <div className="ig-meta-value">Zoom · 60 min talk + 30 min Q&amp;A</div>
              </div>
              <div className="ig-meta-item">
                <div className="ig-meta-label">Cohort</div>
                <div className="ig-meta-value">Vetted DTC founders</div>
              </div>
              <div className="ig-meta-item">
                <div className="ig-meta-label">Cost</div>
                <div className="ig-meta-value">Free · Application required</div>
              </div>
              <div className="ig-meta-item">
                <div className="ig-meta-label">Recording</div>
                <div className="ig-meta-value">Sent to attendees only</div>
              </div>
            </div>

            <div className="ig-cohost-row">
              <div className="ig-cohost-label">Co-sponsored by</div>
              <div className="ig-cohost-brands">
                <span className="ig-cohost-igloo">Igloo Media</span>
                <span className="ig-cohost-x">×</span>
                <span className="ig-cohost-dc">Dollar Commerce</span>
              </div>
            </div>
          </div>

          {/* Featured guest card */}
          <aside className="ig-guest-card">
            <div className="ig-guest-head">
              <span className="ig-guest-pill">
                <span className="ig-pill-dot" /> Featured guest
              </span>
            </div>

            <div className="ig-guest-photo">
              <Image
                src="/writers/jesse-horwitz.png"
                alt="Jesse Horwitz"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 480px"
                style={{ objectFit: 'cover' }}
              />
              <div className="ig-guest-photo-fade" />
              <div className="ig-guest-photo-tag">Co-founder · Hubble Contacts</div>
            </div>

            <div className="ig-guest-body">
              <div className="ig-guest-name">Jesse Horwitz</div>
              <p className="ig-guest-bio">
                Built and sold one of the largest contact lens brands of the DTC era. Now
                an active investor and operator across consumer, commerce, and emerging
                tech.
              </p>
            </div>

            <div className="ig-topics">
              <div className="ig-topics-label">Topics</div>
              <ul className="ig-topics-list">
                <li>Building a category-leading e-commerce brand</li>
                <li>Raising venture capital (and when not to)</li>
                <li>Sourcing and structuring the right team</li>
                <li>Lessons learned, including the ones that cost</li>
                <li>30-minute live Q&amp;A with founders</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Hosts — light mention */}
      <section className="ig-hosts-strip" id="about">
        <div className="ig-hosts-inner">
          <div className="ig-eyebrow">Hosted by</div>
          <p className="ig-hosts-line">
            <span>Andrew Watson</span>
            <span className="ig-hosts-sep">·</span>
            <span>Alex Knight</span>
            <span className="ig-hosts-sep">·</span>
            <span>Ben Cogan</span>
          </p>
        </div>
      </section>

      {/* Agenda — subtle */}
      <section className="ig-agenda-soft" id="agenda">
        <div className="ig-agenda-soft-inner">
          <div className="ig-eyebrow">What we&apos;ll cover</div>
          <p className="ig-agenda-copy">
            Ninety minutes, loosely structured. Jesse opens with what it actually
            took to build, finance, and exit Hubble, with honest detours into team,
            capital, and the things he&apos;d do differently. The back half is a live
            Q&amp;A &mdash; founders only, bring the questions you actually need
            answered.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="ig-cta-section" id="signup">
        <div className="ig-cta-inner">
          <h2 className="ig-h2">Founders only. Small cohort.</h2>
          <p className="ig-section-lede">
            We keep the room tight so the Q&amp;A is useful. Apply in under a minute &mdash;
            we&apos;ll send a Zoom link to selected founders.
          </p>
          <Link href="/workshops/jesse-w1/apply" className="ig-cta-btn">
            Reserve your seat
            <span aria-hidden>→</span>
          </Link>
          <div className="ig-cta-fineprint">Free · Application required · Recording for attendees only</div>
        </div>
      </section>

      <footer className="ig-footer">
        <div className="ig-footer-inner">
          <div className="ig-footer-brand">
            <span className="ig-logo-mark" aria-hidden>
              <svg viewBox="0 0 64 36" width="32" height="18" fill="none">
                <path d="M4 34 A28 28 0 0 1 60 34" stroke="#1AA3F0" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M16 34 A16 16 0 0 1 48 34 Z" fill="#1AA3F0" />
              </svg>
            </span>
            <span className="ig-brand">Igloo Media</span>
          </div>
          <div className="ig-footer-meta">
            © {new Date().getFullYear()} Igloo Media · A workshop series, in partnership
            with Dollar Commerce.
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --ig-bg: #FFFFFF;
          --ig-bg-alt: #F7FAFC;
          --ig-bg-tint: #EFF7FD;
          --ig-surface: #FFFFFF;
          --ig-border: #E6ECF1;
          --ig-border-strong: #D0DAE3;
          --ig-text: #0A0A0A;
          --ig-text-soft: #4A5560;
          --ig-text-mute: #8A95A0;
          --ig-blue: #1AA3F0;
          --ig-blue-dark: #0E7FBF;
          --ig-blue-tint: #DCEFFB;
          --ig-cta: #1AA3F0;
          --ig-cta-hover: #0E8AD1;
          --ig-cta-text: #FFFFFF;
          --ig-serif: 'Georgia', 'Times New Roman', serif;
          --ig-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
        }

        .ig-root {
          background: var(--ig-bg);
          color: var(--ig-text);
          font-family: var(--ig-sans);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .ig-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--ig-border);
        }
        .ig-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .ig-brandline {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ig-logo-mark {
          display: inline-flex;
          align-items: center;
        }
        .ig-brand {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--ig-text);
        }
        .ig-brand-divider {
          width: 1px; height: 16px; background: var(--ig-border-strong);
          margin: 0 4px;
        }
        .ig-brand-meta {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ig-text-mute);
          font-weight: 600;
        }
        .ig-nav-links {
          display: flex;
          align-items: center;
          gap: 26px;
          font-size: 14px;
        }
        .ig-nav-links a {
          color: var(--ig-text-soft);
          text-decoration: none;
          font-weight: 500;
        }
        .ig-nav-links a:hover { color: var(--ig-text); }
        .ig-nav-cta {
          padding: 9px 18px;
          background: var(--ig-cta);
          color: var(--ig-cta-text) !important;
          border-radius: 999px;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.01em;
          transition: background .15s ease;
        }
        .ig-nav-cta:hover { background: var(--ig-cta-hover); color: var(--ig-cta-text) !important; }

        .ig-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 28px 60px;
        }
        .ig-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 72px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .ig-hero-grid { grid-template-columns: 1fr; gap: 48px; }
        }

        .ig-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          background: var(--ig-blue-tint);
          color: var(--ig-blue-dark);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .ig-pill-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--ig-blue);
        }

        .ig-h1 {
          font-family: var(--ig-serif);
          font-size: clamp(48px, 6vw, 84px);
          line-height: 1.02;
          letter-spacing: -0.025em;
          margin: 22px 0 22px;
          font-weight: 700;
          color: var(--ig-text);
        }
        .ig-h1 em {
          font-style: italic;
          color: var(--ig-blue);
        }

        .ig-lede {
          font-size: 18px;
          line-height: 1.6;
          color: var(--ig-text-soft);
          max-width: 520px;
          margin: 0 0 36px;
        }
        .ig-lede strong { color: var(--ig-text); font-weight: 700; }

        .ig-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 32px;
          max-width: 520px;
        }
        .ig-meta-item {
          background: var(--ig-bg-alt);
          border: 1px solid var(--ig-border);
          border-radius: 12px;
          padding: 14px 16px;
        }
        .ig-meta-label {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ig-text-mute);
          margin-bottom: 4px;
          font-weight: 600;
        }
        .ig-meta-value {
          font-size: 14px;
          color: var(--ig-text);
          font-weight: 500;
        }

        .ig-cohost-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 24px;
          border-top: 1px solid var(--ig-border);
        }
        .ig-cohost-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ig-text-mute);
          font-weight: 600;
        }
        .ig-cohost-brands {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ig-cohost-igloo, .ig-cohost-dc {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .ig-cohost-igloo { color: var(--ig-blue); }
        .ig-cohost-dc { color: var(--ig-text); }
        .ig-cohost-x { color: var(--ig-text-mute); font-size: 14px; }

        .ig-guest-card {
          background: var(--ig-surface);
          border: 1px solid var(--ig-border);
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 24px 60px rgba(15, 27, 40, 0.08), 0 2px 6px rgba(15, 27, 40, 0.04);
        }
        .ig-guest-head {
          margin-bottom: 16px;
        }
        .ig-guest-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          background: var(--ig-blue-tint);
          color: var(--ig-blue-dark);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .ig-guest-photo {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          border-radius: 14px;
          overflow: hidden;
          background: var(--ig-bg-alt);
          margin-bottom: 18px;
        }
        .ig-guest-photo-fade {
          position: absolute;
          inset: auto 0 0 0;
          height: 45%;
          background: linear-gradient(180deg, transparent, rgba(0,0,0,0.7));
          pointer-events: none;
        }
        .ig-guest-photo-tag {
          position: absolute;
          left: 16px;
          bottom: 16px;
          color: #FFFFFF;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .ig-guest-body { padding: 0 4px 4px; }
        .ig-guest-name {
          font-family: var(--ig-serif);
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: var(--ig-text);
          margin-bottom: 8px;
        }
        .ig-guest-bio {
          color: var(--ig-text-soft);
          font-size: 14px;
          line-height: 1.55;
          margin: 0 0 22px;
        }
        .ig-topics {
          background: var(--ig-bg-alt);
          border: 1px solid var(--ig-border);
          border-radius: 14px;
          padding: 16px 18px;
        }
        .ig-topics-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ig-text-mute);
          margin-bottom: 10px;
          font-weight: 600;
        }
        .ig-topics-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ig-topics-list li {
          font-size: 14px;
          color: var(--ig-text);
          padding-left: 16px;
          position: relative;
        }
        .ig-topics-list li::before {
          content: '';
          position: absolute;
          left: 0; top: 7px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--ig-blue);
        }

        .ig-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 28px;
        }
        .ig-section--alt {
          background: var(--ig-bg-alt);
          max-width: none;
          padding-left: 0;
          padding-right: 0;
          border-top: 1px solid var(--ig-border);
          border-bottom: 1px solid var(--ig-border);
        }
        .ig-section--alt .ig-section-head,
        .ig-section--alt .ig-agenda {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
        }
        .ig-section-head { margin-bottom: 40px; max-width: 720px; }
        .ig-eyebrow {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ig-blue);
          font-weight: 700;
          margin-bottom: 12px;
        }
        .ig-h2 {
          font-family: var(--ig-serif);
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 14px;
          font-weight: 700;
          color: var(--ig-text);
        }
        .ig-section-lede {
          font-size: 17px;
          line-height: 1.6;
          color: var(--ig-text-soft);
          margin: 0;
        }

        .ig-hosts-strip {
          border-top: 1px solid var(--ig-border);
          border-bottom: 1px solid var(--ig-border);
          background: var(--ig-bg);
        }
        .ig-hosts-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .ig-hosts-inner .ig-eyebrow {
          margin-bottom: 0;
        }
        .ig-hosts-line {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--ig-text);
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }
        .ig-hosts-sep {
          color: var(--ig-text-mute);
          font-weight: 400;
        }

        .ig-agenda-soft {
          background: var(--ig-bg-alt);
          border-bottom: 1px solid var(--ig-border);
        }
        .ig-agenda-soft-inner {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 28px;
        }
        .ig-agenda-copy {
          margin: 14px 0 0;
          font-size: 18px;
          line-height: 1.65;
          color: var(--ig-text-soft);
          font-family: var(--ig-serif);
        }

        .ig-cta-section {
          background: var(--ig-bg);
          padding: 80px 28px 100px;
        }
        .ig-cta-inner {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .ig-cta-section .ig-h2 {
          margin-bottom: 14px;
        }
        .ig-cta-section .ig-section-lede {
          margin: 0 auto 28px;
          max-width: 540px;
        }
        .ig-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          background: var(--ig-cta);
          color: var(--ig-cta-text);
          border-radius: 999px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(26, 163, 240, 0.30);
          transition: background .15s ease, transform .15s ease, box-shadow .15s ease;
        }
        .ig-cta-btn:hover {
          background: var(--ig-cta-hover);
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(26, 163, 240, 0.38);
        }
        .ig-cta-fineprint {
          margin-top: 16px;
          font-size: 12px;
          color: var(--ig-text-mute);
          letter-spacing: 0.04em;
        }

        .ig-footer {
          border-top: 1px solid var(--ig-border);
          padding: 28px;
          background: var(--ig-bg);
        }
        .ig-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ig-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ig-footer-meta {
          font-size: 12px;
          color: var(--ig-text-mute);
        }

        /* ---- Mobile ----
           Site-wide globals.css forces h1/h2 to small sizes on phones with
           !important. The .ig-root scope and !important flags below opt this
           page out of those defaults. */
        @media (max-width: 720px) {
          .ig-root .ig-nav-inner {
            padding: 12px 18px;
            gap: 12px;
          }
          .ig-root .ig-brand-divider, .ig-root .ig-brand-meta { display: none; }
          .ig-root .ig-brand { font-size: 16px; }
          .ig-root .ig-nav-links { gap: 14px; font-size: 13px; }
          .ig-root .ig-nav-links a:not(.ig-nav-cta) { display: none; }
          .ig-root .ig-nav-cta { padding: 8px 14px; font-size: 12px; }

          .ig-root .ig-hero { padding: 44px 18px 36px; }
          .ig-root .ig-hero-grid { gap: 36px; }

          .ig-root h1.ig-h1 {
            font-size: 44px !important;
            line-height: 1.04 !important;
            margin: 18px 0 18px !important;
            text-align: left !important;
          }
          .ig-root .ig-lede { font-size: 16px; margin-bottom: 28px; }

          .ig-root .ig-meta { grid-template-columns: 1fr 1fr; gap: 10px; }
          .ig-root .ig-meta-item { padding: 12px 14px; }
          .ig-root .ig-meta-label { font-size: 10px; }
          .ig-root .ig-meta-value { font-size: 13px; }

          .ig-root .ig-cohost-row { padding-top: 20px; }
          .ig-root .ig-cohost-igloo, .ig-root .ig-cohost-dc { font-size: 18px; }

          .ig-root .ig-guest-card { padding: 18px; border-radius: 18px; }
          .ig-root .ig-guest-name { font-size: 26px; }
          .ig-root .ig-guest-bio { font-size: 13.5px; }
          .ig-root .ig-topics { padding: 14px 16px; }
          .ig-root .ig-topics-list li { font-size: 13.5px; }

          .ig-root .ig-section { padding: 56px 18px; }
          .ig-root .ig-section-head { margin-bottom: 28px; }

          .ig-root h2.ig-h2 {
            font-size: 30px !important;
            line-height: 1.15 !important;
            text-align: left !important;
          }
          .ig-root .ig-section-lede { font-size: 15px; }

          .ig-root .ig-hosts-inner { padding: 18px; gap: 10px; }
          .ig-root .ig-hosts-line { font-size: 14px; gap: 6px; }

          .ig-root .ig-agenda-soft-inner { padding: 44px 18px; }
          .ig-root .ig-agenda-copy { font-size: 16px; line-height: 1.6; }

          .ig-root .ig-cta-section { padding: 56px 18px 72px; }
          .ig-root .ig-cta-section h2.ig-h2 { text-align: center !important; }
          .ig-root .ig-cta-btn { width: 100%; justify-content: center; padding: 16px 24px; }

          .ig-root .ig-footer { padding: 22px 18px; }
          .ig-root .ig-footer-inner { flex-direction: column; align-items: flex-start; gap: 10px; }
          .ig-root .ig-footer-meta { font-size: 11.5px; line-height: 1.5; }
        }

        @media (max-width: 380px) {
          .ig-root h1.ig-h1 { font-size: 38px !important; }
          .ig-root .ig-meta { grid-template-columns: 1fr; }
        }
      ` }} />
    </main>
  );
}

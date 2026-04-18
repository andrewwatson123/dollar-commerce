import Link from 'next/link';

const SERIF = "Georgia, 'Times New Roman', serif";

export default function SiteFooter() {
  return (
    <footer data-dc="site-footer" style={{
      background: '#0F172A',
      color: '#fff',
      marginTop: 80,
    }}>
      <div data-dc="footer-grid" style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '48px 40px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 40,
        fontSize: 14,
      }}>
        <div>
          <h4 style={headingStyle}>Sections</h4>
          <FooterLink href="/category/e-commerce">E-Commerce</FooterLink>
          <FooterLink href="/category/platforms">Platforms</FooterLink>
          <FooterLink href="/category/features">Features</FooterLink>
          <FooterLink href="/category/opinion">Opinion</FooterLink>
          <FooterLink href="/top-articles">Top Articles</FooterLink>
        </div>
        <div>
          <h4 style={headingStyle}>Market</h4>
          <FooterLink href="/fundraising-tracker">Fundraising Tracker</FooterLink>
          <FooterLink href="/dc-index">DC Index</FooterLink>
          <FooterLink href="/platform-tracker">Platform Tracker</FooterLink>
          <FooterLink href="/events">Events</FooterLink>
          <FooterDisabled>Brand Leaderboard</FooterDisabled>
        </div>
        <div>
          <h4 style={headingStyle}>Support</h4>
          <FooterLink href="/profile">Help Center</FooterLink>
          <FooterLink href="/profile">Contact</FooterLink>
        </div>
        <div>
          <h4 style={headingStyle}>Follow</h4>
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <SocialIcon href="https://x.com/dollarcommerce" label="X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/andrew-watson-91b25b252/" label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </SocialIcon>
            <SocialIcon href="https://www.instagram.com/thedollarcommerce/" label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </SocialIcon>
          </div>
        </div>
      </div>

      {/* Logo + copyright */}
      <div data-dc="footer-bottom" style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '24px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Dollar Commerce. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

const headingStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  color: 'rgba(255,255,255,0.5)',
  margin: '0 0 16px',
};

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '6px 0',
        color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontSize: 14,
      }}
    >
      {children}
    </Link>
  );
}

function FooterDisabled({ children }) {
  return (
    <span style={{
      display: 'block',
      padding: '6px 0',
      color: 'rgba(255,255,255,0.25)',
      fontSize: 14,
    }}>
      {children}
    </span>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}

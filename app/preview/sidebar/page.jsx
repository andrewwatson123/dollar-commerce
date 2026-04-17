/**
 * Preview: Desktop sidebar nav — always open on desktop, collapses to burger on mobile.
 * Navigate to /preview/sidebar to see it.
 */

'use client';

import { useState } from 'react';
import { Menu, X, Search, User, ChevronDown, ChevronUp } from 'lucide-react';

const SERIF = "Georgia, 'Times New Roman', serif";

export default function SidebarPreview() {
  const [expanded, setExpanded] = useState('E-Commerce');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        background: '#0F172A', color: '#fff', padding: '8px 0',
        borderBottom: '2px solid #D2042D', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: SERIF, fontSize: 11, color: '#F59E0B' }}>
              dc<span style={{ color: '#D2042D', margin: '0 1px' }}>·</span><span style={{ fontWeight: 700 }}>index</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 800 }}>114.36</span>
            <span style={{ fontSize: 11, color: '#10b981' }}>+0.81%</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Amazon's fuel surcharge: Cost recovery or margin play?</span>
        </div>
      </div>

      {/* Layout: sidebar + main */}
      <div style={{ display: 'flex', paddingTop: 42 }}>
        {/* ===== SIDEBAR — visible on desktop, hidden on mobile ===== */}
        <aside
          className="dc-sidebar"
          style={{
            width: 260,
            minHeight: 'calc(100vh - 42px)',
            background: '#F4F1EA',
            borderRight: '1px solid #E0E0E0',
            padding: '24px 20px',
            position: 'sticky',
            top: 42,
            height: 'calc(100vh - 42px)',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 32 }}>
            <span style={{ fontWeight: 400, color: '#0F172A' }}>dollar</span>
            <span style={{ color: '#D2042D', margin: '0 2px', fontSize: '110%' }}>·</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>commerce</span>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setExpanded(expanded === 'E-Commerce' ? null : 'E-Commerce')}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0',
                borderBottom: '1px solid #E0E0E0',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>E-Commerce</span>
              {expanded === 'E-Commerce' ? <ChevronUp size={16} color="#D2042D" /> : <ChevronDown size={16} color="#D2042D" />}
            </button>

            {expanded === 'E-Commerce' && (
              <div style={{ paddingLeft: 12, paddingTop: 12 }}>
                <NavGroup label="Articles">
                  <NavItem>Most Recent</NavItem>
                  <NavItem>Top Articles</NavItem>
                  <NavItem>Features</NavItem>
                  <NavItem>Opinion</NavItem>
                  <NavItem>Platforms</NavItem>
                  <NavItem>E-Commerce</NavItem>
                </NavGroup>
                <NavGroup label="Market">
                  <NavItem live>Fundraising Tracker</NavItem>
                  <NavItem live>DC Index</NavItem>
                  <NavItem live>Platform Tracker</NavItem>
                  <NavItem soon>Brand Leaderboard</NavItem>
                  <NavItem soon>Events</NavItem>
                </NavGroup>
              </div>
            )}
          </div>

          {/* Writers */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Writers
            </div>
            <NavItem>Andrew Watson</NavItem>
            <NavItem>Benjamin Cogan</NavItem>
          </div>

          {/* Profile */}
          <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 16 }}>
            <NavItem icon={<User size={14} />}>Profile</NavItem>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Header bar — no burger on desktop, just search + profile */}
          <header style={{
            background: '#F4F1EA', borderBottom: '1px solid #E0E0E0',
            position: 'sticky', top: 42, zIndex: 100,
            padding: '16px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Mobile burger — hidden on desktop via CSS */}
            <button
              className="dc-mobile-burger"
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }}
            >
              <Menu size={22} color="#0F172A" />
            </button>

            {/* Logo — only shown on mobile when sidebar is hidden */}
            <div className="dc-mobile-logo" style={{ display: 'none', fontFamily: SERIF, fontSize: 20 }}>
              <span style={{ fontWeight: 400, color: '#0F172A' }}>dollar</span>
              <span style={{ color: '#D2042D', margin: '0 2px', fontSize: '110%' }}>·</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>commerce</span>
            </div>

            {/* Spacer for desktop (logo is in sidebar) */}
            <div className="dc-desktop-spacer" />

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                <Search size={20} color="#0F172A" />
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                <User size={20} color="#0F172A" />
              </button>
            </div>
          </header>

          {/* Demo content */}
          <div style={{ padding: '32px 32px 80px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#D2042D', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              e-commerce
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: '#0F172A', margin: '0 0 12px', lineHeight: 1.2 }}>
              Amazon's fuel surcharge: Cost recovery or margin play?
            </h1>
            <p style={{ fontSize: 15, color: '#666', margin: '0 0 16px', lineHeight: 1.6 }}>
              Just as Meta's rolling out invoicing instead of credit card payments for larger advertisers, Amazon has stepped in with a 3.5% logistics surcharge on all US and Canadian FBA sellers starting April 17th.
            </p>
            <div style={{ fontSize: 13, color: '#666' }}>
              Andrew Watson <span style={{ color: '#D2042D' }}>·</span> 6d ago
            </div>

            <div style={{ height: 300, background: '#eee', borderRadius: 8, marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>
              Hero image area
            </div>

            <div style={{ marginTop: 32 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid #E0E0E0' }}>
                  <div style={{ height: 12, background: '#e5e5e5', borderRadius: 4, width: `${70 + i * 5}%`, marginBottom: 8 }} />
                  <div style={{ height: 12, background: '#e5e5e5', borderRadius: 4, width: `${50 + i * 8}%`, marginBottom: 8 }} />
                  <div style={{ height: 12, background: '#efefef', borderRadius: 4, width: '30%' }} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay — only visible when mobileOpen */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'none' }} className="dc-mobile-overlay-show">
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
            background: '#F4F1EA', padding: '24px 20px', overflowY: 'auto',
          }}>
            <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 24 }}>
              <span style={{ fontWeight: 400 }}>dollar</span>
              <span style={{ color: '#D2042D', margin: '0 2px' }}>·</span>
              <span style={{ fontWeight: 700 }}>commerce</span>
            </div>
            <p style={{ fontSize: 13, color: '#666' }}>Same nav as sidebar — shown as overlay on mobile.</p>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        /* Desktop: sidebar visible, burger hidden */
        @media (min-width: 900px) {
          .dc-sidebar { display: block !important; }
          .dc-mobile-burger { display: none !important; }
          .dc-mobile-logo { display: none !important; }
          .dc-mobile-overlay-show { display: none !important; }
        }

        /* Mobile: sidebar hidden, burger visible */
        @media (max-width: 899px) {
          .dc-sidebar { display: none !important; }
          .dc-mobile-burger { display: block !important; }
          .dc-mobile-logo { display: block !important; }
          .dc-desktop-spacer { display: none !important; }
          .dc-mobile-overlay-show { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function NavGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function NavItem({ children, live, soon, icon }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 6, width: '100%',
      padding: '7px 0', fontSize: 13, fontWeight: 500,
      color: soon ? '#cbd5e1' : '#555',
      background: 'none', border: 'none', cursor: soon ? 'default' : 'pointer',
      textAlign: 'left',
    }}>
      {icon || <span style={{ color: '#D2042D', fontSize: 10 }}>→</span>}
      {children}
      {live && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', marginLeft: 2 }} />}
      {soon && <span style={{ fontSize: 9, color: '#cbd5e1', marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>Soon</span>}
    </button>
  );
}

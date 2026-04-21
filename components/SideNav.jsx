'use client';

/**
 * Persistent sidebar navigation for desktop.
 * On screens wider than 1024px this is always visible.
 * On narrower screens it's hidden — the burger drawer takes over.
 *
 * Shares the same link structure as BurgerDrawer so they stay in sync.
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, ChevronUp, User, LogIn } from 'lucide-react';

const ARTICLE_LINKS = [
  { label: 'Most Recent', href: '/' },
  { label: 'Top Articles', href: '/top-articles' },
  { label: 'Features',    href: '/category/features' },
  { label: 'Opinion',     href: '/category/opinion' },
  { label: 'Platforms',   href: '/category/platforms' },
  { label: 'E-Commerce',  href: '/category/e-commerce' },
];

const MARKET_LINKS = [
  { light: 'Fundraising', bold: 'Tracker', href: '/fundraising-tracker', live: true },
  { light: 'DC',           bold: 'Index',   href: '/dc-index', live: true },
  { light: 'Platform',     bold: 'Tracker', href: '/platform-tracker', live: true },
  { light: 'Brand',        bold: 'Leaderboard', href: '#', live: false },
  { light: '',             bold: 'Events',  href: '/events', live: true },
];

const WRITERS = [
  { name: 'Andrew Watson',  slug: 'andrew-watson' },
  { name: 'Benjamin Cogan', slug: 'benjamin-cogan' },
];

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedCategory, setExpandedCategory] = useState('E-Commerce');
  const [logoCenter, setLogoCenter] = useState(0);

  useEffect(() => {
    const measure = () => {
      const title = document.querySelector('[data-dc="site-title"]');
      if (title) {
        const rect = title.getBoundingClientRect();
        setLogoCenter((rect.top + rect.bottom) / 2);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 200);
    return () => { window.removeEventListener('resize', measure); clearTimeout(t); };
  }, []);

  const go = (href) => router.push(href);
  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      data-dc="side-nav"
      style={{
        width: 260,
        minWidth: 260,
        background: '#F4F1EA',
        borderRight: '1px solid #E0E0E0',
        overflowY: 'auto',
        padding: `${Math.max(logoCenter - 8, 0)}px 20px 24px`,
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Categories heading */}
      <h3
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#D2042D',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          margin: '0 0 8px',
          paddingLeft: 4,
        }}
      >
        Categories
      </h3>

      {/* Expandable E-Commerce */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() =>
            setExpandedCategory(expandedCategory === 'E-Commerce' ? null : 'E-Commerce')
          }
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 4px',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>E-Commerce</span>
          {expandedCategory === 'E-Commerce' ? (
            <ChevronUp size={16} color="#D2042D" />
          ) : (
            <ChevronDown size={16} color="#D2042D" />
          )}
        </button>

        {expandedCategory === 'E-Commerce' && (
          <div style={{ paddingLeft: 8, paddingTop: 12 }}>
            <SideSubheading>Articles</SideSubheading>
            <div style={{ marginBottom: 16 }}>
              {ARTICLE_LINKS.map((item) => (
                <SideLink
                  key={item.label}
                  label={item.label}
                  active={isActive(item.href)}
                  onClick={() => go(item.href)}
                />
              ))}
            </div>

            <SideSubheading>Market</SideSubheading>
            <div>
              {MARKET_LINKS.map((item) => (
                <SideLink
                  key={item.bold}
                  label={<span><span style={{ fontWeight: 400 }}>{item.light}</span><span style={{ fontWeight: 700 }}>{item.bold}</span></span>}
                  live={item.live}
                  active={item.live && isActive(item.href)}
                  onClick={() => item.live && go(item.href)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Writers */}
      <h4
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 8px',
          paddingLeft: 4,
        }}
      >
        Writers
      </h4>
      <div style={{ marginBottom: 0, paddingBottom: 16, borderBottom: '1px solid #E0E0E0' }}>
        {WRITERS.map((w) => (
          <SideLink
            key={w.slug}
            label={w.name}
            active={isActive(`/author/${w.slug}`)}
            onClick={() => go(`/author/${w.slug}`)}
          />
        ))}
      </div>

      {/* DC Daily — subscribe CTA (above profile, pinned near bottom) */}
      <button
        onClick={() => go('/dc-daily')}
        style={{
          display: 'block', width: '100%', textAlign: 'left',
          marginTop: 'auto',
          background: '#0F172A', border: 'none', borderRadius: 10,
          padding: '14px 14px', cursor: 'pointer', color: '#fff',
          boxShadow: '0 6px 20px -10px rgba(15,23,42,0.6)',
        }}
      >
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#F6B41A',
          textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 3,
        }}>
          The Daily Briefing
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>
          Subscribe to DC Daily →
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>
          Every weekday, 8am
        </div>
      </button>

      {/* Profile / Help / Sign out — pinned below DC Daily box */}
      <div style={{ paddingTop: 12 }}>
        {session ? (
          <>
            <button
              onClick={() => go('/profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 4px', fontSize: 13, color: '#0F172A', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                width: '100%', textAlign: 'left',
              }}
            >
              {session.user?.image ? (
                <img src={session.user.image} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
              ) : (
                <User size={14} />
              )}
              {session.user?.name || 'Profile'}
            </button>
            <a href="/profile" style={{ display: 'block', padding: '8px 4px', fontSize: 13, color: '#666', textDecoration: 'none' }}>
              Help
            </a>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                display: 'block', padding: '8px 4px', fontSize: 13, color: '#666',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => go('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 4px', fontSize: 13, color: '#0F172A', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              width: '100%', textAlign: 'left',
            }}
          >
            <LogIn size={14} /> Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

function SideSubheading({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 8,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  );
}

function SideLink({ label, onClick, live, active }) {
  const dimmed = live === false;
  return (
    <button
      onClick={onClick}
      disabled={dimmed}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '7px 4px 7px 8px',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: dimmed ? '#cbd5e1' : active ? '#D2042D' : '#555',
        background: active ? 'rgba(210,4,45,0.06)' : 'none',
        border: 'none',
        borderRadius: 6,
        cursor: dimmed ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
        {live === true && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#10B981',
              flexShrink: 0,
            }}
          />
        )}
      </span>
      {dimmed && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#cbd5e1',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Soon
        </span>
      )}
    </button>
  );
}

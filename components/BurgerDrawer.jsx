'use client';

/**
 * Shared burger menu drawer — used on the homepage AND every sub-page
 * (article, category, author, top-articles, fundraising-tracker, etc.).
 *
 * Structure:
 *   CATEGORIES
 *     E-Commerce ▼  (expandable, holds Articles + Market inside)
 *   WRITERS
 *     Andrew Watson / Benjamin Cogan
 *   Profile / Help / Sign out
 *
 * Everything premium/platinum ("Fundraising Tracker", "DC Index",
 * "Platform Tracker", "Brand Leaderboard", "Events") is listed under
 * Market, with "Soon" badges on the ones that aren't wired up yet.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { X, ChevronDown, ChevronUp, User, LogIn } from 'lucide-react';

export default function BurgerDrawer({ onClose }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [expandedCategory, setExpandedCategory] = useState('E-Commerce');

  const go = (href) => {
    router.push(href);
    onClose?.();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />

      {/* drawer */}
      <div
        data-dc="burger-drawer"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 360,
          background: '#F4F1EA',
          boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
          overflowY: 'auto',
          padding: '32px 24px',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
          }}
        >
          <X size={24} color="#0F172A" />
        </button>

        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#D2042D',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            margin: '0 0 24px',
          }}
        >
          Categories
        </h3>

        {/* Expandable E-Commerce category — nests Articles + Market inside */}
        <div style={{ marginBottom: 24 }}>
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
              padding: '12px 0',
              borderBottom: '1px solid #E0E0E0',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>E-Commerce</span>
            {expandedCategory === 'E-Commerce' ? (
              <ChevronUp size={20} color="#D2042D" />
            ) : (
              <ChevronDown size={20} color="#D2042D" />
            )}
          </button>

          {expandedCategory === 'E-Commerce' && (
            <div style={{ paddingLeft: 16, paddingTop: 16 }}>
              <Subheading>Articles</Subheading>
              <div style={{ marginBottom: 20 }}>
                {ARTICLE_LINKS.map((item) => (
                  <DrawerLink key={item.label} label={item.label} onClick={() => go(item.href)} />
                ))}
              </div>

              <Subheading>Market</Subheading>
              <div>
                {MARKET_LINKS.map((item) => (
                  <DrawerLink
                    key={item.label}
                    label={item.label}
                    live={item.live}
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
            fontSize: 14,
            fontWeight: 700,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 12px',
          }}
        >
          Writers
        </h4>
        <div style={{ marginBottom: 32 }}>
          {WRITERS.map((w) => (
            <DrawerLink
              key={w.slug}
              label={w.name}
              onClick={() => go(`/author/${w.slug}`)}
            />
          ))}
        </div>

        {/* Profile / Sign out */}
        <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 24 }}>
          {session ? (
            <>
              <button
                onClick={() => go('/profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  background: '#fff', border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  textAlign: 'left', marginBottom: 12,
                }}
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{
                      width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
                      border: '2px solid rgba(0,0,0,0.06)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#0F172A', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={16} color="#fff" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                    {session.user?.name || 'Profile'}
                  </div>
                  <div style={{
                    fontSize: 11, color: '#94a3b8', marginTop: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {session.user?.email || 'View profile'}
                  </div>
                </div>
                <ChevronDown size={14} color="#cbd5e1" style={{ transform: 'rotate(-90deg)' }} />
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, width: '100%', padding: '10px 0', fontSize: 13,
                  fontWeight: 600, color: '#D2042D', background: 'none',
                  border: '1px solid rgba(210,4,45,0.15)', borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                <X size={14} /> Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => go('/login')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%', padding: '12px 0', fontSize: 14,
                fontWeight: 600, color: '#fff', background: '#0F172A',
                border: 'none', borderRadius: 10, cursor: 'pointer',
              }}
            >
              <LogIn size={16} /> Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const ARTICLE_LINKS = [
  { label: 'Most Recent', href: '/' },
  { label: 'Top Articles', href: '/top-articles' },
  { label: 'Features',    href: '/category/features' },
  { label: 'Opinion',     href: '/category/opinion' },
  { label: 'Platforms',   href: '/category/platforms' },
  { label: 'E-Commerce',  href: '/category/e-commerce' },
];

const MARKET_LINKS = [
  { label: 'Fundraising Tracker', href: '/fundraising-tracker', live: true },
  { label: 'DC Index',             href: '/dc-index', live: true },
  { label: 'Platform Tracker',     href: '/platform-tracker', live: true },
  { label: 'Brand Leaderboard',    href: '#', live: false },
  { label: 'Events',               href: '/events', live: true },
];

const WRITERS = [
  { name: 'Andrew Watson',  slug: 'andrew-watson' },
  { name: 'Benjamin Cogan', slug: 'benjamin-cogan' },
];

function Subheading({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function DrawerLink({ label, onClick, live }) {
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
        padding: '9px 0',
        fontSize: 14,
        fontWeight: 500,
        color: dimmed ? '#cbd5e1' : '#666',
        background: 'none',
        border: 'none',
        cursor: dimmed ? 'not-allowed' : 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        → {label}
        {live === true && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 0 0 rgba(16,185,129,0.6)',
              animation: 'dc-drawer-live-pulse 1.8s infinite',
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
            letterSpacing: '0.6px',
          }}
        >
          Soon
        </span>
      )}
      <style jsx>{`
        @keyframes dc-drawer-live-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
          70%  { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </button>
  );
}

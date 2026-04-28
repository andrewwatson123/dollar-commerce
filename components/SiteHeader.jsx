'use client';

/**
 * Shared header used on all non-homepage pages.
 *
 * Desktop (>=1024px): persistent SideNav on the left, no burger icon.
 * Mobile (<1024px): burger icon opens BurgerDrawer overlay.
 */

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Menu, Search, User } from 'lucide-react';
import BurgerDrawer from './BurgerDrawer';
import SideNav from './SideNav';
import TopBar from './TopBar';
import SearchDrawer from './SearchDrawer';

export default function SiteHeader({ dcIndexValue, dcIndexChange, latestArticle }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Persistent desktop sidebar — hidden <1024 via CSS */}
      <SideNav />

      <TopBar
        dcIndexValue={dcIndexValue}
        dcIndexChange={dcIndexChange}
        latestArticle={latestArticle}
      />

      {/* Header */}
      <header
        data-dc="site-header"
        style={{
          background: '#F4F1EA',
          borderBottom: '1px solid #E0E0E0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '24px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Burger button — hidden on desktop via CSS */}
          <button
            data-dc="burger-btn"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            <Menu size={24} color="#0F172A" />
          </button>
          <Link
            data-dc="site-title"
            href="/"
            aria-label="Dollar Commerce"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              lineHeight: 0,
            }}
          >
            <img
              src="/dc-icon-navy.svg"
              alt="Dollar Commerce"
              width={44}
              height={44}
              style={{ display: 'block', borderRadius: 10 }}
            />
          </Link>
          <div data-dc="header-actions" style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            >
              <Search size={22} color="#0F172A" />
            </button>
            <Link href={session ? '/profile' : '/login'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}>
              {session?.user?.image ? (
                <img src={session.user.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              ) : (
                <User size={22} color="#0F172A" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile burger drawer overlay */}
      {open && <BurgerDrawer onClose={() => setOpen(false)} />}

      {/* Search drawer */}
      {searchOpen && <SearchDrawer onClose={() => setSearchOpen(false)} />}
    </>
  );
}

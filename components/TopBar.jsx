'use client';

/**
 * Site-wide top bar — replaces the old stock ticker.
 *
 * Left:  DC Index value + change % + pulsing arrow → links to /dc-index
 * Right: Latest article headline + category pill → links to /article/[slug]
 *
 * Both sides are clickable CTAs. The stocks-only ticker now lives
 * exclusively on the DC Index page itself.
 */

import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowRight, ChevronRight } from 'lucide-react';

export default function TopBar({ dcIndexValue, dcIndexChange, latestArticle }) {
  const positive = (dcIndexChange ?? 0) >= 0;

  return (
    <div
      data-dc="topbar"
      style={{
        background: '#0F172A',
        color: '#fff',
        borderBottom: '2px solid #D2042D',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 42,
          gap: 24,
        }}
      >
        {/* Left: DC Index CTA */}
        <Link
          href="/dc-index"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#F59E0B',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            DC Index
          </span>
          <span style={{ fontSize: 15, fontWeight: 800 }}>
            {dcIndexValue?.toFixed(2) ?? '—'}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: positive ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {dcIndexChange != null ? `${positive ? '+' : ''}${dcIndexChange.toFixed(2)}%` : ''}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              animation: 'dc-topbar-pulse 2s infinite',
            }}
          >
            <ArrowRight size={11} color="#F59E0B" />
          </span>
          <style>{`
            @keyframes dc-topbar-pulse {
              0%   { transform: scale(1); opacity: 1; }
              50%  { transform: scale(1.15); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </Link>

        {/* Right: Latest article */}
        {latestArticle && (
          <Link
            href={`/article/${latestArticle.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#fff',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {latestArticle.category && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fff',
                  background: latestArticle.categoryColor || '#D2042D',
                  padding: '3px 7px',
                  borderRadius: 3,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  flexShrink: 0,
                }}
              >
                {latestArticle.category}
              </span>
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                opacity: 0.85,
              }}
            >
              {latestArticle.title}
            </span>
            <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
          </Link>
        )}
      </div>
    </div>
  );
}

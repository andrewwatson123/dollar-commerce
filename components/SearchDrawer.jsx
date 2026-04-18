'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X, Clock, TrendingUp, Newspaper, DollarSign, Zap } from 'lucide-react';

const RECENT_KEY = 'dc_recent_searches';
const MAX_RECENT = 8;

const SUGGESTIONS = [
  'Shopify',
  'Amazon',
  'DTC brands',
  'Series A',
  'Allbirds',
  'Klaviyo',
  'TikTok Shop',
  'fundraising',
  'Meta ads',
  'Platform update',
];

function readRecent() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function writeRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT))); } catch {}
}
function addRecent(term) {
  if (!term || !term.trim()) return;
  const list = readRecent().filter((t) => t.toLowerCase() !== term.toLowerCase());
  writeRecent([term, ...list]);
}

export default function SearchDrawer({ onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRecent(readRecent());
    // autofocus
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    // esc to close
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => { setResults(data); setLoading(false); })
        .catch(() => { setLoading(false); });
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query]);

  const runSearch = (term) => {
    setQuery(term);
    addRecent(term);
    setRecent(readRecent());
    inputRef.current?.focus();
  };

  const handleLinkClick = () => {
    addRecent(query);
    onClose();
  };

  const clearRecent = () => {
    writeRecent([]);
    setRecent([]);
  };

  const hasResults = results && (results.articles?.length || results.fundraising?.length || results.platformUpdates?.length);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)', zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '60px 16px 16px', overflow: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640,
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        {/* Search input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: '1px solid #E2E8F0',
        }}>
          <Search size={18} color="#64748B" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) runSearch(query.trim()); }}
            placeholder="Search articles, companies, updates..."
            style={{
              flex: 1, fontSize: 16, fontFamily: 'inherit',
              border: 'none', outline: 'none', background: 'transparent',
              color: '#0F172A', padding: 0,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94A3B8' }}
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 4, background: '#F1F5F9', border: 'none', borderRadius: 6,
              cursor: 'pointer', padding: '4px 8px', fontSize: 11, fontWeight: 600,
              color: '#64748B',
            }}
          >
            Esc
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* No query: show recent + suggestions */}
          {!query && (
            <>
              {recent.length > 0 && (
                <Section label="Recent">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span />
                    <button
                      onClick={clearRecent}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94A3B8', padding: 0 }}
                    >
                      Clear
                    </button>
                  </div>
                  {recent.map((term) => (
                    <Row
                      key={term}
                      icon={<Clock size={14} color="#94A3B8" />}
                      label={term}
                      onClick={() => runSearch(term)}
                    />
                  ))}
                </Section>
              )}
              <Section label="Suggested">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 4px 8px' }}>
                  {SUGGESTIONS.map((term) => (
                    <button
                      key={term}
                      onClick={() => runSearch(term)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 999,
                        border: '1px solid #E2E8F0', background: '#F8FAFC',
                        fontSize: 12, fontWeight: 500, color: '#0F172A',
                        cursor: 'pointer',
                      }}
                    >
                      <TrendingUp size={12} color="#D2042D" />
                      {term}
                    </button>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* Query with loading state */}
          {query && loading && (
            <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Searching…</div>
          )}

          {/* Results */}
          {query && !loading && results && (
            <>
              {!hasResults && (
                <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                  No results for <strong style={{ color: '#0F172A' }}>&ldquo;{query}&rdquo;</strong>
                </div>
              )}

              {results.articles?.length > 0 && (
                <Section label="Articles" icon={<Newspaper size={12} color="#94A3B8" />}>
                  {results.articles.map((a) => (
                    <LinkRow
                      key={a._id}
                      href={`/article/${a.slug}`}
                      onNav={handleLinkClick}
                      title={a.title}
                      subtitle={[a.category, a.publishedAt && fmtDate(a.publishedAt)].filter(Boolean).join(' · ')}
                    />
                  ))}
                </Section>
              )}

              {results.fundraising?.length > 0 && (
                <Section label="Fundraising" icon={<DollarSign size={12} color="#94A3B8" />}>
                  {results.fundraising.map((f) => (
                    <LinkRow
                      key={f._id}
                      href={f.sourceUrl || '/fundraising-tracker'}
                      external={!!f.sourceUrl}
                      onNav={handleLinkClick}
                      title={f.company}
                      subtitle={[
                        f.amountText || (f.amountUsd ? fmtUsd(f.amountUsd) : null),
                        f.round,
                        f.sector,
                      ].filter(Boolean).join(' · ')}
                    />
                  ))}
                </Section>
              )}

              {results.platformUpdates?.length > 0 && (
                <Section label="Platform Updates" icon={<Zap size={12} color="#94A3B8" />}>
                  {results.platformUpdates.map((p) => (
                    <LinkRow
                      key={p._id}
                      href={p.sourceUrl || '/platform-tracker'}
                      external={!!p.sourceUrl}
                      onNav={handleLinkClick}
                      title={p.title}
                      subtitle={[p.platform, p.category].filter(Boolean).join(' · ')}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ label, icon, children }) {
  return (
    <div style={{ padding: '14px 18px 4px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
      }}>
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 4px', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', borderRadius: 6,
      }}
    >
      {icon}
      <span style={{ fontSize: 14, color: '#0F172A' }}>{label}</span>
    </button>
  );
}

function LinkRow({ href, external, onNav, title, subtitle }) {
  const content = (
    <div style={{
      padding: '10px 4px', borderRadius: 6, cursor: 'pointer',
      display: 'block',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.35, marginBottom: 2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#94A3B8' }}>{subtitle}</div>
      )}
    </div>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" onClick={onNav} style={{ textDecoration: 'none' }}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onNav} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}
function fmtUsd(n) {
  if (!n) return '';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

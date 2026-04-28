'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ExternalLink, Search } from 'lucide-react';
import { getRoundMeta } from '@/lib/round-meta';

function visitHref(event) {
  if (event.brandWebsite) return event.brandWebsite;
  const q = encodeURIComponent(`!ducky ${event.company} official site`);
  return `https://duckduckgo.com/?q=${q}`;
}

function fmtUsd(n) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&ndash;': '–', '&mdash;': '—', '&hellip;': '…',
  '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
};
function cleanDescription(raw) {
  if (!raw) return '';
  let s = raw;
  for (const [k, v] of Object.entries(ENTITIES)) s = s.split(k).join(v);
  s = s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
  s = s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return s;
}
function trimSummary(raw, maxChars = 140) {
  const s = cleanDescription(raw);
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars);
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentenceEnd > maxChars * 0.5) return cut.slice(0, sentenceEnd + 1);
  const wordEnd = cut.lastIndexOf(' ');
  return (wordEnd > 0 ? cut.slice(0, wordEnd) : cut) + '…';
}

const th = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};
const td = { padding: '14px 16px', verticalAlign: 'top' };

const PAGE_SIZE = 50;

function makeSortHref(sort, activeRound, activeSector) {
  const params = new URLSearchParams();
  if (activeRound) params.set('round', activeRound);
  if (activeSector) params.set('sector', activeSector);
  if (sort && sort !== 'date_desc') params.set('sort', sort);
  const qs = params.toString();
  return qs ? `/fundraising-tracker?${qs}` : '/fundraising-tracker';
}

export default function FundraisingTable({ events, currentSort = 'date_desc', activeRound, activeSector }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');

  // Filter events by search query
  const filteredEvents = search.trim()
    ? events.filter((e) => {
        const q = search.toLowerCase();
        return (
          (e.company && e.company.toLowerCase().includes(q)) ||
          (e.sector && e.sector.toLowerCase().includes(q)) ||
          (e.round && e.round.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.sourceName && e.sourceName.toLowerCase().includes(q))
        );
      })
    : events;

  // Amount sort
  const nextAmountSort = currentSort === 'amount_desc' ? 'amount_asc' : 'amount_desc';
  const amountActive = currentSort === 'amount_desc' || currentSort === 'amount_asc';
  const AmountArrow = !amountActive ? ArrowUpDown : currentSort === 'amount_desc' ? ArrowDown : ArrowUp;

  // Date sort
  const nextDateSort = currentSort === 'date_asc' ? 'date_desc' : 'date_asc';
  const dateActive = currentSort === 'date_desc' || currentSort === 'date_asc';
  const DateArrow = !dateActive ? ArrowUpDown : currentSort === 'date_desc' ? ArrowDown : ArrowUp;

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <>
      {/* Search bar */}
      <div data-dc="fundraising-search" style={{ marginBottom: 16, position: 'relative' }}>
        <Search
          size={16}
          color="#999"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
          placeholder="Search company, sector, round, source..."
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            fontSize: 14,
            border: '1px solid #E0E0E0',
            borderRadius: 8,
            background: '#fff',
            color: '#0F172A',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        {search && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#999' }}>
            {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Mobile-only sort pills (phone <600px) */}
      <div data-dc="fundraising-cards-sort" style={{
        display: 'none',
        gap: 8, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <a
          href={makeSortHref(nextAmountSort, activeRound, activeSector)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: amountActive ? '#0F172A' : '#fff', color: amountActive ? '#fff' : '#0F172A',
            border: '1px solid #E0E0E0', textDecoration: 'none',
          }}
        >
          Amount <AmountArrow size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        </a>
        <a
          href={makeSortHref(nextDateSort, activeRound, activeSector)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: dateActive ? '#0F172A' : '#fff', color: dateActive ? '#fff' : '#0F172A',
            border: '1px solid #E0E0E0', textDecoration: 'none',
          }}
        >
          Date <DateArrow size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        </a>
      </div>

      {/* Desktop table (hidden on phone via CSS) */}
      <div
        data-dc="fundraising-table-wrap"
        style={{
          background: '#fff',
          border: '1px solid #E0E0E0',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9f8f3', borderBottom: '1px solid #E0E0E0' }}>
              <th style={th}>Company</th>
              <th style={{ ...th, padding: 0 }}>
                <a
                  href={makeSortHref(nextAmountSort, activeRound, activeSector)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 16px', color: amountActive ? '#0F172A' : '#666',
                    textDecoration: 'none', cursor: 'pointer', width: '100%',
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}
                >
                  Amount <AmountArrow size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                </a>
              </th>
              <th style={th}>Round</th>
              <th style={th}>Sector</th>
              <th style={{ ...th, padding: 0 }}>
                <a
                  href={makeSortHref(nextDateSort, activeRound, activeSector)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 16px', color: dateActive ? '#0F172A' : '#666',
                    textDecoration: 'none', cursor: 'pointer', width: '100%',
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}
                >
                  Date <DateArrow size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                </a>
              </th>
              <th style={th}>Source</th>
              <th style={th}>Visit</th>
            </tr>
          </thead>
          <tbody>
            {visibleEvents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                  No events match these filters.
                </td>
              </tr>
            )}
            {visibleEvents.map((e) => (
              <tr key={e._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={td}>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{e.company}</div>
                  {e.description && (
                    <div style={{
                      fontSize: 12, color: '#999', marginTop: 2, maxWidth: 420,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {trimSummary(e.description)}
                    </div>
                  )}
                </td>
                <td style={{ ...td, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                  {fmtUsd(e.amountUsd) || e.amountText || '—'}
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 4,
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    background: getRoundMeta(e.round).color,
                    textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap',
                  }}>
                    {e.round}
                  </span>
                </td>
                <td style={{ ...td, color: '#666', whiteSpace: 'nowrap' }}>{e.sector}</td>
                <td style={{ ...td, color: '#666', whiteSpace: 'nowrap' }}>{fmtDate(e.announcedAt)}</td>
                <td style={td}>
                  <a
                    href={e.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#D2042D', textDecoration: 'none', fontSize: 12 }}
                  >
                    {e.sourceName} ↗
                  </a>
                </td>
                <td style={td}>
                  <a
                    href={visitHref(e)}
                    target="_blank"
                    rel="noreferrer"
                    title={e.brandWebsite ? 'Visit brand website' : 'Search for brand'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '4px 10px', border: '1px solid #E0E0E0', borderRadius: 999,
                      fontSize: 11, fontWeight: 600, color: '#0F172A',
                      textDecoration: 'none', background: '#fff', whiteSpace: 'nowrap',
                    }}
                  >
                    Visit <ExternalLink size={11} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view (phone <600px only) */}
      <div data-dc="fundraising-cards" style={{ display: 'none' }}>
        {visibleEvents.length === 0 && (
          <div style={{
            padding: 40, textAlign: 'center', color: '#666',
            background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
          }}>
            No events match these filters.
          </div>
        )}
        {visibleEvents.map((e) => {
          const roundMeta = getRoundMeta(e.round);
          return (
            <div
              key={e._id}
              style={{
                background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
                padding: '14px 16px', marginBottom: 10,
              }}
            >
              {/* Top row: round pill + amount */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, marginBottom: 8,
              }}>
                <span style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: 4,
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  background: roundMeta.color,
                  textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap',
                }}>
                  {e.round}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                  {fmtUsd(e.amountUsd) || e.amountText || '—'}
                </span>
              </div>

              {/* Company (tappable link) */}
              <a
                href={visitHref(e)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 17, fontWeight: 600, color: '#0F172A',
                  textDecoration: 'none', marginBottom: 4,
                }}
              >
                {e.company}
                <ExternalLink size={13} style={{ opacity: 0.5 }} />
              </a>

              {/* Meta line */}
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                {e.sector && <span>{e.sector}</span>}
                {e.sector && e.announcedAt && <span style={{ margin: '0 6px' }}>·</span>}
                {e.announcedAt && <span>{fmtDate(e.announcedAt)}</span>}
              </div>

              {/* Description */}
              {e.description && (
                <p style={{
                  fontSize: 13, color: '#666', lineHeight: 1.45, margin: '0 0 10px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {trimSummary(e.description, 180)}
                </p>
              )}

              {/* Source */}
              {e.sourceUrl && (
                <div style={{
                  borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 4,
                }}>
                  <a
                    href={e.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: '#D2042D', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Source: {e.sourceName || 'Link'} ↗
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            style={{
              padding: '12px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: '1px solid #E0E0E0', background: '#fff', color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            Load more ({filteredEvents.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}

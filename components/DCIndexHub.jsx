'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronDown,
  Store, ShoppingBag, Code2, Shirt, Scale, Weight,
} from 'lucide-react';
import { stockLogoUrl } from '@/lib/stock-domains';

/* ── helpers ─────────────────────────────────────────────────────────────── */

function fmtPrice(n) {
  if (n == null) return '—';
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPct(n) {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}
function fmtChange(n) {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}$${Math.abs(n).toFixed(2)}`;
}
function fmtWeight(n) {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

const BUCKET_META = {
  Brands:       { color: '#9333ea', bg: '#F5F3FF', Icon: Shirt, label: 'DC Brands Index',       desc: 'Public DTC & consumer brands' },
  Marketplaces: { color: '#0ea5e9', bg: '#F0F9FF', Icon: Store, label: 'DC Marketplace Index',  desc: 'E-commerce platforms & marketplaces' },
  Software:     { color: '#10B981', bg: '#ECFDF5', Icon: Code2, label: 'DC Software Index',      desc: 'Payments, SaaS & commerce infrastructure' },
};

const DATE_RANGES = [
  { label: '1D',  days: 1 },
  { label: '1W',  days: 7 },
  { label: '1M',  days: 30 },
  { label: '3M',  days: 90 },
  { label: 'YTD', days: null },
  { label: '1Y',  days: 365 },
  { label: 'All', days: null },
];

function rangeLabel(r) {
  if (r === 'All') return 'Jan 2, 2024 → Today';
  if (r === 'YTD') return 'Jan 1, 2026 → Today';
  if (r === '1D') return 'Today';
  const d = DATE_RANGES.find(x => x.label === r);
  return `Last ${d?.days ?? ''} days`;
}

/* ── SVG mini-chart ──────────────────────────────────────────────────────── */

function MiniChart({ points, width = 420, height = 120, color = '#F59E0B', fillOpacity = 0.12 }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points) - 2;
  const max = Math.max(...points) + 2;
  const range = max - min || 1;
  const xStep = width / (points.length - 1);
  const coords = points.map((v, i) => `${i * xStep},${height - ((v - min) / range) * height}`);
  const line = coords.join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polygon points={area} fill={color} opacity={fillOpacity} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={(points.length - 1) * xStep} cy={height - ((points[points.length - 1] - min) / range) * height} r={4} fill={color} />
    </svg>
  );
}

function generateChartPoints(basePrice, currentPrice, n = 24) {
  const pts = [100];
  const target = (currentPrice / basePrice) * 100;
  for (let i = 1; i < n; i++) {
    const progress = i / (n - 1);
    const noise = (Math.random() - 0.5) * 4;
    pts.push(100 + (target - 100) * progress + noise);
  }
  pts[n - 1] = target;
  return pts;
}

/* ── main component ──────────────────────────────────────────────────────── */

export default function DCIndexHub({ dcIndex, basketStocks, etfStocks, watchlistStocks, sentiment }) {
  const [activeRange, setActiveRange] = useState('1D');
  const [weightMode, setWeightMode] = useState('equal');
  const [periodData, setPeriodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sentimentOpen, setSentimentOpen] = useState(false);

  const isMcap = weightMode === 'mcap';
  const overall = isMcap ? (dcIndex?.overallWeighted ?? dcIndex?.overall) : dcIndex?.overall;
  const buckets = isMcap ? (dcIndex?.bucketsWeighted ?? dcIndex?.buckets ?? []) : (dcIndex?.buckets || []);
  const BUCKET_NAMES = ['Brands', 'Marketplaces', 'Software'];

  /* ── data fetching ── */

  const fetchPeriodData = useCallback(async (range) => {
    if (range === 'All' || range === '1D') { setPeriodData(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/history?range=${range}`);
      if (res.ok) { const json = await res.json(); setPeriodData(json.data); }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPeriodData(activeRange); }, [activeRange, fetchPeriodData]);

  function withPeriodChange(stocks) {
    if (activeRange === 'All' || activeRange === '1D' || !periodData) return stocks;
    return stocks.map(s => ({
      ...s,
      changePercent: periodData[s.symbol]?.periodChangePct ?? s.changePercent,
      change: periodData[s.symbol]?.periodChange ?? s.change,
    }));
  }

  const displayBasket = withPeriodChange(basketStocks);
  const displayEtfs = withPeriodChange(etfStocks);
  const displayWatchlist = withPeriodChange(watchlistStocks);

  /**
   * Compute weighted period change for a set of stocks.
   * Uses index weights (equal or mcap) so the % change reflects the
   * actual index methodology, not a simple average.
   */
  function computePeriodChange(stocks, weights) {
    if (activeRange === 'All') return null;
    if (activeRange === '1D') {
      const valid = stocks.filter(s => s.changePercent != null);
      if (valid.length === 0) return null;
      if (weights && Object.keys(weights).length > 0) {
        const totalW = valid.reduce((acc, s) => acc + (weights[s.symbol] ?? 0), 0);
        if (totalW === 0) return null;
        return valid.reduce((acc, s) => acc + (weights[s.symbol] ?? 0) * s.changePercent, 0) / totalW;
      }
      return valid.reduce((acc, s) => acc + s.changePercent, 0) / valid.length;
    }
    if (!periodData) return null;
    const valid = stocks.filter(s => periodData[s.symbol]?.periodChangePct != null);
    if (valid.length === 0) return null;
    if (weights && Object.keys(weights).length > 0) {
      const totalW = valid.reduce((acc, s) => acc + (weights[s.symbol] ?? 0), 0);
      if (totalW === 0) return null;
      return valid.reduce((acc, s) => acc + (weights[s.symbol] ?? 0) * periodData[s.symbol].periodChangePct, 0) / totalW;
    }
    return valid.reduce((acc, s) => acc + periodData[s.symbol].periodChangePct, 0) / valid.length;
  }

  /* ── computed display values ── */

  const allTimeChange = (overall?.value ?? 100) - 100;
  const periodChange = computePeriodChange(basketStocks, overall?.weights);
  const displayOverall = {
    value: overall?.value,
    change: periodChange ?? allTimeChange,
  };

  const displayBuckets = BUCKET_NAMES.map(bucket => {
    const bStocks = basketStocks.filter(s => s.bucket === bucket);
    const serverIdx = buckets.find(b => b.bucket === bucket);
    const bAllTimeChange = (serverIdx?.value ?? 100) - 100;
    const bPeriodChange = computePeriodChange(bStocks, serverIdx?.weights);
    return {
      bucket,
      value: serverIdx?.value,
      change: bPeriodChange ?? bAllTimeChange,
      coverage: serverIdx?.coverage,
    };
  });

  const sorted = [...basketStocks].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();

  const chartPctChange = displayOverall.change ?? 0;
  const chartTarget = 100 * (1 + chartPctChange / 100);
  const chartPoints = generateChartPoints(100, chartTarget, 24);

  /* ── render ── */
  return (
    <div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STICKY CONTROL BAR                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'sticky', top: 81, zIndex: 50,
          background: '#F4F1EA',
          padding: '14px 0',
          marginBottom: 20,
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
        }}>
          {/* Left: label */}
          <div style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#999', fontSize: 12 }}>Showing:</span>
            <strong style={{ color: '#0F172A', fontSize: 15 }}>{rangeLabel(activeRange)}</strong>
            {loading && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 500 }}>Loading...</span>}
          </div>

          {/* Right: controls */}
          <div data-dc="dc-index-controls" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Weight toggle */}
            <div data-dc="weight-toggle" style={{
              display: 'flex', background: '#fff', padding: 3,
              borderRadius: 999, border: '1px solid #E0E0E0',
            }}>
              {[
                { key: 'equal', label: 'Equal Wt', icon: '=' },
                { key: 'mcap',  label: 'Cap Wt',   icon: '$' },
              ].map((m) => {
                const active = weightMode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setWeightMode(m.key); }}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      border: 'none', cursor: 'pointer', letterSpacing: 0.3,
                      whiteSpace: 'nowrap',
                      background: active ? '#0F172A' : 'transparent',
                      color: active ? '#F59E0B' : '#999',
                      transition: 'all 150ms',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Date range pills */}
            <div data-dc="dc-index-range-tabs" style={{
              display: 'flex', gap: 2, background: '#fff', padding: 3,
              borderRadius: 999, border: '1px solid #E0E0E0',
            }}>
              {DATE_RANGES.map((r) => {
                const active = activeRange === r.label;
                return (
                  <button
                    key={r.label}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveRange(r.label); }}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: 'pointer', letterSpacing: 0.3,
                      background: active ? '#0F172A' : 'transparent',
                      color: active ? '#fff' : '#888',
                      transition: 'all 150ms',
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — DC Index (Master)                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-dc="dc-index-overall" style={{
        background: '#0F172A', borderRadius: 14, padding: '36px 40px 32px',
        marginBottom: 14, color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase',
              letterSpacing: 1.4, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: '#F59E0B', animation: 'pulse 2s infinite',
              }} />
              Dollar Commerce Index
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <span data-dc="overall-value" style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                {displayOverall.value?.toFixed(2) ?? '—'}
              </span>
              <span style={{
                fontSize: 20, fontWeight: 600,
                color: (displayOverall.change ?? 0) >= 0 ? '#10b981' : '#ef4444',
              }}>
                {displayOverall.value != null ? fmtPct(displayOverall.change) : ''}
              </span>
            </div>
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10,
              lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {dcIndex?.basketSize ?? 116} stocks
              <span style={{ margin: '0 6px', opacity: 0.4 }}>/</span>
              {isMcap ? 'Cap weighted' : 'Equal weighted'}
              <span style={{ margin: '0 6px', opacity: 0.4 }}>/</span>
              Base 100 on Jan 2, 2024
            </div>
          </div>
          <div data-dc="dc-index-chart" style={{ flex: 1, maxWidth: 420, paddingLeft: 32, minWidth: 200 }}>
            <MiniChart points={chartPoints} width={420} height={120} color="#F59E0B" fillOpacity={0.15} />
          </div>
        </div>

        {/* What is the DC Index? — collapsible */}
        <div style={{
          marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={() => setAboutOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
              textAlign: 'left', fontFamily: 'inherit',
            }}
            aria-expanded={aboutOpen}
          >
            What is the DC Index?
            <ChevronDown
              size={14}
              color="rgba(255,255,255,0.6)"
              style={{
                transition: 'transform 180ms ease',
                transform: aboutOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
          {aboutOpen && (
            <div style={{
              marginTop: 12, fontSize: 13,
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
            }}>
              {isMcap ? (
                <>
                  A market-cap weighted basket of {dcIndex?.basketSize ?? 116} publicly traded e-commerce and
                  commerce-infrastructure companies — larger companies carry proportionally more weight, like
                  the S&amp;P 500. Three sub-indexes — DC Brands Index, DC Marketplace Index, and DC Software Index —
                  each with their own index value. No single stock exceeds 15% weight. Prices may be delayed up to 15 min.
                </>
              ) : (
                <>
                  An equal-weighted basket of {dcIndex?.basketSize ?? 116} publicly traded e-commerce and
                  commerce-infrastructure companies — every stock carries the same weight regardless of size. Three
                  sub-indexes — DC Brands Index, DC Marketplace Index, and DC Software Index — each with their own index value.
                  No single stock exceeds 15% weight. Prices may be delayed up to 15 min.
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SUB-INDEX CARDS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-dc="dc-index-buckets" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        {displayBuckets.map((b) => {
          const meta = BUCKET_META[b.bucket] || {};
          const Icon = meta.Icon;
          const stockCount = basketStocks.filter(s => s.bucket === b.bucket).length;
          const bStocks = basketStocks.filter(s => s.bucket === b.bucket);
          const topMover = [...bStocks].sort((a, bb) =>
            Math.abs(bb.changePercent ?? 0) - Math.abs(a.changePercent ?? 0)
          )[0];

          // Mini chart for this sub-index
          const bChange = b.change ?? 0;
          const bTarget = 100 * (1 + bChange / 100);
          const bPoints = generateChartPoints(100, bTarget, 16);

          return (
            <div key={b.bucket} style={{
              background: '#fff', borderRadius: 12, padding: '22px 24px 18px',
              border: '1px solid #E8E8E8', borderTop: `3px solid ${meta.color}`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Background chart */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, opacity: 0.08,
              }}>
                <MiniChart points={bPoints} width={300} height={50} color={meta.color} fillOpacity={0.5} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: meta.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {Icon && <Icon size={16} color={meta.color} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                        {meta.label || b.bucket}
                      </div>
                      <div style={{ fontSize: 10, color: '#999' }}>{stockCount} stocks</div>
                    </div>
                  </div>
                </div>

                {/* Value + change */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>
                    {b.value?.toFixed(2) ?? '—'}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: (b.change ?? 0) >= 0 ? '#10b981' : '#ef4444',
                  }}>
                    {b.value != null ? fmtPct(b.change) : ''}
                  </span>
                </div>

                {/* Top mover */}
                {topMover && (
                  <div style={{
                    fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {stockLogoUrl(topMover.symbol) && (
                      <img src={stockLogoUrl(topMover.symbol, 14)} alt="" width={14} height={14}
                        style={{ borderRadius: 3 }} />
                    )}
                    <span style={{ fontWeight: 600, color: '#64748B' }}>{topMover.symbol}</span>
                    <span style={{
                      fontWeight: 600, marginLeft: 2,
                      color: (topMover.changePercent ?? 0) >= 0 ? '#10b981' : '#ef4444',
                    }}>
                      {fmtPct(topMover.changePercent)}
                    </span>
                    <span style={{ marginLeft: 2 }}>top mover</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONSUMER SENTIMENT                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-dc="sentiment-row" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, marginBottom: 44 }}>
        <div style={{
          background: '#fff', border: '1px solid #E8E8E8', borderRadius: 10, padding: 18,
          borderTop: '3px solid #F59E0B',
        }}>
          <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, marginBottom: 6 }}>
            Consumer Sentiment
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>
            {sentiment?.current?.toFixed(1) ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {sentiment?.change != null && (
              <span style={{ fontWeight: 600, color: sentiment.change >= 0 ? '#10b981' : '#ef4444', marginRight: 6 }}>
                {sentiment.change >= 0 ? '+' : ''}{sentiment.change.toFixed(1)}
              </span>
            )}
            <span style={{ color: '#999', fontSize: 11 }}>
              UMich {sentiment?.date ? new Date(sentiment.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
            </span>
          </div>
        </div>
        <div data-dc="sentiment-explainer" style={{
          background: '#fff', border: '1px solid #E8E8E8', borderRadius: 10, padding: '14px 20px',
          display: 'flex', alignItems: 'center',
        }}>
          {/* Mobile toggle button (hidden on desktop via CSS) */}
          <button
            data-dc="sentiment-toggle"
            onClick={() => setSentimentOpen((o) => !o)}
            style={{
              display: 'none', alignItems: 'center', gap: 6, width: '100%',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#0F172A',
              textAlign: 'left', fontFamily: 'inherit',
            }}
            aria-expanded={sentimentOpen}
          >
            What is Consumer Sentiment?
            <ChevronDown
              size={14}
              color="#999"
              style={{
                transition: 'transform 180ms ease',
                transform: sentimentOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
          {/* Always-visible paragraph (on mobile, only shows when sentimentOpen) */}
          <p
            data-dc="sentiment-text"
            data-open={sentimentOpen ? 'true' : 'false'}
            style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}
          >
            Consumer spending drives ~70% of U.S. GDP and directly impacts e-commerce demand,
            ad budgets, and DTC customer acquisition costs. Readings above 80 signal optimism;
            below 60 signal pessimism.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP MOVERS                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeading carousel="movers-row">Top Movers Today</SectionHeading>
      <div data-dc="movers-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 48 }}>
        <MoverPanel title="Gainers" stocks={gainers} positive />
        <MoverPanel title="Losers" stocks={losers} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* E-COMMERCE ETFs                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeading carousel="etf-carousel">E-Commerce ETFs</SectionHeading>
      <div data-dc="etf-carousel" style={{ display: 'flex', gap: 10, marginBottom: 48 }}>
        {displayEtfs.map((s) => (
          <div key={s.symbol} style={{
            flex: 1, background: '#fff', border: '1px solid #E8E8E8', borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              {stockLogoUrl(s.symbol) && <img src={stockLogoUrl(s.symbol, 16)} alt="" width={16} height={16} style={{ borderRadius: 3 }} />}
              {s.symbol}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{s.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{fmtPrice(s.price)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: (s.changePercent ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>
                {fmtPct(s.changePercent)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BASKET CAROUSELS — one per sub-index                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {BUCKET_NAMES.map((bucket) => {
        const meta = BUCKET_META[bucket] || {};
        const Icon = meta.Icon;
        const stocks = displayBasket.filter((s) => s.bucket === bucket);
        const bucketIndex = displayBuckets.find((b) => b.bucket === bucket);
        return (
          <div key={bucket} style={{ marginBottom: 40 }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              paddingBottom: 12, borderBottom: '1px solid #E8E8E8',
            }}>
              {Icon && (
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: meta.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color="#fff" />
                </div>
              )}
              <h2 style={{
                fontSize: 14, fontWeight: 700, color: '#0F172A', textTransform: 'uppercase',
                letterSpacing: 0.4, margin: 0, flex: 1,
              }}>
                {meta.label || bucket}
              </h2>
              {bucketIndex?.value != null && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    {bucketIndex.value.toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, marginLeft: 8,
                    color: (bucketIndex.change ?? 0) >= 0 ? '#10b981' : '#ef4444',
                  }}>
                    {fmtPct(bucketIndex.change)}
                  </span>
                </div>
              )}
            </div>
            <StockCarousel stocks={stocks} weights={overall?.weights || {}} color={meta.color} />
          </div>
        );
      })}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RELATED STOCKS                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeading carousel="related-carousel">Related Stocks</SectionHeading>
      <div data-dc="related-carousel" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {displayWatchlist.map((s) => (
          <div key={s.symbol} style={{
            minWidth: 140, background: '#fff', borderRadius: 10, padding: '12px 14px',
            border: '1px solid #E8E8E8', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {stockLogoUrl(s.symbol) && <img src={stockLogoUrl(s.symbol, 16)} alt="" width={16} height={16} style={{ borderRadius: 3 }} />}
                <span style={{ fontSize: 14, fontWeight: 700 }}>{s.symbol}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: (s.changePercent ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>
                {(s.changePercent ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent ?? 0).toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#999' }}>{s.name}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{fmtPrice(s.price)}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ── sub-components ──────────────────────────────────────────────────────── */

function SectionHeading({ children, carousel }) {
  const scroll = (dir) => {
    if (!carousel) return;
    const el = document.querySelector(`[data-dc="${carousel}"]`);
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' });
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 8, margin: '0 0 14px', paddingBottom: 10,
      borderBottom: '1px solid #E8E8E8',
    }}>
      <h2 style={{
        fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase',
        letterSpacing: 0.6, margin: 0,
      }}>
        {children}
      </h2>
      {carousel && (
        <div data-dc="carousel-controls" style={{ display: 'none', gap: 6 }}>
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid #E2E8F0', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}
          >
            <ChevronLeft size={14} color="#64748B" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid #E2E8F0', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}
          >
            <ChevronRight size={14} color="#64748B" />
          </button>
        </div>
      )}
    </div>
  );
}

function MoverPanel({ title, stocks, positive }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E8E8E8', borderRadius: 10, padding: '18px 20px',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: positive ? '#10b981' : '#ef4444',
        textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
        letterSpacing: 0.5,
      }}>
        {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {title}
      </div>
      {stocks.map((s, i) => (
        <div key={s.symbol} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
          borderBottom: i < stocks.length - 1 ? '1px solid #F1F5F9' : 'none',
        }}>
          <span style={{
            width: 80, fontSize: 13, fontWeight: 700, color: '#0F172A',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {stockLogoUrl(s.symbol) && (
              <img src={stockLogoUrl(s.symbol, 16)} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
            )}
            {s.symbol}
          </span>
          <div style={{ flex: 1, height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden', direction: positive ? 'ltr' : 'rtl' }}>
            <div style={{
              width: `${Math.min(Math.abs(s.changePercent ?? 0) * (positive ? 15 : 8), 100)}%`,
              height: '100%', background: positive ? '#10b981' : '#ef4444', borderRadius: 3,
            }} />
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, color: positive ? '#10b981' : '#ef4444',
            width: 60, textAlign: 'right',
          }}>
            {fmtPct(s.changePercent)}
          </span>
        </div>
      ))}
    </div>
  );
}

function StockCarousel({ stocks, weights, color }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => scroll(-1)} style={arrowBtnStyle('left')}><ChevronLeft size={16} /></button>
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 10, overflowX: 'auto', scrollBehavior: 'smooth',
          scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '4px 0',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {stocks.map((s) => (
          <div key={s.symbol} style={{
            minWidth: 185, background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: '1px solid #E8E8E8', flexShrink: 0, borderTop: `3px solid ${color}`,
            transition: 'box-shadow 150ms',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {stockLogoUrl(s.symbol) && (
                  <img src={stockLogoUrl(s.symbol)} alt="" width={20} height={20} style={{ borderRadius: 4 }} />
                )}
                <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{s.symbol}</span>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 4,
                color: '#fff', background: (s.changePercent ?? 0) >= 0 ? '#10b981' : '#ef4444',
              }}>
                {fmtPct(s.changePercent)}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.name}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              {fmtPrice(s.price)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
              <span>Wt: <strong style={{ color: '#64748B' }}>{fmtWeight(weights[s.symbol])}</strong></span>
              <span>{fmtChange(s.change)}</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll(1)} style={arrowBtnStyle('right')}><ChevronRight size={16} /></button>
    </div>
  );
}

function arrowBtnStyle(side) {
  return {
    position: 'absolute',
    [side]: -14,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10, width: 30, height: 30, borderRadius: '50%',
    background: '#fff', border: '1px solid #E0E0E0', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    color: '#666',
  };
}

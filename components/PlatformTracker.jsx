'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PLATFORMS, CATEGORIES, platformLogoUrl } from '@/lib/platforms';

const PAGE_SIZE = 50;
// Mobile-first: show fewer initially, expand in smaller chunks
const INITIAL_MOBILE = 10;
const PAGE_SIZE_MOBILE = 10;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 599);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function buildQuery(next) {
  const params = new URLSearchParams();
  if (next.platform) params.set('platform', next.platform);
  if (next.category) params.set('category', next.category);
  if (next.sort && next.sort !== 'date') params.set('sort', next.sort);
  const qs = params.toString();
  return qs ? `/platform-tracker?${qs}` : '/platform-tracker';
}

function PepperIcons({ heat }) {
  const count = heat || 1;
  return (
    <span title={count === 3 ? 'Very big news' : count === 2 ? 'Important' : 'Normal'}>
      {'🌶'.repeat(count)}
    </span>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';
}

function formatDateGroup(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today) return 'Today';
  if (d.toDateString() === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

// Group updates by date
function groupByDate(updates) {
  const groups = [];
  let currentDate = null;
  for (const u of updates) {
    const dateStr = u.reportedAt?.slice(0, 10);
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groups.push({ date: dateStr, label: formatDateGroup(u.reportedAt), items: [] });
    }
    groups[groups.length - 1].items.push(u);
  }
  return groups;
}

export default function PlatformTracker({
  updates,
  total,
  platformCounts,
  categoryCounts,
  activePlatform,
  activeCategory,
  activeSort = 'date',
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const navTo = (href) => router.push(href, { scroll: false });

  // Reset visible count when switching between mobile/desktop
  useEffect(() => {
    setVisibleCount(isMobile ? INITIAL_MOBILE : PAGE_SIZE);
  }, [isMobile]);

  const pageIncrement = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE;

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;
  const groups = groupByDate(visibleUpdates);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', margin: 0 }}>Platform Tracker</h1>
        <LivePill />
      </div>
      <p style={{ fontSize: 15, color: '#666', margin: '0 0 20px', maxWidth: 680 }}>
        Live feed of e-commerce platform changes — features, bugs, policy updates, API changes, and AI updates.
      </p>

      {/* Platform selector tabs */}
      <div data-dc="filter-carousel" style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        <PlatformTab
          label="All"
          count={total}
          active={!activePlatform}
          onClick={() => navTo(buildQuery({ category: activeCategory }))}
        />
        {PLATFORMS.map((p) => (
          <PlatformTab
            key={p.name}
            label={p.name}
            count={platformCounts[p.name] || 0}
            logoUrl={platformLogoUrl(p.domain)}
            color={p.color}
            active={activePlatform === p.name}
            onClick={() => navTo(buildQuery({ platform: p.name, category: activeCategory }))}
          />
        ))}
      </div>

      {/* Category filter pills */}
      <div data-dc="filter-carousel" style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
        <CategoryPill
          label="All"
          active={!activeCategory}
          onClick={() => navTo(buildQuery({ platform: activePlatform }))}
        />
        {Object.entries(CATEGORIES).map(([key, meta]) => (
          <CategoryPill
            key={key}
            label={meta.label}
            color={meta.color}
            count={categoryCounts[key] || 0}
            active={activeCategory === key}
            onClick={() => navTo(buildQuery({ platform: activePlatform, category: key }))}
          />
        ))}
      </div>

      {/* Timeline feed */}
      {groups.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: '#666', background: '#fff', borderRadius: 8, border: '1px solid #E0E0E0' }}>
          No updates match these filters.
        </div>
      )}

      {groups.map((group, groupIdx) => (
        <div key={group.date} style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase',
            letterSpacing: 0.5, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #E0E0E0',
          }}>
            <span>{group.label}</span>
            {groupIdx === 0 && (
              <button
                onClick={() => navTo(buildQuery({
                  platform: activePlatform,
                  category: activeCategory,
                  sort: activeSort === 'heat' ? 'date' : 'heat',
                }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  border: '1px solid #E0E0E0', background: '#fff', color: '#666',
                  cursor: 'pointer', textTransform: 'none', letterSpacing: 0,
                }}
              >
                {activeSort === 'heat' ? '🌶 Hottest first' : 'Sort by 🌶'}
              </button>
            )}
          </div>

          {group.items.map((item) => {
            const catMeta = CATEGORIES[item.category] || { color: '#999', label: item.category };
            const plat = PLATFORMS.find((p) => p.name === item.platform);
            return (
              <div data-dc="platform-row" key={item._id} style={{
                display: 'flex', gap: 16, padding: '16px 0',
                borderBottom: '1px solid #f5f5f5',
              }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, width: 16, flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: catMeta.color, flexShrink: 0,
                  }} />
                  <div style={{ width: 2, flex: 1, background: '#f0f0f0', marginTop: 4 }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div data-dc="platform-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{formatTime(item.reportedAt)}</span>
                    {plat && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#0F172A' }}>
                        <img src={platformLogoUrl(plat.domain, 14)} alt="" width={14} height={14} style={{ borderRadius: 3 }} />
                        {plat.name}
                      </span>
                    )}
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      background: catMeta.color, textTransform: 'uppercase', letterSpacing: 0.3,
                    }}>
                      {catMeta.label}
                    </span>
                    {item.severity && item.severity !== 'Low' && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: item.severity === 'Critical' ? '#ef4444' : '#f59e0b',
                        textTransform: 'uppercase',
                      }}>
                        {item.severity}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.35, flex: 1 }}>
                      {item.title}
                    </h3>
                    <PepperIcons heat={item.heat} />
                  </div>

                  {item.summary && (
                    <p style={{
                      fontSize: 13, color: '#666', margin: '0 0 6px', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {item.summary}
                    </p>
                  )}

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: '#D2042D', textDecoration: 'none' }}
                  >
                    {item.sourceName || 'Source'} ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setVisibleCount((c) => c + pageIncrement)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: '1px solid #E0E0E0', background: '#fff', color: '#0F172A', cursor: 'pointer',
            }}
          >
            Load more
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
              ({updates.length - visibleCount} remaining)
            </span>
            <span style={{ fontSize: 14, lineHeight: 1 }}>↓</span>
          </button>
        </div>
      )}
    </div>
  );
}

// --- sub-components ---------------------------------------------------------

function LivePill() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
      background: '#fff', border: '1px solid #E0E0E0', borderRadius: 999,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: '#10B981',
        animation: 'dc-live-pulse 1.6s infinite',
      }} />
      Live
      <style>{`@keyframes dc-live-pulse {
        0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}
        70%{box-shadow:0 0 0 6px rgba(16,185,129,0)}
        100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}
      }`}</style>
    </div>
  );
}

function PlatformTab({ label, count, logoUrl, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        border: active ? `2px solid ${color || '#0F172A'}` : '1px solid #E0E0E0',
        background: active ? '#fff' : '#fff',
        color: '#0F172A', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        boxShadow: active ? `0 0 0 1px ${color || '#0F172A'}` : 'none',
      }}
    >
      {logoUrl && <img src={logoUrl} alt="" width={18} height={18} style={{ borderRadius: 4 }} />}
      {label}
      <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>{count}</span>
    </button>
  );
}

function CategoryPill({ label, color, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        border: `1px solid ${active ? (color || '#0F172A') : '#E0E0E0'}`,
        background: active ? (color || '#0F172A') : '#fff',
        color: active ? '#fff' : '#0F172A', cursor: 'pointer',
      }}
    >
      {color && !active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      {label}
      {count != null && count > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>}
    </button>
  );
}

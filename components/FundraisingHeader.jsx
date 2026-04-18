'use client';

/**
 * Fundraising Tracker header — headline, subtitle, stats cards, and filter bar.
 *
 * Interaction notes:
 *   - Sector is a dropdown (icon button) on the right of the headline — not a
 *     row of pills. Keeps the page from getting visually crowded.
 *   - Round filters are pills below the stats. They update the URL but pass
 *     scroll={false} so clicking one doesn't jump the scroll position.
 *   - The "LIVE" pill sits to the right of the headline and has a soft pulse.
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, Hash, Zap, Banknote, Target } from 'lucide-react';
import { getRoundMeta } from '@/lib/round-meta';

const STAT_ICONS = [
  { Icon: Hash,     color: '#6366F1' },
  { Icon: Zap,      color: '#0EA5E9' },
  { Icon: Banknote, color: '#10B981' },
  { Icon: Target,   color: '#F59E0B' },
];

function buildQuery(next) {
  const params = new URLSearchParams();
  if (next.round) params.set('round', next.round);
  if (next.sector) params.set('sector', next.sector);
  if (next.sort && next.sort !== 'date_desc') params.set('sort', next.sort);
  const qs = params.toString();
  // Absolute path so Next.js Link picks up `scroll={false}` properly.
  return qs ? `/fundraising-tracker?${qs}` : '/fundraising-tracker';
}

export default function FundraisingHeader({
  activeRound,
  activeSector,
  activeSort,
  sectorOptions,
  roundOptions,
  statsCards,
}) {
  const router = useRouter();
  // router.push with scroll:false is the only reliable way to keep scroll
  // locked in Next 14 App Router when the underlying page re-renders.
  const navTo = (href) => router.push(href, { scroll: false });
  return (
    <>
      {/* Top row: headline + sector dropdown + live pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>
          Fundraising Tracker
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SectorDropdown
            activeSector={activeSector}
            activeRound={activeRound}
            activeSort={activeSort}
            sectorOptions={sectorOptions}
          />
          <LivePill />
        </div>
      </div>

      <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px', maxWidth: 720 }}>
        Startup fundraising rounds and M&amp;A activity across tech, commerce, and finance — refreshed daily.
      </p>

      {/* Stats cards */}
      <div data-dc="stats-carousel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statsCards.map((c, i) => {
          const { Icon, color } = STAT_ICONS[i] || {};
          return (
            <div
              key={c.label}
              style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                {Icon && <Icon size={14} color={color} />}
                {c.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{c.value}</div>
              {c.sub && (
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{c.sub}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Round filter pills */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
          }}
        >
          Round
        </div>
        <div data-dc="filter-carousel" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <FilterPill
            onClick={() => navTo(buildQuery({ sector: activeSector, sort: activeSort }))}
            label="All"
            active={!activeRound}
          />
          {roundOptions.map(([r, n]) => {
            const meta = getRoundMeta(r);
            return (
              <FilterPill
                key={r}
                onClick={() => navTo(buildQuery({ round: r, sector: activeSector, sort: activeSort }))}
                label={`${r} (${n})`}
                active={activeRound === r}
                color={meta.color}
                Icon={meta.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Active sector crumb (if selected) */}
      {activeSector && (
        <div style={{ marginBottom: 16, fontSize: 13, color: '#666' }}>
          Sector: <strong style={{ color: '#0F172A' }}>{activeSector}</strong>
          <button
            onClick={() => navTo(buildQuery({ round: activeRound, sort: activeSort }))}
            style={{
              marginLeft: 8,
              color: '#D2042D',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            clear ×
          </button>
        </div>
      )}
    </>
  );
}

function FilterPill({ onClick, label, active, color, Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${active ? (color || '#0F172A') : '#E0E0E0'}`,
        background: active ? (color || '#0F172A') : '#fff',
        color: active ? '#fff' : '#0F172A',
        transition: 'background 120ms, border-color 120ms, color 120ms',
      }}
    >
      {Icon && <Icon size={13} color={active ? '#fff' : (color || '#666')} />}
      {label}
    </button>
  );
}

function SectorDropdown({ activeSector, activeRound, activeSort, sectorOptions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const navTo = (href) => {
    router.push(href, { scroll: false });
    setOpen(false);
  };

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const label = activeSector || 'All sectors';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: '#fff',
          border: '1px solid #E0E0E0',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: '#0F172A',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <SlidersHorizontal size={14} color="#666" />
        {label}
        <ChevronDown size={14} color="#666" />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            minWidth: 220,
            background: '#fff',
            border: '1px solid #E0E0E0',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <DropdownItem
            onClick={() => navTo(buildQuery({ round: activeRound, sort: activeSort }))}
            label="All sectors"
            active={!activeSector}
          />
          <div style={{ borderTop: '1px solid #f0f0f0' }} />
          {sectorOptions.map(([s, n]) => (
            <DropdownItem
              key={s}
              onClick={() => navTo(buildQuery({ round: activeRound, sector: s, sort: activeSort }))}
              label={s}
              count={n}
              active={activeSector === s}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '12px 16px',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? '#D2042D' : '#0F172A',
        background: active ? '#fef2f2' : '#fff',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span>{label}</span>
      {count != null && (
        <span style={{ fontSize: 11, color: '#999', marginLeft: 12 }}>{count}</span>
      )}
    </button>
  );
}

function LivePill() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        background: '#fff',
        border: '1px solid #E0E0E0',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#10B981',
          boxShadow: '0 0 0 0 rgba(16,185,129,0.7)',
          animation: 'dc-live-pulse 1.6s infinite',
        }}
      />
      Live
      <style jsx>{`
        @keyframes dc-live-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>
    </div>
  );
}

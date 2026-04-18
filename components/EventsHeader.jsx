'use client';

/**
 * Events Tracker header — headline, subtitle, stats cards, filter pills,
 * region dropdown, and active-filter breadcrumbs.
 *
 * Follows the same pattern as FundraisingHeader.jsx — all navigation via
 * router.push(href, { scroll: false }) so the page doesn't jump.
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, CalendarDays, Zap, ArrowRight, Globe } from 'lucide-react';
import { getEventTypeMeta } from '@/lib/event-meta';

function buildQuery({ type, region, month }) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (region) params.set('region', region);
  if (month) params.set('month', month);
  const qs = params.toString();
  return qs ? `/events?${qs}` : '/events';
}

export default function EventsHeader({
  activeType,
  activeRegion,
  activeMonth,
  regionOptions,
  typeOptions,
  monthOptions,
  statsCards,
}) {
  const router = useRouter();
  const navTo = (href) => router.push(href, { scroll: false });

  return (
    <>
      {/* Title row */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 24, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>
          Events Tracker
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RegionDropdown
            activeRegion={activeRegion}
            activeType={activeType}
            activeMonth={activeMonth}
            regionOptions={regionOptions}
          />
          <MonthDropdown
            activeMonth={activeMonth}
            activeType={activeType}
            activeRegion={activeRegion}
            monthOptions={monthOptions}
          />
          <LivePill />
        </div>
      </div>

      <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px', maxWidth: 720 }}>
        E-commerce conferences, expos, and summits worldwide — updated weekly.
      </p>

      {/* Stat cards */}
      <div data-dc="stats-carousel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statsCards.map((c, i) => {
          const icons = [
            { Icon: CalendarDays, color: '#6366F1' },
            { Icon: Zap,          color: '#0EA5E9' },
            { Icon: ArrowRight,   color: '#10B981' },
            { Icon: Globe,        color: '#F59E0B' },
          ];
          const { Icon, color } = icons[i] || {};
          return (
            <div key={c.label} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
              }}>
                {Icon && <Icon size={14} color={color} />}
                {c.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{c.value}</div>
              {c.sub && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{c.sub}</div>}
            </div>
          );
        })}
      </div>

      {/* Type filter pills */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Event type
        </div>
        <div data-dc="filter-carousel" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <FilterPill
            onClick={() => navTo(buildQuery({ region: activeRegion, month: activeMonth }))}
            label="All"
            active={!activeType}
          />
          {typeOptions.map(([t, n]) => {
            const meta = getEventTypeMeta(t);
            return (
              <FilterPill
                key={t}
                onClick={() => navTo(buildQuery({ type: t, region: activeRegion, month: activeMonth }))}
                label={`${t} (${n})`}
                active={activeType === t}
                color={meta.color}
                Icon={meta.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Active filter breadcrumbs */}
      {(activeRegion || activeMonth) && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, fontSize: 13, color: '#666' }}>
          {activeRegion && (
            <span>
              Region: <strong style={{ color: '#0F172A' }}>{activeRegion}</strong>
              <button
                onClick={() => navTo(buildQuery({ type: activeType, month: activeMonth }))}
                style={{ marginLeft: 8, color: '#D2042D', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
              >
                clear ×
              </button>
            </span>
          )}
          {activeMonth && (
            <span>
              Month: <strong style={{ color: '#0F172A' }}>{formatMonth(activeMonth)}</strong>
              <button
                onClick={() => navTo(buildQuery({ type: activeType, region: activeRegion }))}
                style={{ marginLeft: 8, color: '#D2042D', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
              >
                clear ×
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
}

/* ── Helpers ──────────────────────────────────── */

function formatMonth(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

function FilterPill({ onClick, label, active, color, Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
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

/* ── Region dropdown ────────────────────────── */

function RegionDropdown({ activeRegion, activeType, activeMonth, regionOptions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const navTo = (href) => { router.push(href, { scroll: false }); setOpen(false); };

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
          fontSize: 13, fontWeight: 600, color: '#0F172A', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <Globe size={14} color="#666" />
        {activeRegion || 'All regions'}
        <ChevronDown size={14} color="#666" />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: 220,
          background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden',
        }}>
          <DropdownItem
            onClick={() => navTo(buildQuery({ type: activeType, month: activeMonth }))}
            label="All regions" active={!activeRegion}
          />
          <div style={{ borderTop: '1px solid #f0f0f0' }} />
          {regionOptions.map(([r, n]) => (
            <DropdownItem
              key={r}
              onClick={() => navTo(buildQuery({ type: activeType, region: r, month: activeMonth }))}
              label={r} count={n} active={activeRegion === r}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Month dropdown ─────────────────────────── */

function MonthDropdown({ activeMonth, activeType, activeRegion, monthOptions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const navTo = (href) => { router.push(href, { scroll: false }); setOpen(false); };

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
          fontSize: 13, fontWeight: 600, color: '#0F172A', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <CalendarDays size={14} color="#666" />
        {activeMonth ? formatMonth(activeMonth) : 'All months'}
        <ChevronDown size={14} color="#666" />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: 180,
          background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden',
          maxHeight: 320, overflowY: 'auto',
        }}>
          <DropdownItem
            onClick={() => navTo(buildQuery({ type: activeType, region: activeRegion }))}
            label="All months" active={!activeMonth}
          />
          <div style={{ borderTop: '1px solid #f0f0f0' }} />
          {monthOptions.map(([m, n]) => (
            <DropdownItem
              key={m}
              onClick={() => navTo(buildQuery({ type: activeType, region: activeRegion, month: m }))}
              label={formatMonth(m)} count={n} active={activeMonth === m}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Shared dropdown item ───────────────────── */

function DropdownItem({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
        padding: '12px 16px', fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? '#D2042D' : '#0F172A', background: active ? '#fef2f2' : '#fff',
        border: 'none', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span>{label}</span>
      {count != null && <span style={{ fontSize: 11, color: '#999', marginLeft: 12 }}>{count}</span>}
    </button>
  );
}

/* ── Live pill ──────────────────────────────── */

function LivePill() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
      background: '#fff', border: '1px solid #E0E0E0', borderRadius: 999,
      fontSize: 11, fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.6,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: '#10B981',
        boxShadow: '0 0 0 0 rgba(16,185,129,0.7)', animation: 'dc-live-pulse 1.6s infinite',
      }} />
      Live
      <style>{`
        @keyframes dc-live-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>
    </div>
  );
}

'use client';

/**
 * Events Tracker card list — search, detailed event cards, load-more pagination.
 *
 * Each card shows: date chip, name, location, type badge, cost, tags,
 * description summary, and a visit button.
 */

import { useState } from 'react';
import { Search, ExternalLink, MapPin, DollarSign } from 'lucide-react';
import { getEventTypeMeta } from '@/lib/event-meta';

const PAGE_SIZE = 12;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDateRange(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = MONTHS[s.getMonth()];
  const sDay = s.getDate();
  if (start === end) return { month: sMonth, days: String(sDay) };
  if (s.getMonth() === e.getMonth()) return { month: sMonth, days: `${sDay}–${e.getDate()}` };
  return { month: sMonth, days: `${sDay}–${MONTHS[e.getMonth()]} ${e.getDate()}` };
}

function fmtFullDate(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sStr = `${MONTHS[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;
  if (start === end) return sStr;
  const eStr = `${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  return `${sStr} – ${eStr}`;
}

function trimSummary(text, max = 160) {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max);
  const dot = cut.lastIndexOf('.');
  if (dot > max * 0.5) return cut.slice(0, dot + 1);
  return cut.replace(/\s+\S*$/, '') + '...';
}

export default function EventsTable({ events }) {
  const [search, setSearch] = useState('');
  const [shown, setShown] = useState(PAGE_SIZE);

  const q = search.toLowerCase().trim();
  const filtered = q
    ? events.filter((ev) => {
        const blob = [ev.name, ev.location, ev.country, ev.type, ev.description, ...(ev.tags || [])].join(' ').toLowerCase();
        return q.split(/\s+/).every((w) => blob.includes(w));
      })
    : events;

  const visible = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  return (
    <div>
      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8,
        padding: '10px 16px', marginBottom: 16,
      }}>
        <Search size={16} color="#999" />
        <input
          type="text"
          placeholder="Search events, locations, tags..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShown(PAGE_SIZE); }}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 14,
            background: 'transparent', color: '#0F172A',
          }}
        />
        <span style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Event cards */}
      <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden' }}>
        {visible.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#999', fontSize: 14 }}>
            No events match these filters.
          </div>
        )}
        {visible.map((ev, i) => {
          const { month, days } = fmtDateRange(ev.startDate, ev.endDate);
          const meta = getEventTypeMeta(ev.type);
          const Icon = meta.icon;
          const isPast = new Date(ev.endDate + 'T23:59:59') < new Date();

          return (
            <div
              data-dc="events-card"
              key={ev._id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 24px',
                borderBottom: i < visible.length - 1 ? '1px solid #f0f0f0' : 'none',
                opacity: isPast ? 0.55 : 1,
              }}
            >
              {/* Date chip */}
              <div data-dc="events-date-chip" style={{
                flexShrink: 0, minWidth: 72, textAlign: 'center',
                background: isPast ? '#f1f5f9' : '#EEF2FF',
                borderRadius: 8, padding: '10px 10px',
                border: `1px solid ${isPast ? '#e2e8f0' : '#C7D2FE'}`,
                whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isPast ? '#94a3b8' : '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {month}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: isPast ? '#94a3b8' : '#0F172A', lineHeight: 1.2, marginTop: 2 }}>
                  {days}
                </div>
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + type badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{ev.name}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, color: meta.color, textTransform: 'uppercase',
                    letterSpacing: 0.5, background: `${meta.color}12`, padding: '3px 8px', borderRadius: 4,
                  }}>
                    <Icon size={11} color={meta.color} />
                    {ev.type}
                  </span>
                  {isPast && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Past
                    </span>
                  )}
                </div>

                {/* Location + date + cost row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#666', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} color="#999" />
                    {ev.location}
                  </span>
                  <span>{fmtFullDate(ev.startDate, ev.endDate)}</span>
                  {ev.cost && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      fontWeight: 600,
                      color: ev.cost === 'Free' ? '#10B981' : '#0F172A',
                    }}>
                      {ev.cost !== 'Free' && <DollarSign size={11} color="#999" />}
                      {ev.cost}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {trimSummary(ev.description)}
                </p>

                {/* Tags */}
                {ev.tags && ev.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ev.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10, fontWeight: 600, color: '#666',
                          background: '#f1f5f9', padding: '3px 8px', borderRadius: 4,
                          textTransform: 'lowercase',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Visit button */}
              <a
                href={ev.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  color: '#0F172A', background: '#f8fafc', border: '1px solid #E0E0E0',
                  textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'center',
                }}
              >
                Visit
                <ExternalLink size={12} color="#666" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => setShown((s) => s + PAGE_SIZE)}
            style={{
              padding: '10px 32px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: '#0F172A', background: '#fff', border: '1px solid #E0E0E0',
              cursor: 'pointer',
            }}
          >
            Load more ({filtered.length - shown} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

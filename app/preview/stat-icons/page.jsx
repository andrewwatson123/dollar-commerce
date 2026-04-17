/**
 * Preview: Stat card icon design options for the Fundraising Tracker header.
 * Navigate to /preview/stat-icons to compare.
 */

'use client';

import {
  BarChart3, Calendar, DollarSign, TrendingUp,
  Activity, Zap, Rocket, Target,
  CircleDot, Hash, Banknote, Landmark,
} from 'lucide-react';

const SERIF = "Georgia, 'Times New Roman', serif";

const cards = [
  { label: 'Events tracked', value: '3,119' },
  { label: 'Last 30 days',   value: '250' },
  { label: 'Raised (30d)',   value: '$23.6B' },
  { label: 'IPOs upcoming',  value: '7', sub: 'MYXXU · 04-14' },
];

/* ── Icon sets ────────────────────────────────── */

const iconSets = {
  'Option A — Colored icon circles': {
    desc: 'Each card gets a distinct colored circle with a white icon. Bold, dashboard-feel.',
    icons: [
      { Icon: BarChart3,   bg: '#6366F1', color: '#fff' },
      { Icon: Calendar,    bg: '#0EA5E9', color: '#fff' },
      { Icon: DollarSign,  bg: '#10B981', color: '#fff' },
      { Icon: Rocket,      bg: '#F59E0B', color: '#fff' },
    ],
    render: 'circle',
  },
  'Option B — Muted tinted backgrounds': {
    desc: 'Softer pastel circles with colored icons. Lighter, editorial feel.',
    icons: [
      { Icon: Activity,    bg: '#EEF2FF', color: '#6366F1' },
      { Icon: Calendar,    bg: '#E0F2FE', color: '#0284C7' },
      { Icon: Banknote,    bg: '#ECFDF5', color: '#059669' },
      { Icon: TrendingUp,  bg: '#FEF3C7', color: '#D97706' },
    ],
    render: 'circle',
  },
  'Option C — Red dot accent + gray icon': {
    desc: 'On-brand red dot left border with a subtle gray icon. Matches the DC branding system.',
    icons: [
      { Icon: BarChart3,   color: '#CBD5E1' },
      { Icon: Calendar,    color: '#CBD5E1' },
      { Icon: DollarSign,  color: '#CBD5E1' },
      { Icon: Rocket,      color: '#CBD5E1' },
    ],
    render: 'redDot',
  },
  'Option D — Inline colored icon, no circle': {
    desc: 'Small colored icon inline next to the label. Minimal, no circles.',
    icons: [
      { Icon: Hash,        color: '#6366F1' },
      { Icon: Zap,         color: '#0EA5E9' },
      { Icon: Banknote,    color: '#10B981' },
      { Icon: Target,      color: '#F59E0B' },
    ],
    render: 'inline',
  },
};

export default function StatIconsPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '48px 40px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>Stat Card Icon Options</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 48px' }}>
          Design options for adding icons to the fundraising tracker stat tiles.
        </p>

        {Object.entries(iconSets).map(([title, opt]) => (
          <section key={title} style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 16px', fontStyle: 'italic' }}>{opt.desc}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {cards.map((c, i) => {
                const ic = opt.icons[i];
                return (
                  <StatCard key={c.label} card={c} icon={ic} mode={opt.render} />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function StatCard({ card, icon, mode }) {
  const { Icon, bg, color } = icon;

  if (mode === 'redDot') {
    return (
      <div style={{
        background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20,
        borderLeft: '3px solid #D2042D',
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <Icon size={22} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {card.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{card.value}</div>
          {card.sub && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{card.sub}</div>}
        </div>
      </div>
    );
  }

  if (mode === 'inline') {
    return (
      <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
        }}>
          <Icon size={14} color={color} />
          {card.label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{card.value}</div>
        {card.sub && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{card.sub}</div>}
      </div>
    );
  }

  // circle mode (A and B)
  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {card.label}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{card.value}</div>
      {card.sub && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{card.sub}</div>}
    </div>
  );
}

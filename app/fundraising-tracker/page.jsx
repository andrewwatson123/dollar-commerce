import { getFundraisingEvents, getFundraisingStats } from '@/sanity/lib/queries';
import SiteHeader from '@/components/SiteHeader';
import FundraisingHeader from '@/components/FundraisingHeader';
import FundraisingTable from '@/components/FundraisingTable';
import { getTopBarData } from '@/lib/topbar-data';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 300;
export const metadata = { title: 'Fundraising Tracker — Dollar Commerce' };

async function getIpoData() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5180';
    const res = await fetch(`${base}/api/ipos`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function fmtUsd(n) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}


export default async function FundraisingTrackerPage({ searchParams }) {
  const round = searchParams?.round || undefined;
  const sector = searchParams?.sector || undefined;
  const sort = searchParams?.sort || 'date_desc';

  const [events, stats, topBar, ipoData] = await Promise.all([
    getFundraisingEvents({ limit: 200, round, sector, sort }),
    getFundraisingStats(),
    getTopBarData(),
    getIpoData(),
  ]);

  const roundCounts = {};
  (stats.byRound || []).forEach((e) => {
    if (!e.round) return;
    roundCounts[e.round] = (roundCounts[e.round] || 0) + 1;
  });
  const sectorCounts = {};
  (stats.bySector || []).forEach((e) => {
    if (!e.sector) return;
    sectorCounts[e.sector] = (sectorCounts[e.sector] || 0) + 1;
  });

  const roundOptions = Object.entries(roundCounts).sort((a, b) => b[1] - a[1]);
  const sectorOptions = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);

  const ipoCount = ipoData?.upcomingCount ?? 0;
  const nextIpo = ipoData?.upcoming?.[0];
  const ipoLabel = nextIpo
    ? `${nextIpo.symbol ?? nextIpo.name?.slice(0, 12)} · ${nextIpo.date?.slice(5)}`
    : '';

  const statsCards = [
    { label: 'Events tracked',    value: stats.total?.toLocaleString() ?? '0' },
    { label: 'Last 30 days',      value: stats.last30d?.toLocaleString() ?? '0' },
    { label: 'Raised (30d)',      value: fmtUsd(stats.totalAmountLast30d || 0) },
    { label: 'IPOs upcoming',     value: String(ipoCount), sub: ipoLabel },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 80px' }}>
        <FundraisingHeader
          activeRound={round}
          activeSector={sector}
          activeSort={sort}
          sectorOptions={sectorOptions}
          roundOptions={roundOptions}
          statsCards={statsCards}
        />
        <FundraisingTable
          events={events}
          currentSort={sort}
          activeRound={round}
          activeSector={sector}
        />
        <p style={{ fontSize: 12, color: '#999', marginTop: 16 }}>
          Data is scraped from public news feeds and parsed heuristically. Amounts, rounds, and
          company names can be imperfect — use the source link for the full story.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

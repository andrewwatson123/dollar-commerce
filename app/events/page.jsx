import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import EventsHeader from '@/components/EventsHeader';
import EventsTable from '@/components/EventsTable';
import { getTopBarData } from '@/lib/topbar-data';
import { EVENTS_DATA } from '@/lib/events-data';

export const revalidate = 300;
export const metadata = {
  title: 'E-Commerce Events Calendar — Conferences, Summits & Expos',
  description:
    'Comprehensive calendar of e-commerce conferences, summits, and expos worldwide. Shoptalk, NRF Big Show, CommerceNext, Prosper, eTail, and more. Filter by region, type, and date.',
  alternates: { canonical: '/events' },
  openGraph: {
    title: 'E-Commerce Events Calendar',
    description: 'Conferences, summits, and expos across the global e-commerce industry.',
    url: 'https://dollarcommerce.co/events',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Commerce Events Calendar',
    description: 'Conferences, summits, and expos across e-commerce.',
  },
};

export default async function EventsPage({ searchParams }) {
  const type = searchParams?.type || undefined;
  const region = searchParams?.region || undefined;
  const month = searchParams?.month || undefined;

  const topBar = await getTopBarData();

  // Filter events
  let events = EVENTS_DATA;
  if (type) events = events.filter((e) => e.type === type);
  if (region) events = events.filter((e) => e.region === region);
  if (month) events = events.filter((e) => e.startDate.startsWith(month));

  // Sort: upcoming first (by startDate ascending), past events at end
  const now = new Date();
  events = [...events].sort((a, b) => {
    const aEnd = new Date(a.endDate + 'T23:59:59');
    const bEnd = new Date(b.endDate + 'T23:59:59');
    const aPast = aEnd < now;
    const bPast = bEnd < now;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return new Date(a.startDate) - new Date(b.startDate);
  });

  // Compute stats from full data (unfiltered)
  const all = EVENTS_DATA;
  const today = new Date();
  const in30d = new Date(today.getTime() + 30 * 86400000);
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const totalEvents = all.length;
  const thisMonthCount = all.filter((e) => e.startDate.startsWith(thisMonth)).length;
  const upcoming30d = all.filter((e) => {
    const d = new Date(e.startDate + 'T00:00:00');
    return d >= today && d <= in30d;
  }).length;
  const countries = new Set(all.map((e) => e.country)).size;

  const statsCards = [
    { label: 'Total events', value: String(totalEvents) },
    { label: 'This month', value: String(thisMonthCount) },
    { label: 'Upcoming 30d', value: String(upcoming30d) },
    { label: 'Countries', value: String(countries) },
  ];

  // Build filter option counts from full data
  const typeCounts = {};
  all.forEach((e) => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const typeOptions = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const regionCounts = {};
  all.forEach((e) => { regionCounts[e.region] = (regionCounts[e.region] || 0) + 1; });
  const regionOptions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);

  const monthCounts = {};
  all.forEach((e) => {
    const ym = e.startDate.slice(0, 7);
    monthCounts[ym] = (monthCounts[ym] || 0) + 1;
  });
  const monthOptions = Object.entries(monthCounts).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 80px' }}>
        <EventsHeader
          activeType={type}
          activeRegion={region}
          activeMonth={month}
          typeOptions={typeOptions}
          regionOptions={regionOptions}
          monthOptions={monthOptions}
          statsCards={statsCards}
        />
        <EventsTable events={events} />
        <p style={{ fontSize: 12, color: '#999', marginTop: 16 }}>
          Event data is compiled from public sources. Dates, costs, and locations are subject to change —
          visit the event website for the latest details.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

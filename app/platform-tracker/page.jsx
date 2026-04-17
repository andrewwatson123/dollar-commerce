import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PlatformTracker from '@/components/PlatformTracker';
import { getPlatformUpdates, getPlatformStats } from '@/sanity/lib/queries';
import { getTopBarData } from '@/lib/topbar-data';

export const revalidate = 300;
export const metadata = {
  title: 'Platform Tracker — Amazon, Shopify, Meta & Google Updates',
  description:
    'Every important update from Amazon, Shopify, Meta, Google, TikTok, and Pinterest — features, policy changes, outages, and API releases. Filter by platform and severity. Built for e-commerce operators.',
  alternates: { canonical: '/platform-tracker' },
  openGraph: {
    title: 'Platform Tracker — Amazon, Shopify, Meta & Google Updates',
    description: 'Live updates across the platforms your e-commerce business runs on.',
    url: 'https://dollarcommerce.co/platform-tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platform Tracker — Amazon, Shopify, Meta & Google',
    description: 'Live updates across the platforms your e-commerce business runs on.',
  },
};

export default async function PlatformTrackerPage({ searchParams }) {
  const platform = searchParams?.platform || undefined;
  const category = searchParams?.category || undefined;
  const sort = searchParams?.sort || 'date';

  const [updates, stats, topBar] = await Promise.all([
    getPlatformUpdates({ platform, category, sort, limit: 200 }),
    getPlatformStats(),
    getTopBarData(),
  ]);

  // Aggregate counts
  const platformCounts = {};
  (stats.byPlatform || []).forEach((e) => {
    platformCounts[e.p] = (platformCounts[e.p] || 0) + 1;
  });
  const categoryCounts = {};
  (stats.byCategory || []).forEach((e) => {
    categoryCounts[e.c] = (categoryCounts[e.c] || 0) + 1;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 40px 80px' }}>
        <PlatformTracker
          updates={updates}
          total={stats.total || 0}
          platformCounts={platformCounts}
          categoryCounts={categoryCounts}
          activePlatform={platform}
          activeCategory={category}
          activeSort={sort}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

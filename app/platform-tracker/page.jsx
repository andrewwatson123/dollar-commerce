import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PlatformTracker from '@/components/PlatformTracker';
import { getPlatformUpdates, getPlatformStats } from '@/sanity/lib/queries';
import { getTopBarData } from '@/lib/topbar-data';

export const revalidate = 300;
export const metadata = { title: 'Platform Tracker — Dollar Commerce' };

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

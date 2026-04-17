import DCHomepageDesktop from '@/components/DCHomepageDesktop';
import { getHomepageData, getLatestArticles, getMostReadArticles } from '@/sanity/lib/queries';
import { getTopBarData } from '@/lib/topbar-data';

export const revalidate = 60;

async function getDcIndex() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5180';
    const res = await fetch(`${base}/api/dc-index`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const [data, dcIndex, topBar, latestArticles, mostReadArticles] = await Promise.all([
    getHomepageData({ limit: 6 }),
    getDcIndex(),
    getTopBarData(),
    getLatestArticles(8),
    getMostReadArticles(5),
  ]);

  return (
    <DCHomepageDesktop
      heroArticle={data.hero}
      topStories={data.topStories}
      founderFeatures={data.features}
      dcIndex={dcIndex}
      dcIndexValue={topBar.dcIndexValue}
      dcIndexChange={topBar.dcIndexChange}
      latestArticle={topBar.latestArticle}
      latestArticles={latestArticles}
      mostReadArticles={mostReadArticles}
    />
  );
}

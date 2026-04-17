import { getAllArticles } from '@/sanity/lib/queries';
import SiteHeader from '@/components/SiteHeader';
import ArticleCard from '@/components/ArticleCard';
import { getTopBarData } from '@/lib/topbar-data';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 60;

export const metadata = { title: 'Top Articles — Dollar Commerce' };

export default async function TopArticlesPage() {
  const [articles, topBar] = await Promise.all([getAllArticles(), getTopBarData()]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px 80px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
          Top Articles
        </h1>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 32px' }}>
          Ranked by views, then by publication date. {articles.length} articles total.
        </p>
        <div>
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} variant="stacked" />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

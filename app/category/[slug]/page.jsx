import { notFound } from 'next/navigation';
import { getArticlesByCategory, getAllCategories } from '@/sanity/lib/queries';
import SiteHeader from '@/components/SiteHeader';
import ArticleCard from '@/components/ArticleCard';
import { getTopBarData } from '@/lib/topbar-data';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 60;

export async function generateStaticParams() {
  const cats = await getAllCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const cats = await getAllCategories();
  const cat = cats.find((c) => c.slug === params.slug);
  const name = cat?.title ?? 'Category';
  const description = cat?.description ||
    `${name} articles on Dollar Commerce — analysis, news, and intelligence on ${name.toLowerCase()} in the e-commerce industry.`;
  const canonical = `/category/${params.slug}`;
  return {
    title: `${name} — E-Commerce Analysis`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} — Dollar Commerce`,
      description,
      url: `https://dollarcommerce.co${canonical}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Dollar Commerce`,
      description,
    },
  };
}

export default async function CategoryPage({ params }) {
  const cats = await getAllCategories();
  const cat = cats.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const [articles, topBar] = await Promise.all([
    getArticlesByCategory(params.slug),
    getTopBarData(),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px 80px' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: cat.color || '#D2042D',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          Category
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', margin: '0 0 32px' }}>
          {cat.title}
        </h1>
        <div>
          {articles.length === 0 && (
            <p style={{ color: '#666' }}>No articles in this category yet.</p>
          )}
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} variant="stacked" />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

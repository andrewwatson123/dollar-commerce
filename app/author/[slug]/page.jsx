import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getArticlesByAuthor, getAllAuthors } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import SiteHeader from '@/components/SiteHeader';
import ArticleCard from '@/components/ArticleCard';
import { getTopBarData } from '@/lib/topbar-data';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 60;

export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const authors = await getAllAuthors();
  const author = authors.find((a) => a.slug === params.slug);
  if (!author) return { title: 'Author not found' };
  const name = author.name;
  const bio = author.bio || `Articles and analysis by ${name} on Dollar Commerce — e-commerce industry intelligence.`;
  const canonical = `/author/${params.slug}`;
  const imageUrl = author.image ? urlFor(author.image).width(400).url() : undefined;
  return {
    title: `${name} — Author`,
    description: bio,
    alternates: { canonical },
    openGraph: {
      title: `${name} — Dollar Commerce`,
      description: bio,
      url: `https://dollarcommerce.co${canonical}`,
      type: 'profile',
      images: imageUrl ? [{ url: imageUrl, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${name} — Dollar Commerce`,
      description: bio,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function AuthorPage({ params }) {
  const authors = await getAllAuthors();
  const author = authors.find((a) => a.slug === params.slug);
  if (!author) notFound();

  const [articles, topBar] = await Promise.all([
    getArticlesByAuthor(params.slug),
    getTopBarData(),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px 80px' }}>
        {/* Author profile card */}
        <div style={{
          background: '#fff', border: '1px solid #E0E0E0', borderRadius: 12,
          padding: 32, marginBottom: 48,
        }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
            {author.avatar?.asset && (
              <Image
                src={urlFor(author.avatar).width(200).height(200).url()}
                alt={author.name}
                width={88}
                height={88}
                style={{ borderRadius: '50%', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>
                {author.name}
              </h1>
              {author.bio && (
                <p style={{ fontSize: 15, color: '#666', margin: '0 0 14px', lineHeight: 1.6 }}>
                  {author.bio}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <AuthorPill>{articles.length} articles</AuthorPill>
                {author.twitter && <AuthorPill href={`https://x.com/${author.twitter.replace('@','')}`}>@{author.twitter.replace('@','')}</AuthorPill>}
              </div>
            </div>
          </div>
        </div>
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

function AuthorPill({ children, href }) {
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    background: '#f5f5f5', color: '#666', border: '1px solid #E0E0E0',
    textDecoration: 'none',
  };
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={style}>{children}</a>;
  return <span style={style}>{children}</span>;
}

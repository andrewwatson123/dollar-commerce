import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticleSlugs } from '@/sanity/lib/queries';
import { urlFor } from '@/sanity/lib/image';
import PortableArticleBody from '@/components/PortableArticleBody';
import SiteHeader from '@/components/SiteHeader';
import BookmarkButton from '@/components/BookmarkButton';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import ViewTracker from '@/components/ViewTracker';
import { getTopBarData } from '@/lib/topbar-data';
import SiteFooter from '@/components/SiteFooter';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Not found' };
  const description = article.excerpt || article.subtitle ||
    `${article.title} — e-commerce analysis on Dollar Commerce.`;
  const canonical = `/article/${params.slug}`;
  const imageUrl = article.mainImage?.asset?.url || article.imageUrl;
  return {
    title: article.title,
    description,
    alternates: { canonical },
    authors: article.author?.name ? [{ name: article.author.name }] : undefined,
    openGraph: {
      title: article.title,
      description,
      url: `https://dollarcommerce.co${canonical}`,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      section: article.category?.title,
      images: imageUrl ? [{ url: imageUrl, alt: article.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ArticlePage({ params }) {
  const [article, topBar] = await Promise.all([
    getArticleBySlug(params.slug),
    getTopBarData(),
  ]);
  if (!article) notFound();

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <ViewTracker slug={article.slug} />

      <article
        data-dc="article-body"
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '48px 40px 80px',
        }}
      >
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: article.category.color || '#D2042D',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              textDecoration: 'none',
            }}
          >
            {article.category.title}
          </Link>
        )}

        <h1
          data-dc="article-title"
          style={{
            fontSize: 34,
            lineHeight: 1.2,
            fontWeight: 700,
            margin: '16px 0 16px',
            color: '#0F172A',
          }}
        >
          {article.title}
        </h1>

        {article.subtitle && (
          <p style={{ fontSize: 20, lineHeight: 1.5, color: '#555', margin: '0 0 24px' }}>
            {article.subtitle}
          </p>
        )}

        <div
          data-dc="article-meta"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 14,
            color: '#666',
            padding: '16px 0',
            borderTop: '1px solid #E0E0E0',
            borderBottom: '1px solid #E0E0E0',
            marginBottom: 32,
          }}
        >
          {article.author && (
            <Link
              href={`/author/${article.author.slug}`}
              style={{ fontWeight: 600, color: '#0F172A', textDecoration: 'none' }}
            >
              {article.author.name}
            </Link>
          )}
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <div style={{ flex: 1 }} />
          <LikeButton slug={article.slug} initialCount={article.likeCount || 0} size={20} color="#0F172A" />
          <BookmarkButton article={article} size={22} color="#0F172A" />
        </div>

        {article.heroImage?.asset && (
          <figure data-dc="article-hero" style={{ margin: '0 0 40px' }}>
            <Image
              src={urlFor(article.heroImage).width(1200).url()}
              alt={article.heroImage.alt || article.title}
              width={1200}
              height={675}
              style={{ width: '100%', height: 'auto', borderRadius: 4 }}
              priority
            />
            {article.heroImage.caption && (
              <figcaption
                style={{ fontSize: 13, color: '#666', marginTop: 8, textAlign: 'center' }}
              >
                {article.heroImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        <PortableArticleBody value={article.body} />

        {article.substackUrl && (
          <div
            style={{
              marginTop: 48,
              fontSize: 13,
              color: '#999',
              borderTop: '1px solid #E0E0E0',
              paddingTop: 16,
            }}
          >
            Originally published on{' '}
            <a href={article.substackUrl} target="_blank" rel="noreferrer" style={{ color: '#D2042D' }}>
              Substack
            </a>
            .
          </div>
        )}

        <Comments term={article.slug} />
      </article>
      <SiteFooter />
    </div>
  );
}

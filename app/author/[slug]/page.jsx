import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  const role = author.role ? `${author.role}` : 'Writer at Dollar Commerce';
  const canonical = `/author/${params.slug}`;

  // Prefer explicit bio; fall back to a generated description that includes
  // the role + location so search snippets are informative.
  const description = author.bio
    || [
      `Articles and analysis by ${name}`,
      role !== 'Writer at Dollar Commerce' ? role : null,
      author.location ? `Based in ${author.location}.` : null,
      'E-commerce industry intelligence on Dollar Commerce.',
    ].filter(Boolean).join('. ');

  const imageUrl = author.avatarUrl
    || (author.avatar ? urlFor(author.avatar).width(400).url() : undefined);

  return {
    title: `${name} — ${role}`,
    description,
    keywords: [
      name, role, 'e-commerce writer', 'Dollar Commerce',
      'DTC', 'e-commerce analysis', 'Dollar Commerce author',
    ].filter(Boolean),
    alternates: { canonical },
    authors: [{ name }],
    openGraph: {
      title: `${name} — ${role}`,
      description,
      url: `https://dollarcommerce.co${canonical}`,
      siteName: 'Dollar Commerce',
      type: 'profile',
      locale: 'en_US',
      images: imageUrl ? [{ url: imageUrl, width: 400, height: 400, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${role}`,
      description,
      site: '@dollarcommerce',
      creator: author.twitter ? `@${author.twitter.replace('@', '')}` : '@dollarcommerce',
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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

  const avatarSrc = author.avatar?.asset
    ? urlFor(author.avatar).width(320).height(320).fit('crop').url()
    : author.avatarUrl || null;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />

      <main data-dc="page-main" style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px 80px' }}>
        {/* ─── Author profile header ───────────────────────────── */}
        <section
          data-dc="author-profile"
          style={{
            background: '#fff',
            border: '1px solid #E0E0E0',
            borderRadius: 16,
            padding: 36,
            marginBottom: 40,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 28,
            boxShadow: '0 1px 0 rgba(15,23,42,0.02), 0 20px 40px -24px rgba(15,23,42,0.08)',
          }}
        >
          {/* Avatar */}
          {avatarSrc && (
            <div
              data-dc="author-avatar"
              style={{
                width: 128,
                height: 128,
                flexShrink: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 0 0 4px #F4F1EA, 0 0 0 5px #E0E0E0',
              }}
            >
              <Image
                src={avatarSrc}
                alt={author.name}
                fill
                sizes="128px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          )}

          {/* Text + metadata */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Kicker */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#D2042D',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: 8,
              }}
            >
              Writer
            </div>

            <h1
              data-dc="h1-page"
              style={{
                fontSize: 34,
                fontWeight: 800,
                margin: '0 0 6px',
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {author.name}
            </h1>

            {author.role && (
              <div
                style={{
                  fontSize: 15,
                  color: '#475569',
                  fontWeight: 500,
                  marginBottom: 14,
                }}
              >
                {author.role}
              </div>
            )}

            {author.bio && (
              <p
                style={{
                  fontSize: 15,
                  color: '#64748B',
                  margin: '0 0 18px',
                  lineHeight: 1.65,
                  maxWidth: 620,
                }}
              >
                {author.bio}
              </p>
            )}

            {/* Meta row: pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Pill>
                {articles.length} article{articles.length === 1 ? '' : 's'}
              </Pill>
              {author.location && <Pill>{author.location}</Pill>}
              {author.twitter && (
                <Pill href={`https://x.com/${author.twitter.replace('@', '')}`}>
                  <XIcon />&nbsp;@{author.twitter.replace('@', '')}
                </Pill>
              )}
              {author.linkedin && (
                <Pill href={author.linkedin}>
                  <LinkedInIcon />&nbsp;LinkedIn
                </Pill>
              )}
              {author.website && (
                <Pill href={author.website}>
                  <WebsiteIcon />&nbsp;Website
                </Pill>
              )}
            </div>
          </div>
        </section>

        {/* ─── Articles by this author ───────────────────────── */}
        {articles.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#D2042D',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: 10,
                borderBottom: '2px solid #0F172A',
                marginBottom: 12,
              }}
            >
              Recent articles
            </div>
            <div>
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} variant="stacked" />
              ))}
            </div>
          </div>
        )}

        {articles.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94A3B8',
              fontSize: 14,
            }}
          >
            No articles published yet — check back soon.
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Pill({ children, href }) {
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 14px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: '#F8FAFC',
    color: '#475569',
    border: '1px solid #E2E8F0',
    textDecoration: 'none',
    transition: 'border-color 150ms, color 150ms',
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}>
        {children}
      </a>
    );
  }
  return <span style={style}>{children}</span>;
}

function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0h.01z" />
    </svg>
  );
}
function WebsiteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

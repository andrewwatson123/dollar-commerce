import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ArticleCard({ article, variant = 'compact' }) {
  if (!article) return null;
  const { slug, title, excerpt, publishedAt, category, author, heroImage, likeCount } = article;

  if (variant === 'stacked') {
    return (
      <div data-dc="article-card-stacked" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 32,
        padding: '32px 0',
        borderBottom: '1px solid #E0E0E0',
      }}>
        <Link
          href={`/article/${slug}`}
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            background: '#eee',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            display: 'block',
          }}
        >
          {heroImage?.asset && (
            <Image
              src={urlFor(heroImage).width(800).height(600).url()}
              alt={title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 800px) 100vw, 400px"
            />
          )}
        </Link>
        <div>
          {category?.title && (
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: category.color || '#D2042D',
              textTransform: 'uppercase', letterSpacing: 0.5,
              marginBottom: 12,
            }}>
              {category.title}
            </div>
          )}
          <Link href={`/article/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 style={{
              fontSize: 28, fontWeight: 700, lineHeight: 1.25,
              margin: '0 0 12px', color: '#0F172A',
            }}>
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#444', margin: '0 0 16px' }}>
              {excerpt}
            </p>
          )}
          <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 12 }}>
            {author?.name && <span style={{ fontWeight: 600, color: '#0F172A' }}>{author.name}</span>}
            <span>•</span>
            <span>{formatDate(publishedAt)}</span>
            <div style={{ flex: 1 }} />
            <LikeButton slug={slug} initialCount={likeCount || 0} size={16} color="#999" />
            <BookmarkButton article={article} size={16} color="#999" />
          </div>
        </div>
      </div>
    );
  }

  // compact card
  return (
    <div style={{
      padding: '16px 0',
      borderBottom: '1px solid #E0E0E0',
    }}>
      {category?.title && (
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: category.color || '#D2042D',
          textTransform: 'uppercase', letterSpacing: 0.5,
          marginBottom: 6,
        }}>
          {category.title}
        </div>
      )}
      <Link href={`/article/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, margin: '0 0 8px' }}>{title}</h3>
      </Link>
      <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{author?.name} · {formatDate(publishedAt)}</span>
        <div style={{ flex: 1 }} />
        <LikeButton slug={slug} initialCount={likeCount || 0} size={14} color="#999" />
        <BookmarkButton article={article} size={14} color="#999" />
      </div>
    </div>
  );
}

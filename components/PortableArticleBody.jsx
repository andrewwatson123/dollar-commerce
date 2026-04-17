import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

const components = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const src = urlFor(value).width(1200).url();
      return (
        <figure style={{ margin: '32px 0' }}>
          <Image
            src={src}
            alt={value.alt || ''}
            width={1200}
            height={675}
            style={{ width: '100%', height: 'auto', borderRadius: 4 }}
          />
          {value.caption && (
            <figcaption
              style={{
                fontSize: 13,
                color: '#666',
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        style={{ color: '#D2042D', textDecoration: 'underline' }}
      >
        {children}
      </a>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 style={{ fontSize: 28, fontWeight: 700, marginTop: 40, marginBottom: 16, lineHeight: 1.25 }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12, lineHeight: 1.3 }}>
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '4px solid #D2042D',
          paddingLeft: 16,
          margin: '24px 0',
          fontStyle: 'italic',
          color: '#444',
        }}
      >
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p style={{ fontSize: 18, lineHeight: 1.7, margin: '0 0 20px', color: '#1a1a1a' }}>
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ fontSize: 18, lineHeight: 1.7, margin: '0 0 20px', paddingLeft: 24 }}>
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol style={{ fontSize: 18, lineHeight: 1.7, margin: '0 0 20px', paddingLeft: 24 }}>
        {children}
      </ol>
    ),
  },
};

export default function PortableArticleBody({ value }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Open Graph preview image for /dc-daily.
 *
 * 1200x630 PNG (Twitter/LinkedIn/Slack/Facebook all read this aspect).
 * Mirrors the on-site landing page composition: cream background,
 * centered portrait, "FROM THE EDITOR" eyebrow, name, signature quote,
 * white subscribe card with navy button.
 *
 * Cached at the edge; Twitter/Slack/etc cache their own copy for ~7 days.
 * To force them to refresh after a design change, re-share the URL through
 * the platform's card validator (e.g. cards-dev.twitter.com/validator).
 */
export async function GET() {
  // Edge runtime can't read /public — fetch the portrait remotely.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://dollarcommerce.co';
  let portraitData = null;
  try {
    const res = await fetch(`${origin}/writers/andrew-watson.png`);
    if (res.ok) {
      portraitData = await res.arrayBuffer();
    }
  } catch {
    // Fall back to no portrait if fetch fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4F1EA',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          padding: '48px 80px',
          position: 'relative',
        }}
      >
        {/* Soft red corner accent */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: 999,
            background:
              'radial-gradient(circle, rgba(214,4,47,0.08) 0%, transparent 65%)',
          }}
        />

        {/* Portrait */}
        {portraitData ? (
          <img
            // eslint-disable-next-line @next/next/no-img-element
            src={portraitData}
            alt="Andrew Watson"
            width={132}
            height={132}
            style={{
              width: 132,
              height: 132,
              borderRadius: 999,
              objectFit: 'cover',
              border: '4px solid #fff',
              boxShadow: '0 16px 32px -16px rgba(11,17,40,0.35)',
              marginBottom: 18,
            }}
          />
        ) : null}

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#D6042F',
            marginBottom: 12,
          }}
        >
          DC Daily &middot; From the Editor
        </div>

        {/* Name / wordmark */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#0B1128',
            letterSpacing: -1.5,
            lineHeight: 1,
            marginBottom: 18,
            fontFamily: 'Georgia, serif',
          }}
        >
          Andrew Watson
        </div>

        {/* Red separator dash above the quote */}
        <div
          style={{
            width: 32,
            height: 2,
            background: '#D6042F',
            marginBottom: 22,
          }}
        />

        {/* The personal signature quote, in place of the subscribe card */}
        <div
          style={{
            fontSize: 26,
            color: '#0B1128',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.45,
            fontFamily: 'Georgia, serif',
          }}
        >
          &ldquo;I wanted to create a safe place where young founders of
          tomorrow could listen in on the philosophy from the best founders,
          scientists, athletes around the World. For those who prefer
          straight-talk over buzzwords.&rdquo;
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Content-Disposition':
          'inline; filename="dc-daily-share-card.png"',
        // Tell platforms not to cache for too long so design iterations
        // propagate within a day rather than a week.
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    }
  );
}

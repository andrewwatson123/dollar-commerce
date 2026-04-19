import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Returns a 1200x630 PNG of the DC Daily subscribe card on a cream background.
// Great for share cards, static assets, or media kit use.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4F1EA',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            width: 520,
            background: '#0F172A',
            borderRadius: 14,
            padding: '36px 36px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 14,
              letterSpacing: -0.5,
            }}
          >
            DC Daily
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#cbd5e1',
              marginBottom: 24,
              lineHeight: 1.4,
            }}
          >
            Get the top stories delivered to your inbox every morning.
          </div>

          {/* Email input */}
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '16px 18px',
              fontSize: 16,
              color: '#94A3B8',
              marginBottom: 14,
              display: 'flex',
            }}
          >
            Your email
          </div>

          {/* Subscribe button */}
          <div
            style={{
              background: '#D2042D',
              color: '#fff',
              borderRadius: 8,
              padding: '16px 18px',
              fontSize: 17,
              fontWeight: 800,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Subscribe
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Content-Disposition': 'inline; filename="dc-daily-subscribe-card.png"',
      },
    }
  );
}

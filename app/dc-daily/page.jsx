import Link from 'next/link';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata = {
  title: 'DC Daily — The daily e-commerce briefing',
  description:
    'The daily e-commerce briefing, delivered to your inbox every weekday at 8am. DC Index, fundraising, platform updates, and the stories moving the industry — in 3 minutes.',
  alternates: { canonical: '/dc-daily' },
  openGraph: {
    title: 'DC Daily — The daily e-commerce briefing',
    description: 'Join thousands of e-commerce operators who start their day with DC Daily.',
    url: 'https://dollarcommerce.co/dc-daily',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DC Daily — The daily e-commerce briefing',
    description: 'Join thousands of e-commerce operators who start their day with DC Daily.',
  },
};

// Curated Unsplash tiles: retail / DTC / tech / shopping / commerce imagery.
// Kept as an even 8 columns × 6 rows = 48 tiles to create the dense mosaic feel.
const TILES = [
  // Row 1
  'photo-1556742031-c6961e8560b0', // delivery boxes
  'photo-1523275335684-37898b6baf30', // watch product shot
  'photo-1556742044-3c52d6e88c62', // shopping bags
  'photo-1556742400-b5b7c5121f3a', // woman online shopping
  'photo-1460925895917-afdab827c52f', // laptop analytics
  'photo-1522199710521-72d69614c702', // retail store rack
  'photo-1472851294608-062f824d29cc', // customer checkout
  'photo-1441986300917-64674bd600d8', // store window
  // Row 2
  'photo-1607082348824-0a96f2a4b9da', // phone shopping
  'photo-1555529669-e69e7aa0ba9a', // sneakers
  'photo-1583744946564-b52ac1c389c8', // warehouse
  'photo-1542744173-8e7e53415bb0', // team meeting
  'photo-1551836022-deb4988cc6c0', // courier
  'photo-1519389950473-47ba0277781c', // tech workspace
  'photo-1556742049-0cfed4f6a45d', // package opening
  'photo-1542744095-fcf48d80b0fd', // laptop graphs
  // Row 3
  'photo-1513694203232-719a280e022f', // beauty product
  'photo-1549923746-c502d488b3ea', // payment terminal
  'photo-1607082349566-187342175e2f', // ecommerce phone
  'photo-1556740714-a8395b3bf30f', // mobile shopping
  'photo-1607083206968-13611e3d76db', // ecommerce boxes
  'photo-1515378791036-0648a3ef77b2', // developer coding
  'photo-1552664730-d307ca884978', // startup team
  'photo-1559526324-4b87b5e36e44', // dashboard analytics
  // Row 4
  'photo-1515165562835-c3b8c8e50a74', // retail products
  'photo-1560769629-975ec94e6a86', // sneaker closeup
  'photo-1604754742629-3e5728249d73', // online store
  'photo-1556761175-5973dc0f32e7', // founder/portrait
  'photo-1551836022-d5d88e9218df', // courier handoff
  'photo-1525966222134-fcfa99b8ae77', // shoe store
  'photo-1607006483224-25cc26f07f55', // packaging
  'photo-1533750349088-cd871a92f312', // retail cashier
  // Row 5
  'photo-1563013544-824ae1b704d3', // candle/cosmetics
  'photo-1607083206869-4c7672e72a8a', // warehouse-drone
  'photo-1552960504-34271cc951e9', // product studio
  'photo-1556761175-b413da4baf72', // founder headshot
  'photo-1577962917302-cd874c4e31d2', // marketing data
  'photo-1513358130276-442b18ffc43b', // model/brand
  'photo-1505740420928-5e560c06d30e', // headphones retail
  'photo-1542736667-069246bdbc6d', // mobile checkout
  // Row 6
  'photo-1592078615290-033ee584e267', // home goods
  'photo-1607082349549-a8a593e77bb2', // fulfillment box
  'photo-1523580494863-6f3031224c94', // coffee branded
  'photo-1472099645785-5658abf4ff4e', // studio founder
  'photo-1540932239986-30128078f3c5', // colorful brand
  'photo-1505740420928-5e560c06d30e', // headphones
  'photo-1592750475338-74b7b21085ab', // boutique rack
  'photo-1483985988355-763728e1935b', // fashion retail
];

export default function DCDailyLanding() {
  return (
    <div
      data-dc="fullscreen"
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#0F172A',
      }}
    >
      {/* ─── Mosaic background ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridAutoRows: '1fr',
          gap: 0,
          filter: 'saturate(0.72) contrast(1.05)',
        }}
      >
        {TILES.map((id, i) => (
          <div
            key={`${id}-${i}`}
            style={{
              position: 'relative',
              paddingBottom: '100%', // square
              background: `url(https://images.unsplash.com/${id}?w=300&h=300&fit=crop&q=70) center/cover`,
            }}
          />
        ))}
      </div>

      {/* ─── Dark gradient overlay ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.92) 55%, rgba(15,23,42,0.97) 100%)',
        }}
      />

      {/* ─── Subtle grain/noise overlay for the sketched feel ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.95 0 0 0 0 0.95 0 0 0 0.22 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: 'overlay',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* ─── Content ─── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Top bar — logo + back link */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 20,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: 0.3,
              textDecoration: 'none',
            }}
          >
            <span style={{ fontWeight: 400 }}>dollar</span>
            <span style={{ color: '#D2042D', margin: '0 3px' }}>·</span>
            <span style={{ fontWeight: 700 }}>commerce</span>
          </Link>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            ← Back to site
          </Link>
        </nav>

        {/* Center: signup card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              textAlign: 'center',
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#F59E0B',
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 18,
              }}
            >
              The Daily Briefing
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.05,
                letterSpacing: -1,
                margin: '0 0 18px',
              }}
            >
              DC Daily
            </h1>

            {/* Subhead */}
            <p
              style={{
                fontSize: 17,
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.55,
                margin: '0 auto 32px',
                maxWidth: 420,
              }}
            >
              The e-commerce industry, in 3 minutes.
              <br />
              Delivered every weekday at 8am.
            </p>

            {/* Signup card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: '6px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <NewsletterSignup variant="light" />
              </div>
            </div>

            {/* Trust line */}
            <div
              style={{
                marginTop: 22,
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: 0.3,
              }}
            >
              Free forever &middot; No spam &middot; Unsubscribe anytime
            </div>

            {/* What you'll get list */}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '36px auto 0',
                maxWidth: 400,
                textAlign: 'left',
                display: 'grid',
                gap: 10,
              }}
            >
              {[
                'DC Index performance — 116 public e-commerce stocks',
                'Fundraising rounds — who raised, how much, who led',
                'Platform updates — Amazon, Shopify, Meta, Google, TikTok',
                'Top news headlines + a featured article from our team',
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.78)',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      color: '#10B981',
                      fontWeight: 800,
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar — small footer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            padding: '20px 0 0',
          }}
        >
          © 2026 Dollar Commerce
        </div>
      </div>
    </div>
  );
}

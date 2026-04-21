import Link from 'next/link';
import { Fraunces, Inter, Space_Grotesk } from 'next/font/google';
import SubscribeForm from './SubscribeForm';
import './dc-daily.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--f-fraunces',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--f-inter',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--f-space',
});

export const metadata = {
  title: 'DC Daily — The daily e-commerce briefing',
  description:
    'All things e-commerce, for founders and operators who prefer straight talk over buzzwords. Delivered every weekday at 8am.',
  alternates: { canonical: '/dc-daily' },
  openGraph: {
    title: 'DC Daily — Dollar Commerce',
    description: 'All things e-commerce, for founders and operators who prefer straight talk over buzzwords.',
    url: 'https://dollarcommerce.co/dc-daily',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DC Daily — Dollar Commerce',
    description: 'All things e-commerce, for founders and operators who prefer straight talk over buzzwords.',
  },
};

/* ─── Deterministic PRNG (mulberry32) — matches handoff ─── */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Design data ─── */
const IMAGES = [
  'photo-1607082348824-0a96f2a4b9da',
  'photo-1586528116311-ad8dd3c8310d',
  'photo-1553413077-190dd305871c',
  'photo-1441984904996-e0b6ba687e04',
  'photo-1540661116512-12e516d30a5f',
  'photo-1517336714731-489689fd1ca8',
  'photo-1460925895917-afdab827c52f',
  'photo-1611162617213-7d7a39e9b1d7',
  'photo-1591488320449-011701bb6704',
  'photo-1572635196237-14b3f281503f',
  'photo-1505740420928-5e560c06d30e',
  'photo-1526178613658-3f1622045557',
];

const BRAND_TILES = [
  { kind: 'productcard', name: 'Atlas Runner', price: '$128', tag: 'DTC · FOOTWEAR' },
  { kind: 'productcard', name: 'Heritage Tee', price: '$42', tag: 'APPAREL · SS26' },
  { kind: 'productcard', name: 'Field Bag', price: '$220', tag: 'ACCESSORIES' },
  { kind: 'productcard', name: 'Studio Kettle', price: '$165', tag: 'HOME' },
  { kind: 'productcard', name: 'Daily Serum', price: '$38', tag: 'BEAUTY · DTC' },
  { kind: 'productcard', name: 'Merino Crew', price: '$110', tag: 'BASICS' },
  { kind: 'adcreative', title: 'NEW ARRIVALS', sub: 'Spring drop. Shop the mainline.' },
  { kind: 'adcreative', title: 'SELLING FAST', sub: 'Bestsellers restocked this week.' },
  { kind: 'adcreative', title: '50% OFF', sub: 'Members only · This weekend.' },
  { kind: 'adcreative', title: 'FREE SHIPPING', sub: 'On orders over $75.' },
  { kind: 'checkout', total: '$184.20', items: '3 items · est. Apr 24' },
  { kind: 'checkout', total: '$67.00', items: '1 item · est. Apr 23' },
  { kind: 'reviewcard', stars: 5, quote: 'Arrived in 2 days. Flawless.', author: '— Maya, verified buyer' },
  { kind: 'reviewcard', stars: 4, quote: 'Size runs small, quality is 10/10.', author: '— Ben, verified buyer' },
  { kind: 'cover', title: 'THE DTC ISSUE', sub: 'Volume 12 · Spring 2026' },
  { kind: 'cover', title: 'MERCHANT REPORT', sub: 'State of e-commerce · Q1' },
  { kind: 'chart', label: 'GMV · 12W', pct: '+18.4%', trend: 'up' },
  { kind: 'chart', label: 'RETURNS', pct: '-2.1%', trend: 'down' },
  { kind: 'chart', label: 'CAC · DTC', pct: '$32.10', trend: 'flat' },
  { kind: 'logotype', word: 'HERITAGE' },
  { kind: 'logotype', word: 'Northfield' },
  { kind: 'logotype', word: 'STUDIO·54' },
  { kind: 'logotype', word: 'aperture' },
  { kind: 'logotype', word: 'FIELDWORK' },
  { kind: 'logotype', word: 'Marlow&Co' },
];

const CLIPS = [
  { kind: 'head', kicker: 'MARKETS · APR 21', head: 'Shopify posts record quarter on merchant services' },
  { kind: 'head', kicker: 'LOGISTICS', head: 'Last-mile costs tumble as regional carriers scale' },
  { kind: 'head', kicker: 'PLATFORMS', head: 'TikTok Shop eyes 2026 push into household goods' },
  { kind: 'head', kicker: 'FUNDING · SERIES B', head: 'Returns startup raises $48M led by Andreessen' },
  { kind: 'head', kicker: 'AMAZON', head: 'Seller fees creep up for third straight quarter' },
  { kind: 'stat', kicker: 'DC INDEX', stat: '+2.14%', byline: '116 public e-commerce stocks · Apr 21' },
  { kind: 'stat', kicker: 'AOV · APRIL', stat: '$84.20', byline: 'Up 3.1% vs March across DTC cohort' },
  { kind: 'stat', kicker: 'RETURNS', stat: '17.6%', byline: 'Apparel category, US online, Q1' },
  { kind: 'ticker', kicker: 'TAPE · 08:02 ET', lines: [['AMZN', '+0.82%', 'up'], ['SHOP', '+3.14%', 'up'], ['ETSY', '-1.20%', 'down'], ['BABA', '+0.11%', 'up'], ['MELI', '+1.42%', 'up'], ['EBAY', '-0.33%', 'down']] },
  { kind: 'ticker', kicker: 'ROUNDS · THIS WEEK', lines: [['Pacsun', '$30M', 'up'], ['Klar', '$12M', 'up'], ['Outset', '$8M', 'up'], ['Ghost', '$14M', 'up']] },
  { kind: 'quote', kicker: 'OP-ED', head: '"The checkout is the brand now."', byline: '— A. Patel, DC Weekly' },
  { kind: 'quote', kicker: 'NOTEBOOK', head: 'Ads are getting cheaper. Attention is not.', byline: '— Morning Note' },
];

// 8-row pattern × 5 tiles per row = 40 entries, cycled to reach 96 total tiles
const PATTERN = [
  [3, 2], [2, 1], [2, 2], [3, 1], [2, 2],
  [2, 1], [3, 2], [2, 2], [3, 1], [2, 1],
  [2, 2], [3, 1], [2, 1], [2, 2], [3, 2],
  [3, 1], [2, 2], [2, 1], [3, 2], [2, 1],
  [2, 2], [3, 2], [2, 1], [2, 1], [3, 1],
  [3, 1], [2, 1], [3, 2], [2, 2], [2, 1],
  [2, 2], [2, 1], [3, 1], [2, 2], [3, 2],
  [2, 1], [3, 2], [2, 1], [3, 1], [2, 2],
];

/* ─── Tile renderers ─── */
function sparkPath(rnd, trend) {
  const pts = 18;
  let y = 50;
  const arr = [];
  for (let i = 0; i < pts; i++) {
    const bias = trend === 'up' ? -1.6 : trend === 'down' ? 1.6 : 0;
    y = Math.max(10, Math.min(90, y + (rnd() - 0.5) * 16 + bias));
    arr.push([(i / (pts - 1)) * 100, y]);
  }
  return 'M ' + arr.map((p) => p.join(',')).join(' L ');
}

function renderBrandTile(b, rnd) {
  if (b.kind === 'productcard') {
    return (
      <div className="btile productcard">
        <div className="img" />
        <div className="tag">{b.tag}</div>
        <div className="meta">
          <div className="name">{b.name}</div>
          <div className="price">{b.price}</div>
        </div>
      </div>
    );
  }
  if (b.kind === 'adcreative') {
    const r = rnd();
    const variant = r < 0.45 ? (r < 0.225 ? ' red' : ' cream') : '';
    return (
      <div className={'btile adcreative' + variant}>
        <div className="hdrbar"><span>SPONSORED</span><span>· · ·</span></div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
          <div className="title">{b.title}</div>
          <div className="sub">{b.sub}</div>
        </div>
      </div>
    );
  }
  if (b.kind === 'checkout') {
    return (
      <div className="btile checkout">
        <div className="hdrbar"><span>CHECKOUT</span><span>SSL · SECURE</span></div>
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div className="pill">ORDER CONFIRMED</div>
          <div className="total">{b.total}</div>
          <div className="row"><span>{b.items}</span><span>PAID</span></div>
          <div className="bar" />
        </div>
      </div>
    );
  }
  if (b.kind === 'reviewcard') {
    return (
      <div className="btile reviewcard">
        <div className="hdrbar"><span>REVIEW</span><span>VERIFIED</span></div>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div className="stars">{'★'.repeat(b.stars)}{'☆'.repeat(5 - b.stars)}</div>
          <div className="q">&ldquo;{b.quote}&rdquo;</div>
          <div className="a">{b.author}</div>
        </div>
      </div>
    );
  }
  if (b.kind === 'cover') {
    return (
      <div className="btile cover">
        <div className="flag">dollar·commerce</div>
        <div style={{ marginTop: 'auto', zIndex: 1, position: 'relative' }}>
          <div className="title">{b.title}</div>
          <div className="sub" style={{ marginTop: 6 }}>{b.sub}</div>
        </div>
      </div>
    );
  }
  if (b.kind === 'chart') {
    const path = sparkPath(rnd, b.trend);
    const color = b.trend === 'up' ? '#0B8A4B' : b.trend === 'down' ? '#D6042F' : '#0B1128';
    return (
      <div className="btile chart">
        <div className="lbl">{b.label}</div>
        <div className={`pct ${b.trend}`}>{b.pct}</div>
        <div className="spark">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  }
  if (b.kind === 'logotype') {
    const dark = rnd() < 0.4;
    const w = b.word;
    const mid = Math.floor(w.length / 2);
    return (
      <div className={'btile logotype' + (dark ? ' dark' : '')}>
        <div className="word">
          {w.slice(0, mid)}
          <span className="dot" />
          {w.slice(mid)}
        </div>
      </div>
    );
  }
  return null;
}

function renderClipTile(c) {
  const variant = c.kind === 'stat' ? ' red' : c.kind === 'quote' ? ' dark' : c.kind === 'ticker' ? ' dark' : '';
  if (c.kind === 'head') {
    return (
      <div className={'clip' + variant}>
        <div className="kicker">{c.kicker}</div>
        <div className="head" style={{ fontSize: 'clamp(16px,1.6vw,24px)' }}>{c.head}</div>
        <div className="byline">DC DAILY · STAFF</div>
      </div>
    );
  }
  if (c.kind === 'stat') {
    return (
      <div className={'clip' + variant}>
        <div className="kicker">{c.kicker}</div>
        <div className="stat" style={{ fontSize: 'clamp(30px,4vw,56px)' }}>{c.stat}</div>
        <div className="byline">{c.byline}</div>
      </div>
    );
  }
  if (c.kind === 'ticker') {
    return (
      <div className={'clip' + variant}>
        <div className="kicker">{c.kicker}</div>
        <div className="ticker">
          {c.lines.map(([t, v, d], i) => (
            <div key={i}>
              <b className={d === 'down' ? 'down' : ''}>{t}</b>&nbsp;&nbsp;
              <span className={d === 'down' ? 'down' : ''}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (c.kind === 'quote') {
    return (
      <div className={'clip' + variant}>
        <div className="kicker">{c.kicker}</div>
        <div className="head" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(15px,1.4vw,22px)' }}>{c.head}</div>
        <div className="byline">{c.byline}</div>
      </div>
    );
  }
  return null;
}

function renderPhotoTile(id) {
  return (
    <div
      className="tile"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundImage: `url(https://images.unsplash.com/${id}?w=500&q=70)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}

/* ─── Build the 96-tile mosaic server-side (deterministic) ─── */
function buildMosaic(seed = 7) {
  const rnd = mulberry32(seed * 991);
  const total = 96;
  const tiles = [];
  for (let k = 0; k < total; k++) {
    const [cs, rs] = PATTERN[k % PATTERN.length];
    const rot = (rnd() - 0.5) * 1.8;
    const tx = (rnd() - 0.5) * 5;
    const ty = (rnd() - 0.5) * 5;
    let content;
    const r = rnd();
    if (r < 0.45) {
      const b = BRAND_TILES[Math.floor(rnd() * BRAND_TILES.length)];
      content = { type: 'brand', data: b };
    } else if (r < 0.75) {
      const c = CLIPS[Math.floor(rnd() * CLIPS.length)];
      content = { type: 'clip', data: c };
    } else {
      const id = IMAGES[Math.floor(rnd() * IMAGES.length)];
      content = { type: 'photo', data: id };
    }
    // Consume a few more rnd calls to match handoff's per-tile render calls
    // (keeps the visual layout consistent with the design)
    tiles.push({ cs, rs, rot, tx, ty, content, k });
  }
  // We need per-tile sub-PRNGs so that brand tile variants stay deterministic
  return tiles.map((t) => {
    const subSeed = ((t.k + 1) * 2654435761) >>> 0;
    const subRnd = mulberry32(subSeed);
    let node = null;
    if (t.content.type === 'brand') node = renderBrandTile(t.content.data, subRnd);
    else if (t.content.type === 'clip') node = renderClipTile(t.content.data);
    else node = renderPhotoTile(t.content.data);
    return { ...t, node };
  });
}

export default function DCDailyLanding() {
  const tiles = buildMosaic(7);

  return (
    <div
      data-dc="fullscreen"
      className={`${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      {/* SVG filter for rough edges */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.02" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <main className="dcdaily-stage">
        {/* Mosaic */}
        <div className="dcdaily-mosaic" aria-hidden="true">
          {tiles.map((t) => (
            <div
              key={t.k}
              className="dcdaily-tile-wrap"
              style={{
                gridColumn: `span ${t.cs}`,
                gridRow: `span ${t.rs}`,
                transform: `translate(${t.tx}px, ${t.ty}px) rotate(${t.rot}deg)`,
              }}
            >
              {t.node}
            </div>
          ))}
        </div>

        {/* Dark veil + spotlight + grain */}
        <div className="dcdaily-veil" aria-hidden="true" />
        <div className="dcdaily-spotlight" aria-hidden="true" />
        <div className="dcdaily-grain" aria-hidden="true" />

        {/* Foreground */}
        <div className="dcdaily-fg">
          <header className="dcdaily-nav">
            <Link href="/" className="dcdaily-backbtn" aria-label="Back to site">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to site
            </Link>
          </header>

          <section className="dcdaily-hero">
            <div className="dcdaily-eyebrow">THE DAILY BRIEFING</div>
            <h1 className="dcdaily-wordmark">DC&nbsp;Daily</h1>
            <p className="dcdaily-sub">
              All things <b>e&#8209;commerce</b>, for founders and operators who prefer straight talk over buzzwords.
            </p>

            <div className="dcdaily-card-wrap">
              <SubscribeForm />
            </div>

            <div className="dcdaily-trust">
              <span>Free forever</span><i className="sep" />
              <span>No spam</span><i className="sep" />
              <span>Unsubscribe anytime</span>
            </div>

            <div className="dcdaily-features" aria-label="What's inside">
              <div className="feat">
                <div className="fnum">01</div>
                <div className="fbody">
                  <div className="ftitle">Top stories</div>
                  <div className="fsub">The headlines that actually moved the industry today.</div>
                </div>
              </div>
              <div className="fdiv" />
              <div className="feat">
                <div className="fnum">02</div>
                <div className="fbody">
                  <div className="ftitle">Latest articles</div>
                  <div className="fsub">Original reporting and analysis from the DC desk.</div>
                </div>
              </div>
              <div className="fdiv" />
              <div className="feat">
                <div className="fnum">03</div>
                <div className="fbody">
                  <div className="ftitle">Public snapshot</div>
                  <div className="fsub">DC Index, movers, and a read on where the market sits.</div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

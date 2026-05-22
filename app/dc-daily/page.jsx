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
  title: 'DC Daily — The E-Commerce Briefing for Founders & Operators',
  description:
    'Join thousands of e-commerce operators who start their day with DC Daily. Top stories, fundraising rounds, platform updates, and the DC Index — delivered every weekday at 8am. Free forever, no spam.',
  keywords: [
    'DC Daily',
    'e-commerce newsletter',
    'ecommerce news',
    'DTC newsletter',
    'e-commerce briefing',
    'Dollar Commerce',
    'Shopify news',
    'Amazon seller news',
    'e-commerce fundraising',
    'DC Index',
    'platform updates',
    'daily ecommerce email',
  ],
  alternates: { canonical: '/dc-daily' },
  openGraph: {
    title: 'DC Daily — The E-Commerce Briefing',
    description:
      'All things e-commerce, for founders and operators who prefer straight talk over buzzwords. Delivered every weekday at 8am.',
    url: 'https://dollarcommerce.co/dc-daily',
    siteName: 'Dollar Commerce',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://dollarcommerce.co/api/og/newsletter-card',
        width: 1200,
        height: 630,
        alt: 'DC Daily — The daily e-commerce briefing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DC Daily — The E-Commerce Briefing',
    description:
      'The e-commerce industry, in 3 minutes. Delivered every weekday at 8am. Free forever, no spam.',
    site: '@dollarcommerce',
    creator: '@dollarcommerce',
    images: ['https://dollarcommerce.co/api/og/newsletter-card'],
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

const TESTIMONIALS = [
  {
    name: 'Benjamin Cogan',
    role: 'Co-founder, Agora · Ex-Hubble',
    avatar: '/writers/benjamin-cogan.png',
    quote:
      "Andrew's newsletter is one of just a few daily's I read end-to-end. Honored to be a writer as well and share everything VC, personal finance and e-commerce with future founders (I hope!)",
  },
  {
    name: 'Jesse Horwitz',
    role: 'Co-founder, Mangrove · Author of Selling Naked',
    avatar: '/writers/jesse-horwitz.png',
    quote:
      "Love the daily check-in's. Today it's hard to find reads that are raw and humorous like this.",
  },
  {
    name: 'Alex Knight',
    role: 'Co-founder, Igloo Media · Google Ads Lead',
    avatar: '/writers/alex-knight.png',
    quote:
      'A great newsletter for young people and founders who are looking to learn a bit more about brand building.',
  },
  {
    name: 'Max Starkman',
    role: 'Founder, Beanstalk Conference',
    avatar: null,
    quote:
      'From morning coffee to the worlds leading scientists to life as an athlete. Always a great 5 minute read in the am.',
  },
];

export default function DCDailyLanding() {
  return (
    <div
      data-dc="fullscreen"
      className={`${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable} dcdaily-page`}
    >
      {/* Background skyline — hand-sketched outline, sits behind content */}
      <svg
        className="dcdaily-skyline"
        viewBox="0 0 1600 280"
        preserveAspectRatio="xMidYEnd slice"
        aria-hidden="true"
      >
        <g fill="none" stroke="#0B1128" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.18">
          {/* Ground line — wobbly */}
          <path d="M0 268 C 120 270, 240 266, 360 269 S 600 271, 760 268 S 1000 266, 1200 269 S 1480 270, 1600 267" />

          {/* Skyscraper cluster — left */}
          <path d="M40 268 L 40 198 L 78 198 L 78 268" />
          <path d="M50 210 L 50 198 M60 215 L 60 198 M70 212 L 70 198" />
          <path d="M88 268 L 88 158 L 132 158 L 132 268" />
          <path d="M95 168 L 95 158 M105 174 L 105 158 M115 170 L 115 158 M124 172 L 124 158" />
          <path d="M100 158 L 110 142 L 120 158" />
          <path d="M142 268 L 142 220 L 174 220 L 174 268" />
          <path d="M184 268 L 184 184 L 232 184 L 232 268" />
          <path d="M192 198 L 192 184 M204 196 L 204 184 M216 198 L 216 184 M226 196 L 226 184" />
          <path d="M208 184 L 208 156" />
          <circle cx="208" cy="151" r="3" />

          {/* Bridge */}
          <path d="M250 268 L 250 222 L 360 222 L 360 268" />
          <path d="M250 222 Q 305 188 360 222" />
          <path d="M268 222 L 268 240 M286 222 L 286 240 M305 222 L 305 240 M324 222 L 324 240 M342 222 L 342 240" />
          <path d="M275 222 L 275 200 M335 222 L 335 200" />

          {/* Mid-rise block */}
          <path d="M380 268 L 380 210 L 416 210 L 416 268" />
          <path d="M386 222 L 386 210 M394 224 L 394 210 M404 222 L 404 210 M412 224 L 412 210" />
          <path d="M428 268 L 428 244 L 468 244 L 468 268" />
          <path d="M478 268 L 478 196 L 538 196 L 538 268" />
          <path d="M488 210 L 488 196 M498 214 L 498 196 M508 210 L 508 196 M518 214 L 518 196 M528 210 L 528 196" />
          <path d="M488 230 L 488 218 M498 232 L 498 218 M508 230 L 508 218 M518 232 L 518 218 M528 230 L 528 218" />
          <path d="M488 250 L 488 238 M498 252 L 498 238 M508 250 L 508 238 M518 252 L 518 238 M528 250 L 528 238" />

          {/* Tall central tower */}
          <path d="M552 268 L 552 130 L 616 130 L 616 268" />
          <path d="M560 144 L 560 130 M572 148 L 572 130 M584 144 L 584 130 M596 148 L 596 130 M608 144 L 608 130" />
          <path d="M560 168 L 560 154 M572 172 L 572 154 M584 168 L 584 154 M596 172 L 596 154 M608 168 L 608 154" />
          <path d="M560 192 L 560 178 M572 196 L 572 178 M584 192 L 584 178 M596 196 L 596 178 M608 192 L 608 178" />
          <path d="M560 216 L 560 202 M572 220 L 572 202 M584 216 L 584 202 M596 220 L 596 202 M608 216 L 608 202" />
          <path d="M584 130 L 584 96" />
          <path d="M580 100 L 588 100 M578 92 L 590 92" />

          {/* Dome */}
          <path d="M636 268 L 636 218 L 700 218 L 700 268" />
          <path d="M636 218 Q 668 178 700 218" />
          <path d="M668 178 L 668 162" />
          <circle cx="668" cy="156" r="5" />

          {/* Right cluster start */}
          <path d="M714 268 L 714 188 L 758 188 L 758 268" />
          <path d="M722 200 L 722 188 M732 204 L 732 188 M744 200 L 744 188 M752 204 L 752 188" />
          <path d="M770 268 L 770 232 L 800 232 L 800 268" />
          <path d="M812 268 L 812 164 L 856 164 L 856 268" />
          <path d="M820 176 L 820 164 M830 180 L 830 164 M842 176 L 842 164 M852 180 L 852 164" />
          <path d="M820 200 L 820 188 M830 204 L 830 188 M842 200 L 842 188 M852 204 L 852 188" />
          <path d="M820 224 L 820 212 M830 228 L 830 212 M842 224 L 842 212 M852 228 L 852 212" />
          <path d="M834 164 L 834 142" />

          {/* Pitched roof building */}
          <path d="M868 268 L 868 218 L 910 218 L 910 268" />
          <path d="M868 218 L 889 196 L 910 218" />
          <path d="M876 232 L 876 244 L 884 244 L 884 232 Z" />
          <path d="M894 232 L 894 244 L 902 244 L 902 232 Z" />

          {/* Second tall tower */}
          <path d="M924 268 L 924 116 L 980 116 L 980 268" />
          <path d="M932 128 L 932 116 M944 132 L 944 116 M956 128 L 956 116 M970 132 L 970 116" />
          <path d="M932 154 L 932 140 M944 158 L 944 140 M956 154 L 956 140 M970 158 L 970 140" />
          <path d="M932 180 L 932 166 M944 184 L 944 166 M956 180 L 956 166 M970 184 L 970 166" />
          <path d="M932 206 L 932 192 M944 210 L 944 192 M956 206 L 956 192 M970 210 L 970 192" />
          <path d="M932 232 L 932 218 M944 236 L 944 218 M956 232 L 956 218 M970 236 L 970 218" />
          <path d="M952 116 L 952 78" />
          <path d="M948 84 L 956 84" />

          {/* Ferris wheel */}
          <circle cx="1024" cy="218" r="32" />
          <path d="M1024 186 L 1024 250 M992 218 L 1056 218 M1003 195 L 1045 241 M1045 195 L 1003 241" />
          <path d="M1024 250 L 1024 268" />

          {/* Last cluster */}
          <path d="M1080 268 L 1080 198 L 1124 198 L 1124 268" />
          <path d="M1088 210 L 1088 198 M1100 214 L 1100 198 M1114 210 L 1114 198" />
          <path d="M1088 232 L 1088 220 M1100 236 L 1100 220 M1114 232 L 1114 220" />
          <path d="M1136 268 L 1136 244 L 1166 244 L 1166 268" />
          <path d="M1178 268 L 1178 176 L 1232 176 L 1232 268" />
          <path d="M1186 188 L 1186 176 M1198 192 L 1198 176 M1212 188 L 1212 176 M1224 192 L 1224 176" />
          <path d="M1186 214 L 1186 200 M1198 218 L 1198 200 M1212 214 L 1212 200 M1224 218 L 1224 200" />
          <path d="M1186 240 L 1186 226 M1198 244 L 1198 226 M1212 240 L 1212 226 M1224 244 L 1224 226" />
          <path d="M1205 176 L 1205 152" />
          <path d="M1244 268 L 1244 222 L 1280 222 L 1280 268" />
          <path d="M1292 268 L 1292 192 L 1344 192 L 1344 268" />
          <path d="M1300 206 L 1300 192 M1312 210 L 1312 192 M1326 206 L 1326 192 M1338 210 L 1338 192" />
          <path d="M1300 232 L 1300 218 M1312 236 L 1312 218 M1326 232 L 1326 218 M1338 236 L 1338 218" />
          <path d="M1318 192 L 1318 168" />
          <circle cx="1318" cy="162" r="3" />

          {/* Far right buildings + radio mast */}
          <path d="M1356 268 L 1356 234 L 1388 234 L 1388 268" />
          <path d="M1400 268 L 1400 200 L 1444 200 L 1444 268" />
          <path d="M1408 212 L 1408 200 M1418 216 L 1418 200 M1432 212 L 1432 200 M1440 216 L 1440 200" />
          <path d="M1456 268 L 1456 250 L 1488 250 L 1488 268" />
          <path d="M1500 268 L 1500 168 L 1556 168 L 1556 268" />
          <path d="M1510 180 L 1510 168 M1524 184 L 1524 168 M1540 180 L 1540 168 M1552 184 L 1552 168" />
          <path d="M1510 206 L 1510 192 M1524 210 L 1524 192 M1540 206 L 1540 192 M1552 210 L 1552 192" />
          <path d="M1510 232 L 1510 218 M1524 236 L 1524 218 M1540 232 L 1540 218 M1552 236 L 1552 218" />
          <path d="M1528 168 L 1528 120 M1524 130 L 1532 130 M1522 140 L 1534 140 M1520 150 L 1536 150" />

          {/* Birds */}
          <path d="M380 80 q 8 -6 16 0 q 8 -6 16 0" />
          <path d="M430 60 q 6 -4 12 0 q 6 -4 12 0" />
          <path d="M1120 70 q 8 -6 16 0 q 8 -6 16 0" />
        </g>
      </svg>

      {/* Back-to-site nav */}
      <header className="dcdaily-nav-light">
        <Link href="/" className="dcdaily-backbtn-light" aria-label="Back to site">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to site
        </Link>
      </header>

      {/* ── Centered single-column hero ───────────────────────────── */}
      <main className="dcdaily-center">
        <section className="dcdaily-center-hero">
          <div className="dcdaily-meet-portrait">
            <img src="/writers/andrew-watson.png" alt="Andrew Watson" />
          </div>

          <div className="dcdaily-meet-eyebrow">FROM THE EDITOR</div>
          <h1 className="dcdaily-meet-name">Andrew Watson</h1>
          <div className="dcdaily-meet-role">
            Co-Founder, Dollar Commerce &middot; London, UK
          </div>

          <blockquote className="dcdaily-meet-quote">
            &ldquo;I want to create a community where young founders of
            tomorrow could listen in on the philosophy from the best operators
            e-commerce has to offer. From founder interviews, scientists and
            athletes from all walks of life.&rdquo;
          </blockquote>

          <div className="dcdaily-meet-cta">
            <SubscribeForm />
          </div>

          <div className="dcdaily-meet-trust">
            <span>Free forever</span>
            <i className="sep" />
            <span>No spam</span>
            <i className="sep" />
            <span>Unsubscribe anytime</span>
          </div>

        </section>

      </main>

      {/* ── DESKTOP testimonial quotes ────────────────────────────
          Scattered absolutely around the central content. Hidden on
          mobile via CSS where the carousel sibling below renders instead. */}
      <div className="dcdaily-floating-quotes" aria-label="What founders say">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className={`dcdaily-float-quote dcdaily-float-${i + 1}`}
            aria-label={`Quote from ${t.name}`}
          >
            <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption>
              {t.avatar ? (
                <img src={t.avatar} alt="" />
              ) : (
                <span className="dcdaily-float-initials">
                  {t.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              )}
              <span>
                <b>{t.name}</b>
                <em>{t.role}</em>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* ── MOBILE testimonial carousel ───────────────────────────
          Plain horizontal scroller, sibling of <main>. Separate DOM
          tree from the desktop floats so the two layouts never share
          conflicting CSS contexts. Hidden on desktop via CSS. */}
      <section className="dc-mobile-testimonials" aria-label="What founders say">
        <ul className="dc-mob-track">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className="dc-mob-card">
              <p className="dc-mob-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="dc-mob-author">
                {t.avatar ? (
                  <img src={t.avatar} alt="" />
                ) : (
                  <span className="dc-mob-initials">
                    {t.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                )}
                <div>
                  <b>{t.name}</b>
                  <span className="dc-mob-role">{t.role}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

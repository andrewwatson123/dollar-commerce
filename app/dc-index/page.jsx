import SiteHeader from '@/components/SiteHeader';
import DCIndexHub from '@/components/DCIndexHub';
import { DC_INDEX_BASKET } from '@/lib/stocks';
import { ECOMMERCE_ETFS } from '@/lib/etfs';
import { WATCHLIST } from '@/lib/watchlist';
import { computeIndex, BASE_DATE_ISO } from '@/lib/dc-index';
import { BASE_PRICES, BASE_MARKET_CAPS } from '@/lib/index-base-data';
import { getTopBarData } from '@/lib/topbar-data';
import SiteFooter from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';
export const revalidate = 300;
export const metadata = { title: 'DC Index — Dollar Commerce' };

// Base prices and market caps now imported from lib/index-base-data.js

async function fetchQuote(symbol) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const q = await res.json();
    if (typeof q.c !== 'number' || q.c === 0) return null;
    return {
      symbol, price: q.c, change: q.d, changePercent: q.dp,
      high: q.h, low: q.l, open: q.o, prevClose: q.pc, timestamp: q.t,
    };
  } catch {
    return null;
  }
}

async function fetchQuotes(list) {
  const quotes = await Promise.all(list.map((s) => fetchQuote(s.symbol)));
  return quotes.filter(Boolean).map((q) => {
    const m = list.find((s) => s.symbol === q.symbol) || {};
    return { ...q, name: m.name || q.symbol, bucket: m.bucket || null };
  });
}

async function fetchConsumerSentiment() {
  try {
    const res = await fetch(
      'https://fred.stlouisfed.org/graph/fredgraph.csv?id=UMCSENT&cosd=2024-01-01',
      { next: { revalidate: 86400 } } // refreshes daily — data is monthly
    );
    if (!res.ok) return null;
    const csv = await res.text();
    const rows = csv.trim().split('\n').slice(1); // skip header
    const points = rows.map((r) => {
      const [date, val] = r.split(',');
      return { date, value: parseFloat(val) };
    }).filter((p) => !isNaN(p.value));
    if (points.length === 0) return null;
    const latest = points[points.length - 1];
    const prev = points.length >= 2 ? points[points.length - 2] : null;
    return {
      current: latest.value,
      date: latest.date,
      previous: prev?.value ?? null,
      change: prev ? latest.value - prev.value : null,
    };
  } catch {
    return null;
  }
}

export default async function DCIndexPage() {
  // Fetch all scopes directly from Finnhub (no internal API self-fetch)
  const [basketStocks, etfStocks, watchlistStocks, sentiment, topBar] = await Promise.all([
    fetchQuotes(DC_INDEX_BASKET),
    fetchQuotes(ECOMMERCE_ETFS),
    fetchQuotes(WATCHLIST),
    fetchConsumerSentiment(),
    getTopBarData(),
  ]);

  // Compute DC Index from basket prices — both equal-weight and mcap-weighted
  const currentPrices = Object.fromEntries(basketStocks.map((q) => [q.symbol, q.price]));
  const bucketNames = ['Brands', 'Marketplaces', 'Software'];

  // Equal-weight
  const overall = computeIndex(currentPrices, BASE_PRICES);
  const buckets = bucketNames.map((b) => ({
    bucket: b,
    ...computeIndex(currentPrices, BASE_PRICES, {}, b),
  }));

  // Market-cap weighted
  const overallWeighted = computeIndex(currentPrices, BASE_PRICES, BASE_MARKET_CAPS);
  const bucketsWeighted = bucketNames.map((b) => ({
    bucket: b,
    ...computeIndex(currentPrices, BASE_PRICES, BASE_MARKET_CAPS, b),
  }));

  const dcIndex = {
    baseDate: BASE_DATE_ISO,
    basketSize: DC_INDEX_BASKET.length,
    overall,
    buckets,
    overallWeighted,
    bucketsWeighted,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 80px' }}>
        <DCIndexHub
          dcIndex={dcIndex}
          basketStocks={basketStocks}
          etfStocks={etfStocks}
          watchlistStocks={watchlistStocks}
          sentiment={sentiment}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

import { NextResponse } from 'next/server';
import { DC_INDEX_BASKET, TICKER_SYMBOLS } from '@/lib/stocks';
import { ECOMMERCE_ETFS } from '@/lib/etfs';
import { WATCHLIST } from '@/lib/watchlist';

// Cache for 5 minutes. Finnhub free tier = 60 req/min.
export const revalidate = 300;

async function fetchQuote(symbol, token) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  const q = await res.json();
  if (typeof q.c !== 'number' || q.c === 0) return null;
  return {
    symbol,
    price: q.c,
    change: q.d,
    changePercent: q.dp,
    high: q.h,
    low: q.l,
    open: q.o,
    prevClose: q.pc,
    timestamp: q.t,
  };
}

// Map scope → { symbols, metaLookup }
function resolveScope(scope) {
  switch (scope) {
    case 'basket':
      return {
        symbols: DC_INDEX_BASKET.map((s) => s.symbol),
        meta: DC_INDEX_BASKET,
      };
    case 'etfs':
      return {
        symbols: ECOMMERCE_ETFS.map((s) => s.symbol),
        meta: ECOMMERCE_ETFS,
      };
    case 'watchlist':
      return {
        symbols: WATCHLIST.map((s) => s.symbol),
        meta: WATCHLIST,
      };
    case 'ticker':
    default:
      return {
        symbols: TICKER_SYMBOLS,
        meta: DC_INDEX_BASKET, // ticker symbols are a subset of the basket
      };
  }
}

export async function GET(req) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY not set' }, { status: 500 });
  }

  const url = new URL(req.url);
  const scope = url.searchParams.get('scope') || 'ticker';
  const { symbols, meta } = resolveScope(scope);

  const quotes = await Promise.all(symbols.map((s) => fetchQuote(s, token)));
  const data = quotes.filter(Boolean).map((q) => {
    const m = meta.find((s) => s.symbol === q.symbol) || { symbol: q.symbol, name: q.symbol };
    return { ...q, name: m.name, bucket: m.bucket || null };
  });

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    scope,
    quotes: data,
  });
}

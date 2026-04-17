import { NextResponse } from 'next/server';
import { DC_INDEX_BASKET } from '@/lib/stocks';
import { computeIndex, BASE_DATE_ISO } from '@/lib/dc-index';
import { BASE_PRICES, BASE_MARKET_CAPS } from '@/lib/index-base-data';

export const revalidate = 300;

async function fetchQuote(symbol, token) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  const q = await res.json();
  if (typeof q.c !== 'number' || q.c === 0) return null;
  return { symbol, price: q.c, change: q.d, changePercent: q.dp, prevClose: q.pc };
}

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    return NextResponse.json({ error: 'FINNHUB_API_KEY not set' }, { status: 500 });
  }

  const rawQuotes = await Promise.all(
    DC_INDEX_BASKET.map((s) => fetchQuote(s.symbol, token))
  );
  const validQuotes = rawQuotes.filter(Boolean);
  const currentPrices = Object.fromEntries(
    validQuotes.map((q) => [q.symbol, q.price])
  );

  // Build stock-level data for consumers (newsletter, etc.)
  const stocksBySymbol = Object.fromEntries(DC_INDEX_BASKET.map(s => [s.symbol, s]));
  const stocks = validQuotes.map(q => ({
    symbol: q.symbol,
    name: stocksBySymbol[q.symbol]?.name || q.symbol,
    bucket: stocksBySymbol[q.symbol]?.bucket || null,
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
  }));

  // Equal-weight (no market caps passed)
  const overall = computeIndex(currentPrices, BASE_PRICES);
  const bucketNames = ['Brands', 'Marketplaces', 'Software'];
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

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    baseDate: BASE_DATE_ISO,
    basketSize: DC_INDEX_BASKET.length,
    overall,
    buckets,
    overallWeighted,
    bucketsWeighted,
    stocks,
  });
}

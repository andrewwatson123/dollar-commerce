import { NextResponse } from 'next/server';
import { DC_INDEX_BASKET } from '@/lib/stocks';
import { ECOMMERCE_ETFS } from '@/lib/etfs';
import { WATCHLIST } from '@/lib/watchlist';

/**
 * GET /api/history?symbols=AMZN,SHOP,ETSY&range=3mo
 *
 * Returns the first and last close price for each symbol over the given range.
 * Uses Yahoo Finance (free, no key). The client computes period change % from
 * {firstClose, lastClose}.
 *
 * Supported ranges: 5d, 1mo, 3mo, 6mo, 1y, 2y, max
 * (Maps our UI labels: 1W→5d, 1M→1mo, 3M→3mo, YTD→ytd, 1Y→1y, All→max)
 */

export const revalidate = 300;

const RANGE_MAP = {
  '1D': '1d',
  '1W': '5d',
  '1M': '1mo',
  '3M': '3mo',
  'YTD': 'ytd',
  '1Y': '1y',
  'All': 'max',
};

// All symbols we might need in one call
const ALL_SYMBOLS = [
  ...DC_INDEX_BASKET.map(s => s.symbol),
  ...ECOMMERCE_ETFS.map(s => s.symbol),
  ...WATCHLIST.map(s => s.symbol),
];

async function fetchHistory(symbol, yahooRange) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${yahooRange}&interval=1d&includePrePost=false`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (DC Index)' },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const result = d?.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close?.filter(c => c != null);
    if (!closes || closes.length < 2) return null;
    return {
      symbol,
      firstClose: closes[0],
      lastClose: closes[closes.length - 1],
      periodChange: closes[closes.length - 1] - closes[0],
      periodChangePct: ((closes[closes.length - 1] / closes[0]) - 1) * 100,
      dataPoints: closes.length,
    };
  } catch {
    return null;
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const range = url.searchParams.get('range') || 'All';
  const symbolsParam = url.searchParams.get('symbols');

  const yahooRange = RANGE_MAP[range] || 'max';
  const symbols = symbolsParam
    ? symbolsParam.split(',').map(s => s.trim()).filter(Boolean)
    : ALL_SYMBOLS;

  // Batch in groups of 10 to avoid hammering Yahoo
  const results = [];
  for (let i = 0; i < symbols.length; i += 10) {
    const batch = symbols.slice(i, i + 10);
    const batchResults = await Promise.all(
      batch.map(s => fetchHistory(s, yahooRange))
    );
    results.push(...batchResults);
  }

  const data = Object.fromEntries(
    results.filter(Boolean).map(r => [r.symbol, r])
  );

  return NextResponse.json({
    range,
    yahooRange,
    fetchedAt: new Date().toISOString(),
    count: Object.keys(data).length,
    data,
  });
}

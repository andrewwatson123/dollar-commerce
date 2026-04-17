import { sanityClient } from '@/sanity/lib/client';
import { DC_INDEX_BASKET } from './stocks';
import { computeIndex, BASE_DATE_ISO } from './dc-index';
import { BASE_PRICES } from './index-base-data';

/**
 * Fetch all data needed for the TopBar in one call.
 * Returns { dcIndexValue, dcIndexChange, latestArticle }.
 * Cached for 5 min via Next.js revalidate.
 */
export async function getTopBarData() {
  const [indexData, articleData] = await Promise.all([
    getDCIndexValue(),
    getLatestArticle(),
  ]);
  return { ...indexData, latestArticle: articleData };
}

async function getDCIndexValue() {
  try {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) return { dcIndexValue: null, dcIndexChange: null };
    // Fetch ALL basket stocks for the accurate index value + 1-day change.
    // Cached for 5 min so the 47 API calls only happen once per period.
    const quotes = await Promise.all(
      DC_INDEX_BASKET.map(async (s) => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${token}`,
          { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const q = await res.json();
        return q.c > 0 ? { symbol: s.symbol, price: q.c, dp: q.dp } : null;
      })
    );
    const valid = quotes.filter(Boolean);
    const prices = Object.fromEntries(valid.map((q) => [q.symbol, q.price]));
    // All-time index value (base 100)
    const idx = computeIndex(prices, BASE_PRICES);
    // 1-day change = equal-weighted average of daily change % across all stocks
    const dailyChanges = valid.filter((q) => q.dp != null).map((q) => q.dp);
    const avgDailyChange = dailyChanges.length > 0
      ? dailyChanges.reduce((a, b) => a + b, 0) / dailyChanges.length
      : null;
    return {
      dcIndexValue: idx.value,          // all-time level (e.g. 113.84)
      dcIndexChange: avgDailyChange,     // 1-day change % (e.g. +0.5%)
    };
  } catch {
    return { dcIndexValue: null, dcIndexChange: null };
  }
}

async function getLatestArticle() {
  try {
    const article = await sanityClient.fetch(
      `*[_type=="article"] | order(publishedAt desc)[0]{
        title,
        "slug": slug.current,
        "category": category->title,
        "categoryColor": category->color
      }`,
      {},
      { next: { revalidate: 60 } }
    );
    return article || null;
  } catch {
    return null;
  }
}

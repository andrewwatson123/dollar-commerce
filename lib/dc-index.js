// DC Index calculation.
//
// Formula (market-cap weighted, capped basket, normalized to 100 at base date):
//
//   Index_t = 100 * Σ ( w_i * P_i,t / P_i,base )
//
// where:
//   w_i          = market cap weight of symbol i, capped at 15%, re-normalized
//   P_i,t        = current price
//   P_i,base     = price on base date (BASE_DATE_ISO)
//
// For MVP we approximate with *equal weights* until we wire up a market-cap
// source. The structure below makes it easy to swap in real weights later —
// just populate `weights` from a cached Finnhub /stock/metric call.
//
// Sub-indices: compute the same formula restricted to one bucket.

import { DC_INDEX_BASKET } from './stocks';

export const BASE_DATE_ISO = '2024-01-02'; // first trading day of 2024
export const MAX_WEIGHT = 0.15;

/**
 * Compute weights from market caps with a single-name cap.
 * If marketCaps is empty, returns equal weights.
 */
export function computeWeights(basket, marketCaps = {}) {
  const n = basket.length;
  if (n === 0) return {};

  const hasMcap = basket.every((s) => marketCaps[s.symbol] > 0);
  let raw;
  if (hasMcap) {
    const total = basket.reduce((acc, s) => acc + marketCaps[s.symbol], 0);
    raw = Object.fromEntries(
      basket.map((s) => [s.symbol, marketCaps[s.symbol] / total])
    );
  } else {
    const eq = 1 / n;
    raw = Object.fromEntries(basket.map((s) => [s.symbol, eq]));
  }

  // Apply the 15% cap, redistributing excess to uncapped names proportionally.
  // Iterate until stable (at most a few passes).
  let weights = { ...raw };
  for (let pass = 0; pass < 10; pass++) {
    const capped = Object.entries(weights).filter(([, w]) => w > MAX_WEIGHT);
    if (capped.length === 0) break;
    const excess = capped.reduce((acc, [, w]) => acc + (w - MAX_WEIGHT), 0);
    const uncappedSymbols = Object.entries(weights)
      .filter(([, w]) => w <= MAX_WEIGHT)
      .map(([s]) => s);
    const uncappedTotal = uncappedSymbols.reduce((a, s) => a + weights[s], 0);
    if (uncappedTotal === 0) break;
    const next = { ...weights };
    for (const [s] of capped) next[s] = MAX_WEIGHT;
    for (const s of uncappedSymbols) {
      next[s] = weights[s] + (weights[s] / uncappedTotal) * excess;
    }
    weights = next;
  }
  return weights;
}

/**
 * Compute the DC Index value.
 *
 * @param {Record<string, number>} currentPrices   { AMZN: 233.65, ... }
 * @param {Record<string, number>} basePrices      prices on BASE_DATE_ISO
 * @param {Record<string, number>} marketCaps      optional, for weighting
 * @param {string|null} bucket                     null | 'Brands' | 'Marketplaces' | 'Software'
 * @returns {{value:number, coverage:number, weights:Record<string,number>}}
 */
export function computeIndex(currentPrices, basePrices, marketCaps = {}, bucket = null) {
  const basket = DC_INDEX_BASKET.filter(
    (s) =>
      (bucket ? s.bucket === bucket : true) &&
      currentPrices[s.symbol] > 0 &&
      basePrices[s.symbol] > 0
  );

  if (basket.length === 0) {
    return { value: null, coverage: 0, weights: {} };
  }

  const weights = computeWeights(basket, marketCaps);
  const value =
    100 *
    basket.reduce((acc, s) => {
      const w = weights[s.symbol] ?? 1 / basket.length;
      const ratio = currentPrices[s.symbol] / basePrices[s.symbol];
      return acc + w * ratio;
    }, 0);

  return {
    value: Number(value.toFixed(2)),
    coverage: basket.length / DC_INDEX_BASKET.length,
    weights,
  };
}

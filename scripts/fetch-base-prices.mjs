/**
 * Fetch closing stock prices for Jan 2, 2024 (first trading day of 2024)
 * for all Dollar Commerce index tickers via Yahoo Finance.
 */

const BRANDS = [
  'NKE','TPR','AS','RL','LULU','DECK','ONON','CHWY','CELH','BROS','BIRK','CROX',
  'ANF','HIMS','ELF','PVH','BBWI','VSCO','KTB','FRPT','YETI','COLM','COCO',
  'WRBY','UAA','CPRI','SHOO','FIGS','HBI','PTON','SONO','RVLV','OLPX','WWW',
  'GIII','CRI','GOOS','ODD','SFIX','HNST','XPOF','LOVE','RENT'
];

const MARKETPLACES = [
  'AMZN','BABA','SHOP','PDD','BKNG','MELI','DASH','CVNA','SE','EBAY','JD',
  'CPNG','GRAB','RKUNY','CART','W','VIPS','ZAL','ETSY','MCARY','REAL','JMIA',
  'TDUP','DIBS'
];

const SOFTWARE = [
  'V','MA','ADBE','UPS','FDX','NET','PYPL','XYZ','DDOG','ADYEN','FISV','FIS',
  'XPO','AFRM','TWLO','GPN','TOST','AKAM','PINS','HUBS','GDDY','TTD','SNAP',
  'MANH','GXO','DSGX','GLBE','KLAR','KVYO','ESTC','FOUR','CMRC','DLO','BILL',
  'FSLY','BRZE','SEZL','MQ','PAYO','RAMP','DV','FLYW','CXM','LSPD','PGY',
  'TBLA','CRTO','AMPL','VTEX','RSKD'
];

const ALL_TICKERS = [...BRANDS, ...MARKETPLACES, ...SOFTWARE];

// Fallback mappings: if primary ticker fails, try these
const FALLBACKS = {
  XYZ: ['SQ'],
  CMRC: ['BIGC'],
  RKUNY: ['4755.T'],
  MCARY: ['MCARY'],  // no known alt
  ZAL: ['ZAL.DE'],
  ADYEN: ['ADYEN.AS'],
  AS: ['AS.AS'],       // Adidas is on Euronext Amsterdam
  KLAR: [],            // IPO'd Sept 2025, won't exist
  BIRK: ['BIRK'],     // IPO'd Oct 2023, should exist
};

// Narrow window: Jan 2 2024 only
const PERIOD1_NARROW = 1704153600; // Jan 2, 2024 00:00 UTC
const PERIOD2_NARROW = 1704240000; // Jan 2, 2024 24:00 UTC

// Wide window: Jan 1 - Jan 3
const PERIOD1_WIDE = 1704067200;   // Jan 1, 2024 00:00 UTC
const PERIOD2_WIDE = 1704326400;   // Jan 3, 2024 24:00 UTC

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPrice(symbol, period1, period2) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for ${symbol}`);
  }
  const data = await resp.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No chart result for ${symbol}`);
  const closes = result.indicators?.quote?.[0]?.close;
  if (!closes || closes.length === 0) throw new Error(`No close data for ${symbol}`);
  // Return first non-null close
  const price = closes.find((c) => c !== null);
  if (price == null) throw new Error(`All closes null for ${symbol}`);
  return Math.round(price * 100) / 100;
}

async function fetchWithRetry(symbol) {
  // Try narrow window first
  try {
    return await fetchPrice(symbol, PERIOD1_NARROW, PERIOD2_NARROW);
  } catch {
    // Try wide window
    try {
      return await fetchPrice(symbol, PERIOD1_WIDE, PERIOD2_WIDE);
    } catch {
      return null;
    }
  }
}

async function main() {
  const results = {};
  const failed = [];
  const fallbackUsed = {};

  console.log(`Fetching prices for ${ALL_TICKERS.length} tickers...\n`);

  for (const ticker of ALL_TICKERS) {
    process.stdout.write(`  ${ticker}... `);
    let price = await fetchWithRetry(ticker);

    if (price == null && FALLBACKS[ticker]) {
      for (const alt of FALLBACKS[ticker]) {
        if (alt === ticker) continue;
        process.stdout.write(`trying ${alt}... `);
        price = await fetchWithRetry(alt);
        if (price != null) {
          fallbackUsed[ticker] = alt;
          break;
        }
      }
    }

    if (price != null) {
      results[ticker] = price;
      console.log(`$${price}`);
    } else {
      failed.push(ticker);
      console.log('FAILED');
    }

    await delay(200);
  }

  // Sort results alphabetically
  const sorted = {};
  for (const key of Object.keys(results).sort()) {
    sorted[key] = results[key];
  }

  console.log('\n========================================');
  console.log('RESULTS (' + Object.keys(sorted).length + ' tickers):');
  console.log('========================================');
  console.log(JSON.stringify(sorted, null, 2));

  if (Object.keys(fallbackUsed).length > 0) {
    console.log('\n========================================');
    console.log('FALLBACK TICKERS USED:');
    console.log('========================================');
    for (const [orig, alt] of Object.entries(fallbackUsed)) {
      console.log(`  ${orig} → ${alt}`);
    }
  }

  if (failed.length > 0) {
    console.log('\n========================================');
    console.log(`FAILED (${failed.length} tickers):`);
    console.log('========================================');
    console.log(failed.join(', '));
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

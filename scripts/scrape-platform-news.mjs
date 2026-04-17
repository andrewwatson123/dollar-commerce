#!/usr/bin/env node
/**
 * Platform news scraper v2.
 *
 * Three tiers of sources:
 *   Tier 0: Official changelogs + dev blogs (highest quality, auto-categorized)
 *   Tier 1: Google News targeted queries (broader coverage)
 *   Tier 2: Industry publications (Search Engine Land, etc.)
 *
 * Category inference is context-aware — "bug" only triggers Bug category
 * when paired with software/platform terms, not product reviews.
 */

import { createClient } from '@sanity/client';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';

const FORCE = process.argv.includes('--force');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// --- entities ---------------------------------------------------------------
const RSS_ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&ndash;': '–', '&mdash;': '—', '&hellip;': '…',
  '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
};
function decodeEntities(s) {
  if (!s) return s;
  let out = s;
  for (const [k, v] of Object.entries(RSS_ENTITIES)) out = out.split(k).join(v);
  out = out.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return out;
}

// --- sources ----------------------------------------------------------------
const gnews = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;

const SOURCES = [
  // Tier 0: Official first-party feeds (pre-assigned platform + category)
  { platform: 'Shopify',   url: 'https://changelog.shopify.com/feed',                tier: 0, defaultCat: 'Feature' },
  { platform: 'Meta',      url: 'https://developers.facebook.com/blog/feed/',        tier: 0, defaultCat: 'API Update' },
  { platform: 'Google',    url: 'https://blog.google/products/ads-commerce/rss/',    tier: 0, defaultCat: 'Feature' },
  { platform: 'Pinterest', url: 'https://medium.com/feed/pinterest-engineering',      tier: 0, defaultCat: 'Feature' },

  // Tier 1: Google News — platform-specific queries
  // Amazon
  { platform: 'Amazon', url: gnews('"Amazon seller" feature OR update OR announcement OR change 2026') },
  { platform: 'Amazon', url: gnews('"Amazon FBA" update OR change OR fee OR policy 2026') },
  { platform: 'Amazon', url: gnews('"Amazon advertising" OR "Amazon ads" update OR feature OR API') },
  { platform: 'Amazon', url: gnews('"Seller Central" announcement OR update OR change') },
  { platform: 'Amazon', url: gnews('"Amazon" outage OR "not working" OR "service disruption" seller') },

  // Shopify
  { platform: 'Shopify', url: gnews('"Shopify" feature OR update OR launch OR API 2026') },
  { platform: 'Shopify', url: gnews('"Shopify" checkout OR payments OR POS update') },
  { platform: 'Shopify', url: gnews('"Shopify" outage OR down OR incident OR "not working"') },
  { platform: 'Shopify', url: gnews('"Shopify" policy OR terms change OR fee') },

  // Meta
  { platform: 'Meta', url: gnews('"Meta Advantage+" OR "Advantage+ shopping" update OR feature OR change') },
  { platform: 'Meta', url: gnews('"Facebook ads" OR "Instagram ads" update OR feature OR bug fix') },
  { platform: 'Meta', url: gnews('"Meta" ads manager OR Business Suite update OR outage') },
  { platform: 'Meta', url: gnews('"Facebook Marketplace" OR "Instagram Shopping" update OR change') },

  // Google
  { platform: 'Google', url: gnews('"Google Ads" update OR feature OR change OR announcement 2026') },
  { platform: 'Google', url: gnews('"Performance Max" OR "Demand Gen" update OR feature OR change') },
  { platform: 'Google', url: gnews('"Google Merchant Center" update OR change OR requirement') },
  { platform: 'Google', url: gnews('"Google Shopping" update OR feature OR policy') },

  // TikTok
  { platform: 'TikTok', url: gnews('"TikTok Shop" feature OR update OR policy OR launch 2026') },
  { platform: 'TikTok', url: gnews('"TikTok" advertising OR ads update OR feature OR tool') },
  { platform: 'TikTok', url: gnews('"TikTok" creator marketplace OR commerce update') },

  // Pinterest
  { platform: 'Pinterest', url: gnews('"Pinterest" advertising OR ads update OR feature 2026') },
  { platform: 'Pinterest', url: gnews('"Pinterest" shopping OR API update OR tool') },
];

// --- category inference (context-aware) ------------------------------------
function inferCategory(title, defaultCat) {
  if (defaultCat) return defaultCat; // Tier 0 sources pre-assign category

  const t = title.toLowerCase();

  // AI — check first (most specific)
  if (/\bai\b|artificial intelligence|machine learning|generative|llm|co-?pilot|gemini|gpt/.test(t)) return 'AI Update';

  // API — explicit mentions
  if (/\bapi\b|sdk|developer|endpoint|integration|webhook|graph api|marketing api/.test(t)) return 'API Update';

  // Bug — MUST have software/platform context, NOT product reviews
  if (/\b(outage|down|incident|service disruption|not working|error|crash|glitch|degraded|maintenance)\b/.test(t)) return 'Bug';
  if (/\bbug\s*(fix|report|patch|issue)\b/.test(t)) return 'Bug';

  // Policy — regulatory, terms, fees
  if (/policy|rule|compliance|regulation|ban|restrict|require|mandate|fee change|surcharge|terms of service|terms change|guideline/.test(t)) return 'Policy';

  return 'Feature';
}

// --- noise filter (tighter than v1) ----------------------------------------
const NOISE = [
  // Financial / stock stuff
  /stock price/i, /share price/i, /\bearnings\b/i, /revenue (miss|beat|report)/i,
  /quarterly results/i, /\bipo\b/i, /valuation/i,
  // Legal
  /lawsuit/i, /\bsued\b/i, /court order/i, /antitrust/i,
  // Product reviews / shopping guides / listicles
  /best.selling/i, /best .* (for|of|on amazon|on shopify)/i, /top \d+ /i,
  /our (favorite|pick)/i, /buying guide/i, /review:/i, /\breview\b.*\d+ star/i,
  /deals? (of|this|today)/i, /prime day deal/i, /black friday/i,
  /coupon|discount code|promo code/i,
  // How-to / tutorials
  /^how to/i, /^why you should/i, /^what is/i, /^a guide to/i,
  /tutorial/i, /step.by.step/i, /beginner/i,
  // Generic fluff
  /vs\./i, /comparison/i, /alternatives? to/i,
  // Social media drama
  /elon musk/i, /mark zuckerberg (said|post|comment)/i,
];

function isNoise(title) {
  return NOISE.some((rx) => rx.test(title));
}

// --- heat inference (1-3 peppers) -------------------------------------------
// 3 🌶🌶🌶 = outage, major policy change, deprecation, security incident
// 2 🌶🌶   = new product launch, API version release, significant feature
// 1 🌶     = minor update, routine change, blog post
function inferHeat(title, category) {
  const t = title.toLowerCase();

  // 3 peppers: urgent / breaking
  if (/outage|down|incident|security|breach|deprecated|deprecation|shutdown|discontinue|removed|banned|suspended/.test(t)) return 3;
  if (/major (change|update|overhaul)|breaking change|mandatory|deadline/.test(t)) return 3;
  if (category === 'Bug') return 2; // bugs are at least important

  // 2 peppers: significant
  if (/launch|launches|announces|introduces|rolls out|new (feature|tool|product|api)|v\d+|version \d+/.test(t)) return 2;
  if (/partnership|acquisition|expansion|beta|pilot|redesign/.test(t)) return 2;
  if (category === 'Policy') return 2; // policy changes are always noteworthy

  // 1 pepper: everything else
  return 1;
}

// --- RSS fetcher ------------------------------------------------------------
async function fetchRss(url, isGoogleNews = false) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 (DC Platform Scraper)' },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const items = [];
  $('item, entry').each((_, el) => {
    const $el = $(el);
    let title = ($el.find('title').text() || '').trim();
    let sourceOverride = null;
    if (isGoogleNews) {
      const m = title.match(/^(.*?)\s+-\s+([^-]+)$/);
      if (m) { title = m[1].trim(); sourceOverride = m[2].trim(); }
    }
    const link = $el.find('link').text().trim() || $el.find('link').attr('href') || '';
    const rawDesc = ($el.find('description, summary, content').first().text() || '')
      .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const pubDate = $el.find('pubDate, published, updated').first().text().trim();
    items.push({
      title: decodeEntities(title),
      link,
      pubDate,
      description: decodeEntities(rawDesc).slice(0, 500),
      sourceName: sourceOverride,
    });
  });
  return items;
}

// --- main -------------------------------------------------------------------
async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN');
    process.exit(1);
  }

  let raw = [];
  for (const src of SOURCES) {
    try {
      const isGN = !src.tier && src.tier !== 0; // Google News sources don't have tier:0
      const items = await fetchRss(src.url, src.url.includes('news.google.com'));
      console.log(`  ${String(items.length).padStart(3)}  ${src.platform.padEnd(10)} ${src.tier === 0 ? '[OFFICIAL]' : ''} ${src.url.slice(0, 70)}`);
      items.forEach((it) => raw.push({
        ...it,
        platform: src.platform,
        defaultCat: src.defaultCat || null,
        sourceName: it.sourceName || (src.tier === 0 ? `${src.platform} Official` : it.sourceName),
      }));
    } catch (e) {
      console.warn(`  !  ${src.platform}: ${e.message}`);
    }
  }

  // Dedupe by URL
  const seen = new Set();
  raw = raw.filter((it) => {
    if (!it.link || seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  });

  // Filter + parse
  const stats = { total: raw.length, noise: 0, kept: 0 };
  const updates = [];

  // Only keep items from the last 6 months to avoid stale news
  const sixMonthsAgo = new Date(Date.now() - 180 * 86400000);

  for (const it of raw) {
    if (isNoise(it.title)) { stats.noise++; continue; }
    if (!it.title || it.title.length < 10) continue;

    const reportedAt = new Date(it.pubDate || Date.now());
    if (reportedAt < sixMonthsAgo) { stats.noise++; continue; } // too old

    const category = inferCategory(it.title, it.defaultCat);
    const heat = inferHeat(it.title, category);
    const urlHash = createHash('sha1').update(it.link).digest('hex').slice(0, 20);

    stats.kept++;
    updates.push({
      _id: `platform-${urlHash}`,
      _type: 'platformUpdate',
      platform: it.platform,
      title: it.title,
      summary: it.description || '',
      category,
      heat,
      reportedAt: reportedAt.toISOString(),
      sourceUrl: it.link,
      sourceName: it.sourceName || 'Google News',
      approved: true,
    });
  }

  console.log(`\nFilter: ${stats.total} total → ${stats.kept} kept (${stats.noise} noise)`);

  // Upsert
  let created = 0;
  let skipped = 0;
  for (const ev of updates) {
    if (!FORCE) {
      const existing = await client.fetch(
        `*[_type=="platformUpdate" && sourceUrl==$u][0]{_id}`,
        { u: ev.sourceUrl }
      );
      if (existing) { skipped++; continue; }
    }
    await client.createOrReplace(ev);
    created++;
    console.log(`  + ${ev.platform.padEnd(10)} ${ev.category.padEnd(12)} ${ev.title.slice(0, 60)}`);
  }
  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });

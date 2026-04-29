#!/usr/bin/env node
/**
 * Fundraising scraper — live data, no mocks.
 *
 * Strategy: cast a wide net across free public RSS feeds, then filter.
 *
 * Sources come in two tiers:
 *
 *   TIER 1 — retail/commerce-focused publications.
 *     Anything from these sources that mentions a funding verb (raises, closes,
 *     acquires, etc.) is automatically e-commerce relevant.
 *       • Modern Retail
 *       • Retail Dive
 *       • Digital Commerce 360
 *       • Glossy
 *       • PYMNTS
 *
 *   TIER 2 — general tech/startup funding feeds.
 *     Must ALSO match an e-commerce keyword to be included.
 *       • TechCrunch (fundraising + venture categories)
 *       • Tech Funding News
 *       • TechStartups
 *       • Crunchbase News
 *       • StrictlyVC
 *       • EU-Startups
 *       • VentureBeat
 *
 * Parsing is regex-based and imperfect. Fields we can't extract (amount,
 * investors, round) are left blank so they can be filled in via Sanity Studio.
 * Everything is idempotent — running twice does not create duplicates.
 *
 * Usage:
 *   npm run scrape:fundraising              # incremental
 *   npm run scrape:fundraising -- --force   # re-upsert all
 *   npm run scrape:fundraising -- --verbose # show skipped items + reason
 */

import { createClient } from '@sanity/client';
import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';

const FORCE = process.argv.includes('--force');
const VERBOSE = process.argv.includes('--verbose');
const NO_LLM = process.argv.includes('--no-llm');

// LLM-backed company name extractor. Falls back to regex parseCompany() if
// ANTHROPIC_API_KEY is missing, the call fails, or --no-llm is passed.
// Haiku 4.5 is fast and cheap (~$0.005-0.01/day at current scrape volume).
const anthropic = process.env.ANTHROPIC_API_KEY && !NO_LLM
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const llmStats = { calls: 0, ok: 0, failed: 0, cached: 0, rejected: 0 };
const llmCache = new Map(); // headline → name (in-process; scrape is short-lived)

async function extractCompanyLLM(title) {
  if (!anthropic) return null;
  if (llmCache.has(title)) {
    llmStats.cached++;
    return llmCache.get(title);
  }
  llmStats.calls++;
  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 32,
      messages: [
        {
          role: 'user',
          content:
            `Extract the company name that received funding from this fundraising headline. ` +
            `Reply with ONLY the company name, nothing else. ` +
            `If the headline is not a real fundraising announcement (a roundup, listicle, generic news, etc.), reply with the single word: NONE.\n\n` +
            `Headline: "${title}"`,
        },
      ],
    });
    let name = res.content?.[0]?.type === 'text' ? res.content[0].text.trim() : '';
    // Strip wrapping quotes the model occasionally adds
    name = name.replace(/^["'`]+|["'`]+$/g, '').trim();
    if (!name || name === 'NONE' || name.length > 60 || name.length < 2) {
      llmStats.rejected++;
      llmCache.set(title, null);
      return null;
    }
    llmStats.ok++;
    llmCache.set(title, name);
    return name;
  } catch (e) {
    llmStats.failed++;
    if (VERBOSE) console.warn(`  ⚠️  LLM extract failed: ${e.message}`);
    llmCache.set(title, null);
    return null;
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// --- sources ----------------------------------------------------------------

// Google News RSS search queries. Each query is a targeted slice of the
// startup funding news wire. Since we broadened scope beyond e-commerce, we
// now pull technology, fintech, AI, climate, biotech, hardware, gaming, and
// general VC coverage alongside the original commerce queries.
//
// The scraper's filter is now purely pattern-based (funding verb + amount,
// named round, acquisition, IPO) — no sector keyword gate. Sector inference
// runs later to bucket each hit into DTC / Marketplace / Fintech / AI /
// Infrastructure / Climate / Biotech / etc.
const gnewsUrl = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;

const SOURCES = [
  // Commerce-specific queries (kept from the original focus)
  { name: 'Google News', url: gnewsUrl('"e-commerce" "raises" OR "raised"'),               tier: 1 },
  { name: 'Google News', url: gnewsUrl('"ecommerce" startup "raises" OR "closes"'),        tier: 1 },
  { name: 'Google News', url: gnewsUrl('DTC brand "raises" OR "closes" OR "secures"'),     tier: 1 },
  { name: 'Google News', url: gnewsUrl('"direct-to-consumer" "raises" OR "funding"'),      tier: 1 },
  { name: 'Google News', url: gnewsUrl('marketplace startup "Series A" OR "Series B"'),    tier: 1 },
  { name: 'Google News', url: gnewsUrl('retail tech "raises" OR "Series A"'),              tier: 1 },
  { name: 'Google News', url: gnewsUrl('beauty brand "raises" OR "acquired by"'),          tier: 1 },
  { name: 'Google News', url: gnewsUrl('fashion brand "raises" OR "acquired"'),            tier: 1 },
  { name: 'Google News', url: gnewsUrl('food brand "raises" OR "Series A"'),               tier: 1 },
  { name: 'Google News', url: gnewsUrl('logistics startup "raises"'),                      tier: 1 },

  // General tech / VC
  { name: 'Google News', url: gnewsUrl('tech startup "raises" OR "closes" Series'),        tier: 1 },
  { name: 'Google News', url: gnewsUrl('"raises $" million seed'),                         tier: 1 },
  { name: 'Google News', url: gnewsUrl('"closes $" million "Series A"'),                   tier: 1 },
  { name: 'Google News', url: gnewsUrl('"closes $" million "Series B"'),                   tier: 1 },
  { name: 'Google News', url: gnewsUrl('startup "Series C" OR "Series D" raised'),         tier: 1 },
  { name: 'Google News', url: gnewsUrl('"unicorn" funding raised Series'),                 tier: 1 },

  // Fintech
  { name: 'Google News', url: gnewsUrl('fintech "raises" OR "raised" Series'),             tier: 1 },
  { name: 'Google News', url: gnewsUrl('payments startup "raises"'),                       tier: 1 },
  { name: 'Google News', url: gnewsUrl('banking startup "raises" Series'),                 tier: 1 },
  { name: 'Google News', url: gnewsUrl('neobank "raises" OR "closes"'),                    tier: 1 },

  // AI / ML
  { name: 'Google News', url: gnewsUrl('AI startup "raises" OR "raised"'),                 tier: 1 },
  { name: 'Google News', url: gnewsUrl('"generative AI" startup "raises"'),                tier: 1 },
  { name: 'Google News', url: gnewsUrl('LLM startup "raises" OR "Series A"'),              tier: 1 },
  { name: 'Google News', url: gnewsUrl('AI agents startup "raises"'),                      tier: 1 },

  // SaaS / Enterprise
  { name: 'Google News', url: gnewsUrl('SaaS startup "raises" Series'),                    tier: 1 },
  { name: 'Google News', url: gnewsUrl('enterprise software "raises"'),                    tier: 1 },
  { name: 'Google News', url: gnewsUrl('developer tools startup "raises"'),                tier: 1 },

  // Infrastructure / devtools / data
  { name: 'Google News', url: gnewsUrl('cybersecurity startup "raises"'),                  tier: 1 },
  { name: 'Google News', url: gnewsUrl('data infrastructure "raises" Series'),             tier: 1 },

  // Climate / energy
  { name: 'Google News', url: gnewsUrl('climate tech "raises" OR "funding"'),              tier: 1 },
  { name: 'Google News', url: gnewsUrl('clean energy startup "raises"'),                   tier: 1 },
  { name: 'Google News', url: gnewsUrl('EV startup "raises" Series'),                      tier: 1 },

  // Biotech / health
  { name: 'Google News', url: gnewsUrl('biotech "raises" Series B OR C'),                  tier: 1 },
  { name: 'Google News', url: gnewsUrl('health tech "raises" Series'),                     tier: 1 },

  // Gaming / media / creator
  { name: 'Google News', url: gnewsUrl('gaming startup "raises" OR "closes"'),             tier: 1 },
  { name: 'Google News', url: gnewsUrl('creator economy startup "raises"'),                tier: 1 },

  // Hardware / robotics / space
  { name: 'Google News', url: gnewsUrl('robotics startup "raises" Series'),                tier: 1 },
  { name: 'Google News', url: gnewsUrl('hardware startup "raises"'),                       tier: 1 },
  { name: 'Google News', url: gnewsUrl('space startup "raises"'),                          tier: 1 },

  // Retail/commerce-focused RSS (original tier 1)
  { name: 'Modern Retail',        url: 'https://www.modernretail.co/feed/',         tier: 1 },
  { name: 'Retail Dive',          url: 'https://www.retaildive.com/feeds/news/',    tier: 1 },
  { name: 'Digital Commerce 360', url: 'https://www.digitalcommerce360.com/feed/',  tier: 1 },
  { name: 'Glossy',               url: 'https://www.glossy.co/feed/',               tier: 1 },
  { name: 'PYMNTS',               url: 'https://pymnts.com/feed/',                  tier: 1 },

  // General tech/startup RSS — now also tier 1 since we broadened scope
  { name: 'TechCrunch',           url: 'https://techcrunch.com/category/fundraising/feed/', tier: 1 },
  { name: 'TechCrunch',           url: 'https://techcrunch.com/category/venture/feed/',     tier: 1 },
  { name: 'Tech Funding News',    url: 'https://techfundingnews.com/feed/', tier: 1 },
  { name: 'TechStartups',         url: 'https://techstartups.com/feed/',    tier: 1 },
  { name: 'Crunchbase News',      url: 'https://news.crunchbase.com/feed/', tier: 1 },
  { name: 'StrictlyVC',           url: 'https://www.strictlyvc.com/feed/',  tier: 1 },
  { name: 'EU-Startups',          url: 'https://www.eu-startups.com/feed/', tier: 1 },
  { name: 'VentureBeat',          url: 'https://www.venturebeat.com/feed/', tier: 1 },

  // VC firm blogs — announce portfolio investments before press picks them up
  { name: 'a16z',                url: 'https://a16z.com/feed/',                                    tier: 1 },
  { name: 'a16z (Medium)',       url: 'https://medium.com/feed/@a16z',                             tier: 1 },
  { name: 'Sequoia Capital',     url: 'https://sequoiacap.com/feed/',                              tier: 1 },
  { name: 'Sequoia (Medium)',    url: 'https://medium.com/feed/sequoia-capital',                    tier: 1 },
  { name: 'Kleiner Perkins',     url: 'https://www.kleinerperkins.com/feed/',                      tier: 1 },
  { name: 'Battery Ventures',    url: 'https://www.battery.com/feed/',                             tier: 1 },
  { name: 'Union Square Ventures', url: 'https://www.usv.com/feed/',                               tier: 1 },
  { name: 'AVC (Fred Wilson)',   url: 'https://avc.com/feed/',                                     tier: 1 },
  { name: 'Founders Fund',       url: 'https://www.foundersfund.com/feed/',                        tier: 1 },
  { name: 'Insight Partners',    url: 'https://www.insightpartners.com/feed/',                     tier: 1 },
  { name: 'Y Combinator',        url: 'https://www.ycombinator.com/blog/feed/',                    tier: 1 },
  { name: 'Balderton Capital',   url: 'https://www.balderton.com/feed/',                           tier: 1 },
  { name: 'Balderton (Medium)',  url: 'https://medium.com/feed/balderton',                         tier: 1 },
  { name: 'First Round Review',  url: 'https://firstround.com/review/feed.xml',                   tier: 1 },
  { name: 'Greylock (Medium)',   url: 'https://medium.com/feed/greylock-perspectives',             tier: 1 },
  { name: 'Lightspeed (Medium)', url: 'https://medium.com/feed/lightspeed-venture-partners',       tier: 1 },
  { name: 'Craft Ventures (Medium)', url: 'https://medium.com/feed/craft-ventures',               tier: 1 },
  { name: 'Index Ventures (Medium)', url: 'https://medium.com/feed/@IndexVentures',               tier: 1 },
  { name: 'Atomico (Medium)',    url: 'https://medium.com/feed/@atomico',                          tier: 1 },
  { name: 'Point Nine (Medium)', url: 'https://medium.com/feed/@PointNineCap',                    tier: 1 },
  { name: 'Contrary Research',   url: 'https://contraryresearch.substack.com/feed',                tier: 1 },
  { name: 'Tomasz Tunguz',       url: 'https://tomtunguz.com/index.xml',                          tier: 1 },
];

// --- filters ----------------------------------------------------------------

// To qualify, the TITLE must match one of these specific funding patterns.
// We require either an explicit dollar amount, a named round, or clear
// acquisition language — not generic words that overlap with unrelated news.
const FUNDING_PATTERNS = [
  // "$25M", "$1.2 billion"
  /raises?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /raised\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /closes?\s+(?:its\s+|a\s+|an?\s+|the\s+)?(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /closed\s+(?:its\s+|a\s+|an?\s+|the\s+)?(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /secures?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /secured\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /lands?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /landed\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /pockets?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /bags?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /nabs?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /snags?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /scores?\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /gets?\s+(?:£|€|\$)[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,

  // Valuation language
  /valued\s+at\s+(?:£|€|\$)?[\d.]+\s*(?:k|m|b|thousand|million|billion)\b/i,
  /at\s+(?:a\s+)?(?:£|€|\$)[\d.]+\s*(?:k|m|b|thousand|million|billion)\s+valuation/i,
  /\btriples?\b.*\bvaluation/i,
  /\bdoubles?\b.*\bvaluation/i,

  // Named round
  /closes?\s+(?:its\s+)?series\s+[a-f]\b/i,
  /closed\s+(?:its\s+)?series\s+[a-f]\b/i,
  /raises?\s+(?:its\s+)?series\s+[a-f]\b/i,
  /raised\s+(?:its\s+)?series\s+[a-f]\b/i,
  /series\s+[a-f]\s+(?:funding|round|financing)/i,
  /(?:pre-?)?seed\s+round/i,
  /(?:pre-?)?seed\s+funding/i,

  // Acquisition
  /\bacquires?\b(?!\s+new\s+(?:customers?|users?|talent))/i,
  /\bacquired\s+by\b/i,
  /\bto\s+acquire\b/i,
  /\bagrees?\s+to\s+buy\b/i,
  /\bbuyout\b/i,

  // IPO
  /\bipo\b/i,
  /\bgoes\s+public\b/i,
  /\bfiles?\s+to\s+go\s+public\b/i,
  /\bfiles?\s+for\s+ipo\b/i,
];

function matchesFundingPattern(title) {
  return FUNDING_PATTERNS.some((rx) => rx.test(title));
}

// Tier 2 additionally requires one of these e-commerce keywords.
const ECOMMERCE_KEYWORDS = [
  'e-commerce', 'ecommerce', 'dtc', 'direct-to-consumer', 'direct to consumer',
  'shopify', 'amazon seller', 'amazon.com seller', 'marketplace', 'online retail',
  'online store', 'online shopping', 'retail tech', 'retailtech', 'consumer brand',
  'd2c', 'subscription box', 'cpg', 'consumer packaged', 'fulfillment',
  'last-mile', 'last mile', 'dropship', 'drop-ship', '3pl', 'checkout',
  'pos software', 'beauty brand', 'beauty startup', 'apparel', 'fashion',
  'grocery delivery', 'quick commerce', 'q-commerce', 'social commerce',
  'livestream shopping', 'creator commerce', 'resale', 'secondhand', 'thrift',
  'returns management', 'skincare', 'haircare', 'cosmetics', 'furniture',
  'home goods', 'pet brand', 'footwear', 'sneaker', 'activewear', 'athleisure',
  'food brand', 'beverage brand', 'snack brand', 'supplement', 'wellness brand',
  'meal kit', 'meal delivery', 'food delivery', 'grocery', 'retailer',
  'tiktok shop', 'temu', 'shein', 'instacart', 'walmart', 'target',
];
const ECOMMERCE_RX = new RegExp(ECOMMERCE_KEYWORDS.map((k) => k.replace(/[-.]/g, '.?')).join('|'), 'i');

// Hard skip — even if a keyword matches, these titles are never a round.
const TITLE_NOISE = [
  /techcrunch disrupt/i,
  /disrupt 2026/i,
  /every .* startup that has raised/i,
  /top .* funding news/i,
  /weekly (closeout|roundup|recap)/i,
  /^how to/i,
  /^why /i,
  /podcast/i,
  /pitch deck (i|we)/i,
  /newsletter/i,
  /^briefing:/i,
  /opinion:/i,
  /op-ed/i,
];

function isNoise(title) {
  return TITLE_NOISE.some((rx) => rx.test(title));
}

function hasEcommerceKeyword(text) {
  return ECOMMERCE_RX.test(text);
}

// --- parsers ----------------------------------------------------------------

function parseAmount(title) {
  // Only parse from the title — descriptions are full of unrelated $ figures
  // (market size, revenue, etc.) that poison the signal.
  // Require a $/£/€ prefix OR clear context ("raises 5M" style).
  const rx = /(?:\$|£|€)\s*([\d.]+)\s*(k|m|b|million|billion|thousand)?\b/i;
  const m = title.match(rx);
  if (!m) return { amountUsd: null, amountText: null };
  const num = parseFloat(m[1]);
  if (isNaN(num)) return { amountUsd: null, amountText: null };
  const unit = (m[2] || '').toLowerCase();
  const mults = { k: 1e3, thousand: 1e3, m: 1e6, million: 1e6, b: 1e9, billion: 1e9 };
  const mult = mults[unit] || 0;
  if (!mult) {
    // Bare "$500" with no unit — probably not a round amount (more likely a subtitle)
    return { amountUsd: null, amountText: null };
  }
  const amountUsd = Math.round(num * mult);
  // Reject absurdly large values — anything over $20B is almost certainly a
  // market-size figure or a parsing mistake (Google News title had multiple numbers).
  if (amountUsd > 20e9) return { amountUsd: null, amountText: null };
  return {
    amountUsd,
    amountText: `$${num}${unit.length === 1 ? unit.toUpperCase() : ' ' + unit}`,
  };
}

function parseRound(text) {
  const t = text.toLowerCase();
  if (/series\s*a\b/.test(t)) return 'Series A';
  if (/series\s*b\b/.test(t)) return 'Series B';
  if (/series\s*c\b/.test(t)) return 'Series C';
  if (/series\s*d\b/.test(t)) return 'Series D';
  if (/series\s*e\b/.test(t) || /series\s*f\b/.test(t)) return 'Series E+';
  if (/pre-seed/.test(t)) return 'Pre-seed';
  if (/\bseed\b/.test(t)) return 'Seed';
  if (/growth round|growth equity|growth financing/.test(t)) return 'Growth';
  if (/debt financing|credit facility|term loan/.test(t)) return 'Debt';
  if (/ipo|goes public|public offering/.test(t)) return 'IPO';
  if (/acquir|bought by|merger|merges/.test(t)) return 'Acquisition';
  return 'Unknown';
}

function cleanCompany(raw) {
  if (!raw) return null;
  let s = raw.trim();

  // Strip newsroom prefixes
  s = s.replace(/^\[?\s*(funding alert|exclusive|breaking|scoop|tfn exclusive|opinion|analysis|update|news)\s*[:|\]]+\s*/gi, '');
  s = s.replace(/^(exclusive|breaking|scoop)\s*\|\s*/gi, '');

  // Strip leading descriptors: "B2B", "D2C", "Indian", "Fashion", "Quick commerce", etc.
  const leadingPhrases = [
    'b2b', 'b2c', 'd2c', 'dtc', 'saas', 'ai', 'quick commerce', 'social commerce',
    'e-commerce', 'ecommerce', 'online', 'direct-to-consumer', 'direct to consumer',
    'logistics', 'marketplace', 'retail', 'fashion', 'beauty', 'food', 'grocery',
    'pet', 'baby', 'home', 'wellness', 'fintech', 'startup', 'startups', 'company',
    'platform', 'indian', 'chinese', 'american', 'african', 'egyptian', 'nigerian',
    'pakistani', 'kenyan', 'saudi', 'dutch', 'french', 'german', 'uk-based', 'us-based',
    'paris-based', 'london-based', 'dubai-based', 'singapore', 'philippine', 'vietnamese',
    'korean', 'japanese', 'australian', 'british', 'canadian', 'israeli', 'brazilian',
    'babycare', 'baby care', 'babycare', 'full-stack', 'b2b quick commerce',
    'fashion quick commerce', 'baby care quick commerce', 'social commerce', 'try and buy',
    'three-year-old', 'two-year-old', 'four-year-old', 'drone', 'electric vehicle',
    'electronics', 'kim kardashian\'s', 'kim kardashian', 'quality-first',
    // NEW
    'gaming', 'crypto', 'web3', 'blockchain', 'healthtech', 'medtech', 'edtech',
    'insurtech', 'proptech', 'climatetech', 'cleantech', 'biotech', 'deeptech',
    'quantum', 'defense', 'aerospace', 'space', 'chip', 'semiconductor',
    'ai-powered', 'ai agents', 'generative ai', 'genai', 'llm', 'robotics',
    'coding startup', 'coding',
  ];
  const leadingRx = new RegExp(
    `^(?:${leadingPhrases.map((p) => p.replace(/[.\-\\^$*+?()|[\]{}]/g, '\\$&')).join('|')})\\s+`,
    'gi'
  );
  // Strip repeatedly — descriptors can stack ("Indian quick commerce startup Foo")
  for (let i = 0; i < 5; i++) {
    const before = s;
    s = s.replace(leadingRx, '');
    if (s === before) break;
  }

  // Generic location/sponsor prefix: catches "Lille-based Axomove",
  // "Bezos-Backed Prometheus", "London-based Foo", "VC-backed Bar", etc.
  // Any single token followed by "-based" / "-backed" / "-led" gets dropped.
  for (let i = 0; i < 5; i++) {
    const before = s;
    s = s.replace(/^[A-Za-z][\w'']*-(based|backed|led|funded|owned)\s+/i, '');
    if (s === before) break;
  }

  // Strip trailing clauses that leaked in from the title split
  s = s.replace(/\s*,\s+(not yet public|a .+|based in .+|an? .+-based .+)$/i, '');
  s = s.replace(/\s+(?:expands? to .+|files? for .+|plans? to .+)$/i, '');
  s = s.replace(/[,.]$/, '').trim();

  // Strip trailing descriptor nouns. "Bezos-Backed Prometheus Startup" → "Prometheus".
  // "creator tools startup ComfyUI" — handled by leading strip; this catches the
  // mirror case where descriptors trail the actual name.
  for (let i = 0; i < 3; i++) {
    const before = s;
    s = s.replace(/\s+(startup|startups|company|companies|firm|firms|platform|platforms|brand|brands|maker|makers|group|inc|ltd|corp|plc|tech|technology|technologies|labs|lab)$/i, '');
    if (s === before) break;
  }
  s = s.trim();

  // Reject if what's left is too generic
  if (!s || s.length < 2) return null;
  if (s.length > 60) return null;
  const badWords = /^(startup|company|platform|marketplace|commerce|firm|brand)$/i;
  if (badWords.test(s)) return null;

  // Reject sentence fragments masquerading as company names.
  // If the extracted "company" contains narrative verbs or trailing filler,
  // the title wasn't a clean "X raises $Y" pattern and we shouldn't trust
  // the extraction. Example: "ATMOS wants build a space cargo highway. It just"
  const sentenceSignals = /\b(wants?|announces?|plans?|says?|told|is\s+set\s+to|will|could|aims?|seeks?|hopes?|expects?|looks?\s+to|goes?\s+public|files?\s+for)\b/i;
  if (sentenceSignals.test(s)) return null;
  if (/\bit\s+just\b/i.test(s)) return null;

  // Max 5 words — real company names are short. Descriptors are already
  // stripped, so anything longer is almost certainly a title fragment.
  const wordCount = s.split(/\s+/).length;
  if (wordCount > 5) return null;

  return s;
}

function parseCompany(title) {
  const clean = title.replace(/^(breaking|exclusive|scoop|tfn exclusive):\s*/i, '').trim();

  // "X acquired by Y" / "X being acquired by Y" → company is X
  const acquiredBy = clean.match(/^(.+?)\s+(?:being\s+|is\s+)?(?:acquired|bought)\s+by\b/i);
  if (acquiredBy) return cleanCompany(acquiredBy[1]);

  // "Y to acquire X" / "Y acquires X" → X (target)
  const acquires = clean.match(/\b(?:to\s+)?acquires?\s+(.+?)(?:\s+for|\s+in|\s*[,\.]|$)/i);
  if (acquires) return cleanCompany(acquires[1]);

  // "X raises $Y" / "X closes Series A" — company is X
  const verbs = /\b(raises|raised|closes|closed|secures|secured|lands|landed|pockets|bags|snags|scores|nabs|gets|triples|doubles|files|goes)\b/i;
  const parts = clean.split(verbs);
  if (parts.length < 2) return null;
  return cleanCompany(parts[0]);
}

// Order matters — more specific checks win over broader ones. Commerce-
// adjacent sectors come first so a "Shopify partner" stays tagged as
// Infrastructure rather than SaaS.
function inferSector(text) {
  const t = text.toLowerCase();

  // --- Commerce family -----------------------------------------------------
  if (/dtc|direct.to.consumer|consumer brand|beauty|skincare|cosmetics|apparel|fashion|cpg|food brand|supplement|wellness brand|haircare|footwear|sneaker|activewear|athleisure/.test(t)) return 'DTC';
  if (/marketplace|classifieds|resale|secondhand|thrift/.test(t)) return 'Marketplace';
  if (/shopify|bigcommerce|pos software|checkout|commerce infrastructure|headless commerce|returns management|tiktok shop|amazon seller/.test(t)) return 'Commerce Infra';
  if (/e-?commerce|online store|online retail|quick commerce|q-commerce|social commerce/.test(t)) return 'E-Commerce';
  if (/logistics|fulfillment|3pl|warehouse|last.mile|delivery|shipping|freight/.test(t)) return 'Logistics';
  if (/grocery|food delivery|meal kit|meal delivery|restaurant tech/.test(t)) return 'Grocery/Food';

  // --- Tech / software -----------------------------------------------------
  if (/\bai\b|artificial intelligence|generative ai|machine learning|\bml\b|llm|gpt|agent|foundation model|co.?pilot/.test(t)) return 'AI';
  if (/fintech|payments|neobank|digital bank|lending|credit|insurance tech|insurtech|wealth management|trading platform|crypto|web3|stablecoin|blockchain/.test(t)) return 'Fintech';
  if (/cyber|security startup|infosec|zero trust|endpoint|identity management|siem|soc /.test(t)) return 'Cybersecurity';
  if (/saas|enterprise software|developer tool|devtool|api platform|data platform|observability|analytics platform|infrastructure as code/.test(t)) return 'SaaS/Dev Tools';
  if (/ad.tech|martech|marketing tech|creative tool|advertising platform/.test(t)) return 'AdTech/MarTech';
  if (/hr tech|recruiting|people ops|workforce management/.test(t)) return 'HR Tech';
  if (/legal tech|contract|compliance software/.test(t)) return 'Legal/Compliance';
  if (/prop tech|real estate tech|construction tech/.test(t)) return 'PropTech';

  // --- Physical / deep tech ------------------------------------------------
  if (/climate|clean energy|solar|wind|carbon|battery|energy storage|grid/.test(t)) return 'Climate';
  if (/electric vehicle|\bev\b|ev startup|autonomous|self.driving/.test(t)) return 'Mobility/EV';
  if (/biotech|therapeutic|drug discovery|gene|rna|mrna|pharma|oncology/.test(t)) return 'Biotech';
  if (/health tech|digital health|telehealth|medtech|medical device|clinical/.test(t)) return 'Health Tech';
  if (/robotic|industrial automation|manufacturing tech/.test(t)) return 'Robotics';
  if (/hardware startup|chip startup|semiconductor|foundry/.test(t)) return 'Hardware';
  if (/space startup|satellite|rocket|aerospace/.test(t)) return 'Space';
  if (/defense tech|military tech|drone startup|dual.use/.test(t)) return 'Defense';
  if (/fusion|nuclear|geothermal/.test(t)) return 'Energy';

  // --- Media / consumer ----------------------------------------------------
  if (/gaming startup|video game|esports|game studio/.test(t)) return 'Gaming';
  if (/creator economy|creator tools|influencer/.test(t)) return 'Creator';
  if (/media startup|streaming|podcast platform/.test(t)) return 'Media';
  if (/edtech|education startup|learning platform/.test(t)) return 'EdTech';

  return 'Tech';
}

// --- RSS --------------------------------------------------------------------

// Decode the common HTML entities that slip in from RSS descriptions.
// Keeps data clean at source so the page doesn't need to re-clean on render.
const RSS_ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&ndash;': '–', '&mdash;': '—', '&hellip;': '…',
  '&lsquo;': '‘', '&rsquo;': '’', '&ldquo;': '“', '&rdquo;': '”',
  '&#8211;': '–', '&#8212;': '—', '&#8216;': '‘', '&#8217;': '’',
  '&#8220;': '“', '&#8221;': '”', '&#8230;': '…',
};
function decodeEntities(s) {
  if (!s) return s;
  let out = s;
  for (const [k, v] of Object.entries(RSS_ENTITIES)) out = out.split(k).join(v);
  out = out.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return out;
}

async function fetchRss(url, isGoogleNews = false) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 (DC Fundraising Scraper)' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const items = [];
  $('item').each((_, el) => {
    const $el = $(el);
    let title = $el.find('title').text().trim();
    let sourceOverride = null;

    // Google News titles look like "Foo raises $10M - TechCrunch" — split off
    // the publication so company-parsing doesn't choke on it, and use the real
    // publication as the source name.
    if (isGoogleNews) {
      const m = title.match(/^(.*?)\s+-\s+([^-]+)$/);
      if (m) {
        title = m[1].trim();
        sourceOverride = m[2].trim();
      }
    }

    const rawDesc = $el
      .find('description')
      .text()
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    items.push({
      title: decodeEntities(title),
      link: $el.find('link').text().trim(),
      pubDate: $el.find('pubDate').text().trim(),
      description: decodeEntities(rawDesc),
      sourceOverride,
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
      const isGNews = src.name === 'Google News';
      const items = await fetchRss(src.url, isGNews);
      console.log(`  ${String(items.length).padStart(3)}  ${src.name.padEnd(22)} ${isGNews ? src.url.slice(0, 90) : src.url}`);
      items.forEach((it) =>
        raw.push({
          ...it,
          sourceName: it.sourceOverride || src.name,
          tier: src.tier,
        })
      );
    } catch (e) {
      console.warn(`  !  ${src.url}: ${e.message}`);
    }
  }

  // Dedupe by URL
  const seen = new Set();
  raw = raw.filter((it) => {
    if (seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  });

  // Filter
  const stats = { total: raw.length, noise: 0, noVerb: 0, notEcom: 0, noCompany: 0, kept: 0 };
  const events = [];

  // First pass: filter noise/non-funding so we don't waste LLM calls on garbage
  const candidates = [];
  for (const it of raw) {
    if (isNoise(it.title)) {
      stats.noise++;
      if (VERBOSE) console.log(`  ~noise: ${it.title.slice(0, 80)}`);
      continue;
    }
    if (!matchesFundingPattern(it.title)) {
      stats.noVerb++;
      continue;
    }
    candidates.push(it);
  }

  // Second pass: extract company names. LLM in concurrent batches if available,
  // regex fallback otherwise. Batch size of 8 keeps API parallelism reasonable.
  if (anthropic) {
    console.log(`  🤖 Extracting names via Haiku 4.5 for ${candidates.length} candidates...`);
  }
  const extracted = new Array(candidates.length);
  const BATCH = 8;
  for (let i = 0; i < candidates.length; i += BATCH) {
    const slice = candidates.slice(i, i + BATCH);
    const names = await Promise.all(
      slice.map(async (it) => {
        const llmName = await extractCompanyLLM(it.title);
        if (llmName) {
          // Pass the LLM result through cleanCompany() for the trailing-descriptor
          // / hyphen-prefix safety nets we already wrote. LLM rarely needs it but
          // belt-and-braces is cheap.
          const cleaned = cleanCompany(llmName);
          if (cleaned) return cleaned;
        }
        return parseCompany(it.title); // regex fallback
      })
    );
    for (let j = 0; j < slice.length; j++) extracted[i + j] = names[j];
  }

  for (let idx = 0; idx < candidates.length; idx++) {
    const it = candidates[idx];
    const combined = `${it.title} ${it.description}`;
    const { amountUsd, amountText } = parseAmount(it.title);
    const round = parseRound(combined);
    const company = extracted[idx];
    const sector = inferSector(combined);

    if (!company || company.length < 2 || company.length > 80) {
      stats.noCompany++;
      if (VERBOSE) console.log(`  ~!co:   ${it.title.slice(0, 80)}`);
      continue;
    }

    stats.kept++;
    // Stable id: hash the full URL so duplicate stories from different
    // queries collapse and different stories get unique ids.
    const urlHash = createHash('sha1').update(it.link).digest('hex').slice(0, 20);
    events.push({
      _id: `fundraising-${urlHash}`,
      _type: 'fundraisingEvent',
      company,
      amountUsd,
      amountText,
      round,
      sector,
      announcedAt: new Date(it.pubDate || Date.now()).toISOString(),
      description: it.description.slice(0, 500),
      sourceUrl: it.link,
      sourceName: it.sourceName,
      approved: true,
    });
  }

  console.log(
    `\nFilter: ${stats.total} total → ${stats.kept} kept ` +
      `(${stats.noise} noise, ${stats.noVerb} no-verb, ${stats.notEcom} not-ecom, ${stats.noCompany} no-co)`
  );
  if (anthropic) {
    console.log(
      `LLM (Haiku 4.5): ${llmStats.calls} calls, ${llmStats.ok} ok, ${llmStats.rejected} rejected, ${llmStats.failed} failed, ${llmStats.cached} cached`
    );
  } else {
    console.log('LLM extractor: disabled (set ANTHROPIC_API_KEY to enable)');
  }

  // Upsert
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const ev of events) {
    if (!FORCE) {
      const existing = await client.fetch(
        `*[_type=="fundraisingEvent" && sourceUrl==$u][0]{_id}`,
        { u: ev.sourceUrl }
      );
      if (existing) {
        skipped++;
        continue;
      }
    }
    await client.createOrReplace(ev);
    if (FORCE) updated++;
    else created++;
    console.log(`  + ${(ev.amountText || '?').padEnd(8)} ${ev.round.padEnd(14)} ${ev.company}`);
  }

  console.log(`\nDone. Created ${created}, updated ${updated}, skipped ${skipped} existing.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

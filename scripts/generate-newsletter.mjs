/**
 * Generate a daily Dollar Commerce newsletter and email it as a ready-to-paste
 * draft for Beehiiv.
 *
 * Runs once daily after the Exec Sum scrape (8:15am). Emails a fully formatted
 * newsletter with: DC Index performance, top movers/fallers, fundraising deals,
 * and featured articles.
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-newsletter.mjs
 *   node --env-file=.env.local scripts/generate-newsletter.mjs --dry-run
 *   node --env-file=.env.local scripts/generate-newsletter.mjs --verbose
 */

import { google } from 'googleapis';
import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dollarcommerce.substack.com';
const RECIPIENT = 'acw1996@googlemail.com';

/* ── Gmail ──────────────────────────────────────── */

const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
);
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

async function sendEmail(to, subject, htmlBody) {
  const raw = [
    `From: Andrew Watson at Dollar Commerce <${RECIPIENT}>`,
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ].join('\r\n');

  const encoded = Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });
}

/* ── Sanity ─────────────────────────────────────── */

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  useCdn: false,
});

/* ── Helpers ────────────────────────────────────── */

const today = new Date();
const todayStr = today.toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});
const shortDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

let _stockLogoUrl = () => null;
async function loadLogos() {
  try {
    const mod = await import('../lib/stock-domains.js');
    _stockLogoUrl = mod.stockLogoUrl;
  } catch { /* fallback */ }
}

function logoImg(symbol, size = 20) {
  const url = _stockLogoUrl(symbol, size);
  if (!url) return '';
  return `<img src="${url}" alt="" width="${size}" height="${size}" style="border-radius:4px;vertical-align:middle;margin-right:6px" />`;
}

function fmtUsd(n) {
  if (!n) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function pctColor(pct) {
  return pct >= 0 ? '#10B981' : '#EF4444';
}

function pctArrow(pct) {
  return pct >= 0 ? '&#9650;' : '&#9660;';
}

function fmtPct(pct) {
  return `${pctArrow(pct)} ${Math.abs(pct).toFixed(2)}%`;
}

/**
 * Fix mojibake — text where UTF-8 bytes were decoded as Mac-Roman or
 * Windows-1252 and saved that way (e.g. an apostrophe stored as ",Äô"
 * instead of "'"). Common in copy-pastes from external apps into Sanity.
 *
 * Strategy: known-pattern table first (cheap and exact for the common
 * cases), then a Latin-1 → UTF-8 round-trip for anything else that looks
 * like mojibake. Returns input unchanged if nothing looks broken.
 */
function fixMojibake(s) {
  if (!s || typeof s !== 'string') return s;
  // Mac-Roman mojibake markers
  const PATTERNS = [
    [/,Äô/g, '\u2019'],   // right single quote
    [/,Äú/g, '\u201C'],   // left double quote
    [/,Äù/g, '\u201D'],   // right double quote
    [/,Äì/g, '\u2013'],   // en dash
    [/,Äî/g, '\u2014'],   // em dash
    [/,Äò/g, '\u2018'],   // left single quote
    [/,Ñ¢/g, '\u2122'],   // trademark
    [/,Ç¨/g, '\u20AC'],   // euro sign
    // Windows-1252 mojibake markers (UTF-8 bytes read as Latin-1)
    [/â\u0080\u0099/g, '\u2019'],
    [/â\u0080\u009C/g, '\u201C'],
    [/â\u0080\u009D/g, '\u201D'],
    [/â\u0080\u0093/g, '\u2013'],
    [/â\u0080\u0094/g, '\u2014'],
    [/Ã©/g, '\u00E9'],
    [/Ã¨/g, '\u00E8'],
    [/Ã¶/g, '\u00F6'],
  ];
  let out = s;
  for (const [rx, replacement] of PATTERNS) out = out.replace(rx, replacement);
  return out;
}

/* ── Fetch data ─────────────────────────────────── */

async function getLatestArticles(limit = 4) {
  const rows = await sanity.fetch(
    `*[_type=="article"] | order(publishedAt desc)[0...$limit]{
      _id, title, "slug": slug.current, publishedAt, excerpt, substackUrl,
      "category": category->title,
      "author": author->name,
      "imageUrl": mainImage.asset->url
    }`,
    { limit }
  );
  // Sanitize text fields — Sanity content occasionally has mojibake from
  // upstream copy-paste. Clean here so it never reaches the email.
  return rows.map((a) => ({
    ...a,
    title: fixMojibake(a.title),
    excerpt: fixMojibake(a.excerpt),
    category: fixMojibake(a.category),
    author: fixMojibake(a.author),
  }));
}

// Latest platform-tracker news (e-commerce headlines scraped from around the web).
// Used for the "Top News Headlines" section — independent of DC editorial.
// Prefers official sources and excludes stock-commentary noise.
async function getLatestPlatformNews(limit = 2) {
  try {
    // Pull a wider window, then filter/sort client-side
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const raw = await sanity.fetch(
      `*[_type=="platformUpdate" && approved == true && reportedAt >= $since]
        | order(reportedAt desc)[0...60]{
          _id, platform, title, summary, category, heat, reportedAt, sourceUrl, sourceName
        }`,
      { since }
    );
    // Reject stock-commentary noise + listicles.
    // Allow "product stock" / "in stock" / "out of stock" (inventory context).
    const bad = (s) => {
      if (!s) return false;
      const t = s.toLowerCase();
      // Listicles / clickbait
      if (/^\d+\s+(profitable|best|top|ways|things|ideas)/.test(t)) return true;
      if (/\bbusiness ideas\b|\bprofitable tech\b/.test(t)) return true;
      // Stock commentary
      if (/\bis\s+\w+\s+stock\s+(a\s+)?(buy|sell|good)/i.test(s)) return true;
      if (/stock\s+(is\s+)?(a\s+)?(buy|sell|candidate|pick)/i.test(s)) return true;
      if (/\b(buy|sell|hold)\s+(now|right\s+now|the\s+dip)\b/.test(t)) return true;
      if (/\b(short|long)\s+candidate\b/.test(t)) return true;
      if (/\bprice\s+target|analyst\s+(upgrade|downgrade|rating)/.test(t)) return true;
      if (/\bdividend\b|\bearnings\s+(miss|beat|report|call)|quarterly results/.test(t)) return true;
      if (/\bshares?\s+(surge|plunge|drop|fall|rise|jump)/.test(t)) return true;
      // Generic comparison listicles
      if (/\bvs\.\b|\bvs\s+/.test(t) && /stock|better|candidate/.test(t)) return true;
      return false;
    };
    const filtered = (raw || []).filter((x) => x.title && !bad(x.title) && !bad(x.summary));
    // Prefer official sources, then by heat/date
    filtered.sort((a, b) => {
      const aOfficial = /Official/i.test(a.sourceName || '') ? 1 : 0;
      const bOfficial = /Official/i.test(b.sourceName || '') ? 1 : 0;
      if (aOfficial !== bOfficial) return bOfficial - aOfficial;
      if ((b.heat || 1) !== (a.heat || 1)) return (b.heat || 1) - (a.heat || 1);
      return new Date(b.reportedAt) - new Date(a.reportedAt);
    });
    return filtered.slice(0, limit);
  } catch {
    return [];
  }
}

async function getRecentFundraising() {
  // Get last 7 days of fundraising
  const since = new Date();
  since.setDate(since.getDate() - 7);
  return sanity.fetch(
    `*[_type=="fundraisingEvent" && announcedAt >= $since] | order(announcedAt desc, amountUsd desc)[0...10]{
      company, amountUsd, amountText, round, sector, sourceUrl, sourceName, announcedAt
    }`,
    { since: since.toISOString() }
  );
}

async function getDcIndexData() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5180';
    const res = await fetch(`${base}/api/dc-index`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getYtdData() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5180';
    const res = await fetch(`${base}/api/history?range=YTD`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null; // { AMZN: { periodChangePct, ... }, ... }
  } catch {
    return null;
  }
}

async function getStockQuotes(dcIndexData) {
  // Use stock-level data from the DC Index API (already fetches all 116 quotes)
  if (dcIndexData?.stocks && dcIndexData.stocks.length > 0) {
    return dcIndexData.stocks.filter(s => s.changePercent != null);
  }
  return [];
}

/* ── Colors ─────────────────────────────────────── */

const C = {
  bg: '#F4F1EA', card: '#FFFFFF', navy: '#0F172A', red: '#D2042D',
  grey: '#64748B', light: '#94A3B8', border: '#E2E8F0',
  green: '#10B981', redDown: '#EF4444', cream: '#FAF9F6',
  amber: '#F59E0B',
};

/* ── HTML Sections (styled for Beehiiv HTML import) ───────────────── */

const BUCKET_LABELS = {
  'Brands': 'DC Brands Index',
  'Marketplaces': 'DC Marketplace Index',
  'Software': 'DC Software Index',
};

const BUCKET_ICONS = {
  'Brands': '&#128085;',
  'Marketplaces': '&#128722;',
  'Software': '&#128187;',
};

const BUCKET_COLORS = {
  'Brands': '#9333ea',
  'Marketplaces': '#0ea5e9',
  'Software': '#10B981',
};

function buildTopStory(quotes) {
  if (quotes.length === 0) return '';

  // Pick the biggest absolute mover as the top story
  const sorted = [...quotes].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  const star = sorted[0];
  const abs = Math.abs(star.changePercent);
  const direction = star.changePercent >= 0 ? 'surged' : 'dropped';
  const idx = BUCKET_LABELS[star.bucket] || star.bucket || '';

  // Generate a short editorial blurb about the top mover
  let blurb;
  if (abs >= 50) {
    blurb = `${star.name} (${star.symbol}) ${direction} an eye-watering ${abs.toFixed(1)}% yesterday, making it the standout move across our ${idx}. A move this size usually signals a major catalyst &mdash; whether it&rsquo;s a turnaround story, a short squeeze, or the market finally repricing the business. One to watch closely.`;
  } else if (abs >= 10) {
    blurb = `${star.name} (${star.symbol}) ${direction} ${abs.toFixed(1)}% yesterday, leading the ${idx}. Big single-day moves like this tend to set the tone for the week &mdash; keep an eye on whether momentum holds or fades.`;
  } else if (abs >= 5) {
    blurb = `${star.name} (${star.symbol}) ${direction} ${abs.toFixed(1)}%, the biggest swing in the ${idx} yesterday. Not earth-shattering, but notable in a market that&rsquo;s been trading in tight ranges.`;
  } else {
    blurb = `${star.name} (${star.symbol}) led the day at ${star.changePercent >= 0 ? '+' : ''}${star.changePercent.toFixed(1)}% in the ${idx}. Quiet day across the board &mdash; sometimes the best move is no move.`;
  }

  return `
    ${sectionHeading('Top Story')}

    <!-- Hero image placeholder -->
    <div style="background:#F1F5F9;border:2px dashed ${C.border};border-radius:10px;padding:48px 20px;text-align:center;margin-bottom:16px">
      <span style="font-size:13px;color:${C.light};font-weight:500">[ Hero image ]</span>
    </div>

    <div style="margin-bottom:32px">
      <div style="display:inline-block;margin-bottom:10px">
        ${logoImg(star.symbol, 24)}
        <span style="font-size:20px;font-weight:800;color:${C.navy};vertical-align:middle">${star.name}</span>
        <span style="font-size:20px;font-weight:800;color:${pctColor(star.changePercent)};vertical-align:middle;margin-left:8px">${fmtPct(star.changePercent)}</span>
      </div>
      <p style="font-size:15px;color:${C.grey};line-height:1.65;margin:0">${blurb}</p>
    </div>`;
}

function sectionHeading(title) {
  return `<div style="font-size:11px;font-weight:700;color:${C.red};text-transform:uppercase;letter-spacing:0.1em;padding-bottom:10px;border-bottom:2px solid ${C.navy};margin:32px 0 16px">${title}</div>`;
}

/* Top Article — featured DC editorial piece. Sits above Top News Headlines.
   Pulls the newest article from Sanity by default. */
function buildTopArticleSection(article, overrideImageUrl) {
  if (!article) return '';
  const url = article.substackUrl?.includes('dollarcommerce')
    ? article.substackUrl
    : `${SITE_URL}/article/${article.slug}`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const imageUrl = overrideImageUrl
    || (article.imageUrl ? `${article.imageUrl}?w=1200&h=630&fit=crop` : null);

  return `
    ${sectionHeading('Top Article')}
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:12px;overflow:hidden;margin-bottom:16px">
      ${imageUrl ? `<a href="${url}" style="display:block;text-decoration:none"><img src="${imageUrl}" alt="${article.title}" style="width:100%;display:block" /></a>` : ''}
      <div style="padding:22px 22px 24px">
        ${article.category ? `<div style="font-size:10px;font-weight:700;color:${C.red};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">${article.category}</div>` : ''}
        <a href="${url}" style="font-size:22px;font-weight:800;color:${C.navy};text-decoration:none;line-height:1.25;display:block;margin-bottom:8px">${article.title}</a>
        ${article.excerpt ? `<p style="font-size:14px;color:${C.grey};line-height:1.5;margin:0 0 14px">${article.excerpt}</p>` : ''}
        <div style="font-size:12px;color:${C.light};margin-bottom:14px">
          ${article.author || ''}${date ? ` &middot; ${date}` : ''}
        </div>
        <a href="${url}" style="display:inline-block;padding:10px 22px;background:${C.navy};color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.02em">Read the article &rarr;</a>
      </div>
    </div>`;
}

/* Top News Headlines — e-commerce news from across the web (NOT DC editorial).
   Auto-fills the first 2 slots from the platform-tracker scraper; leaves a
   manual placeholder for the editor to paste a story + link each morning. */
function buildTopNewsSection(newsItems) {
  const picks = (newsItems || []).slice(0, 2);

  const renderItem = (item, isLast) => {
    const date = item.reportedAt
      ? new Date(item.reportedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';
    const summary = (item.summary || '').replace(/<[^>]+>/g, '').slice(0, 170);
    return `
      <div style="padding:16px 18px;border-bottom:${isLast ? 'none' : `1px solid ${C.border}`}">
        <div style="font-size:10px;font-weight:700;color:${C.red};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">${item.platform || 'News'}</div>
        <a href="${item.sourceUrl || '#'}" style="font-size:15px;font-weight:700;color:${C.navy};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px">${item.title}</a>
        ${summary ? `<p style="font-size:13px;color:${C.grey};line-height:1.5;margin:0 0 8px">${summary}${summary.length >= 170 ? '&hellip;' : ''}</p>` : ''}
        <div style="font-size:11px;color:${C.light}">
          ${item.sourceName || ''}${date ? ` &middot; ${date}` : ''}
          ${item.sourceUrl ? `<a href="${item.sourceUrl}" style="color:${C.red};text-decoration:none;font-weight:600;margin-left:10px">Read &rarr;</a>` : ''}
        </div>
      </div>`;
  };

  // Manual placeholder slot — editor pastes the 3rd story each morning
  const placeholder = `
    <div style="padding:16px 18px;border-bottom:none;background:#FDFCF8">
      <div style="font-size:10px;font-weight:700;color:#CBD5E1;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">[ CATEGORY ]</div>
      <a href="#MANUAL_HEADLINE_URL" style="font-size:15px;font-weight:700;color:#94A3B8;text-decoration:none;line-height:1.35;display:block;margin-bottom:6px">[ Paste your 3rd headline here ]</a>
      <p style="font-size:13px;color:#CBD5E1;line-height:1.5;margin:0 0 8px">[ Quick summary of the story &mdash; 1-2 sentences that explain what happened and why it matters. ]</p>
      <div style="font-size:11px;color:#CBD5E1">
        [ Source ]
        <a href="#MANUAL_HEADLINE_URL" style="color:#D2042D;text-decoration:none;font-weight:600;margin-left:10px">Read &rarr;</a>
      </div>
    </div>`;

  const autoRows = picks.map((item, i) => renderItem(item, false)).join('');

  return `
    ${sectionHeading('Top News Headlines')}
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:16px">
      ${autoRows}
      ${placeholder}
    </div>`;
}

function buildIndexSection(dcIndex, quotes, ytdData) {
  if (!dcIndex?.overallWeighted) return '';

  // Use cap-weighted index data
  const overall = dcIndex.overallWeighted;
  const buckets = dcIndex.bucketsWeighted || [];

  const bucketMap = {};
  for (const q of quotes) {
    if (!bucketMap[q.bucket]) bucketMap[q.bucket] = [];
    bucketMap[q.bucket].push(q);
  }

  // Compute cap-weighted 1D change from the overall index weights
  const allChanges = quotes.filter(q => q.changePercent !== undefined);
  let avg1D = 0;
  if (overall.weights && Object.keys(overall.weights).length > 0) {
    const valid = allChanges.filter(s => overall.weights[s.symbol]);
    const totalW = valid.reduce((acc, s) => acc + (overall.weights[s.symbol] ?? 0), 0);
    if (totalW > 0) {
      avg1D = valid.reduce((acc, s) => acc + (overall.weights[s.symbol] ?? 0) * s.changePercent, 0) / totalW;
    }
  } else if (allChanges.length > 0) {
    avg1D = allChanges.reduce((s, q) => s + q.changePercent, 0) / allChanges.length;
  }

  // Helper: compute a weighted average for a given set of stocks over a value-fn.
  // Uses the passed-in weights map; falls back to simple average if no weights.
  const weightedAvg = (stocks, weights, valueFn) => {
    const valid = stocks.filter((s) => valueFn(s) != null);
    if (valid.length === 0) return null;
    if (weights && Object.keys(weights).length > 0) {
      const filtered = valid.filter((s) => weights[s.symbol] != null);
      const totalW = filtered.reduce((a, s) => a + (weights[s.symbol] ?? 0), 0);
      if (totalW > 0) {
        return filtered.reduce((a, s) => a + (weights[s.symbol] ?? 0) * valueFn(s), 0) / totalW;
      }
    }
    return valid.reduce((a, s) => a + valueFn(s), 0) / valid.length;
  };

  // Overall YTD — cap-weighted across all stocks that have YTD data
  let ytdPct = null;
  if (ytdData) {
    const stocksWithYtd = quotes.map((q) => ({
      symbol: q.symbol,
      ytd: ytdData[q.symbol]?.periodChangePct,
    }));
    ytdPct = weightedAvg(stocksWithYtd, overall.weights || {}, (s) => s.ytd);
  }

  const bucketRows = buckets.map(b => {
    const stocks = bucketMap[b.bucket] || [];
    // Cap-weighted 1D change per bucket
    const avgChange = weightedAvg(stocks, b.weights || {}, (s) => s.changePercent) ?? 0;
    // Cap-weighted YTD change per bucket
    let avgYtd = null;
    if (ytdData) {
      const stocksWithYtd = stocks.map((q) => ({
        symbol: q.symbol,
        ytd: ytdData[q.symbol]?.periodChangePct,
      }));
      avgYtd = weightedAvg(stocksWithYtd, b.weights || {}, (s) => s.ytd);
    }
    const icon = BUCKET_ICONS[b.bucket] || '';
    const label = BUCKET_LABELS[b.bucket] || b.bucket;
    const bColor = BUCKET_COLORS[b.bucket] || C.navy;
    const ytdCell = avgYtd != null
      ? `<td style="padding:12px 14px 12px 4px;font-size:13px;font-weight:600;color:${pctColor(avgYtd)};border-bottom:1px solid ${C.border};text-align:right;vertical-align:middle;white-space:nowrap">${fmtPct(avgYtd)}</td>`
      : `<td style="padding:12px 14px 12px 4px;font-size:13px;color:${C.light};border-bottom:1px solid ${C.border};text-align:right;vertical-align:middle">&mdash;</td>`;
    return `<tr>
      <td style="padding:12px 12px;font-size:14px;font-weight:600;color:${C.navy};border-bottom:1px solid ${C.border};vertical-align:middle">
        <span style="color:${bColor};margin-right:8px">${icon}</span>${label}
      </td>
      <td style="padding:12px 4px;font-size:15px;font-weight:700;color:${C.navy};border-bottom:1px solid ${C.border};text-align:right;vertical-align:middle;white-space:nowrap">${Number(b.value).toFixed(1)}</td>
      <td style="padding:12px 4px;font-size:13px;font-weight:600;color:${pctColor(avgChange)};border-bottom:1px solid ${C.border};text-align:right;vertical-align:middle;white-space:nowrap">${fmtPct(avgChange)}</td>
      ${ytdCell}
    </tr>`;
  }).join('');

  return `
    ${sectionHeading('Everything Public')}

    <div style="background:${C.navy};border-radius:12px;padding:24px 28px;margin-bottom:16px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${C.amber};margin-bottom:10px">DC INDEX</div>
      <div>
        <span style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-0.5px">${Number(overall.value).toFixed(1)}</span>
        <span style="font-size:16px;font-weight:600;color:${avg1D >= 0 ? C.green : C.redDown};margin-left:14px">${fmtPct(avg1D)}</span>
        <span style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:4px">1D</span>
        ${ytdPct !== null
          ? `<span style="font-size:13px;font-weight:600;color:${ytdPct >= 0 ? C.green : C.redDown};margin-left:16px">${fmtPct(ytdPct)}</span><span style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:4px">YTD</span>`
          : ''}
      </div>
      <div style="margin-top:12px"><a href="${SITE_URL}/dc-index" style="font-size:11px;color:rgba(255,255,255,0.35);text-decoration:none">View full index &rarr;</a></div>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:16px;table-layout:fixed">
      <colgroup>
        <col />
        <col style="width:58px" />
        <col style="width:82px" />
        <col style="width:82px" />
      </colgroup>
      <thead>
        <tr style="background:#F8FAFC">
          <th style="padding:10px 12px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid ${C.border}">Index</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:right;border-bottom:1px solid ${C.border}">Value</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:right;border-bottom:1px solid ${C.border}">1D</th>
          <th style="padding:10px 14px 10px 4px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:right;border-bottom:1px solid ${C.border}">YTD</th>
        </tr>
      </thead>
      <tbody>${bucketRows}</tbody>
    </table>`;
}

function buildMoversSection(quotes, ytdData) {
  if (quotes.length === 0) return '';

  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();

  // Wider ticker column + generous left padding on name so the stock name
  // gets clear breathing room from the ticker. Out of 600px:
  //   logo 32 + ticker 72 + name flex + 1D 82 + YTD 82 = 268 + name
  const COLGROUP = `
    <colgroup>
      <col style="width:32px" />
      <col style="width:72px" />
      <col />
      <col style="width:82px" />
      <col style="width:82px" />
    </colgroup>`;

  function moverRow(q, isLast) {
    const border = isLast ? 'none' : `1px solid ${C.border}`;
    const ytd = ytdData?.[q.symbol]?.periodChangePct;
    const ytdCell = ytd != null
      ? `<td style="padding:12px 14px 12px 4px;border-bottom:${border};font-size:13px;font-weight:700;color:${pctColor(ytd)};text-align:right;vertical-align:middle;white-space:nowrap">${fmtPct(ytd)}</td>`
      : `<td style="padding:12px 14px 12px 4px;border-bottom:${border};font-size:13px;color:${C.light};text-align:right;vertical-align:middle">&mdash;</td>`;
    return `<tr>
      <td style="padding:12px 0 12px 12px;border-bottom:${border};vertical-align:middle;width:32px">${logoImg(q.symbol, 20)}</td>
      <td style="padding:12px 4px 12px 6px;border-bottom:${border};font-size:14px;font-weight:700;color:${C.navy};vertical-align:middle;white-space:nowrap">${q.symbol}</td>
      <td style="padding:12px 4px 12px 16px;border-bottom:${border};font-size:13px;color:${C.grey};vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${q.name}</td>
      <td style="padding:12px 4px;border-bottom:${border};font-size:13px;font-weight:700;color:${pctColor(q.changePercent)};text-align:right;vertical-align:middle;white-space:nowrap">${fmtPct(q.changePercent)}</td>
      ${ytdCell}
    </tr>`;
  }

  const tableHead = `
    <thead>
      <tr style="background:#F8FAFC">
        <th colspan="3" style="padding:10px 12px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid ${C.border}">Ticker</th>
        <th style="padding:10px 4px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:right;border-bottom:1px solid ${C.border}">1D</th>
        <th style="padding:10px 14px 10px 4px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:right;border-bottom:1px solid ${C.border}">YTD</th>
      </tr>
    </thead>`;

  return `
    <div style="font-size:10px;font-weight:700;color:${C.green};text-transform:uppercase;letter-spacing:0.06em;margin:16px 0 8px">&#9650; TOP MOVERS</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:16px;table-layout:fixed">
      ${COLGROUP}
      ${tableHead}
      <tbody>${gainers.map((q, i) => moverRow(q, i === gainers.length - 1)).join('')}</tbody>
    </table>

    <div style="font-size:10px;font-weight:700;color:${C.redDown};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">&#9660; TOP FALLERS</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:16px;table-layout:fixed">
      ${COLGROUP}
      ${tableHead}
      <tbody>${losers.map((q, i) => moverRow(q, i === losers.length - 1)).join('')}</tbody>
    </table>`;
}

function buildFundraisingSection(events) {
  if (!events || events.length === 0) {
    return `
      ${sectionHeading('Deal Flow & Fundraising')}
      <p style="font-size:13px;color:${C.light};text-align:center;padding:20px 0"><em>No new deals this week &mdash; check back tomorrow.</em></p>`;
  }

  const totalRaised = events.reduce((s, e) => s + (e.amountUsd || 0), 0);
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayCount = events.filter(e => e.announcedAt?.slice(0, 10) === todayISO).length;
  const timeLabel = todayCount > 0
    ? `${todayCount} new today &middot; ${events.length} this week`
    : `${events.length} deal${events.length !== 1 ? 's' : ''} this week`;

  const rows = events.map(ev => {
    const company = ev.sourceUrl
      ? `<a href="${ev.sourceUrl}" style="color:${C.navy};text-decoration:none;font-weight:600">${ev.company}</a>`
      : `<span style="font-weight:600">${ev.company}</span>`;
    return `<tr>
      <td style="padding:10px 14px;font-size:13px;color:${C.navy};border-bottom:1px solid ${C.border}">${company}</td>
      <td style="padding:10px 14px;font-size:13px;color:${C.grey};border-bottom:1px solid ${C.border}">${ev.amountText || '&mdash;'}</td>
      <td style="padding:10px 14px;font-size:13px;color:${C.grey};border-bottom:1px solid ${C.border}">${ev.round || '&mdash;'}</td>
      <td style="padding:10px 14px;font-size:13px;color:${C.light};border-bottom:1px solid ${C.border}">${ev.sector || '&mdash;'}</td>
    </tr>`;
  }).join('');

  return `
    ${sectionHeading('Deal Flow & Fundraising')}
    <div style="margin-bottom:10px">
      <span style="font-size:13px;color:${C.grey};font-weight:500">${timeLabel}</span>
      ${totalRaised > 0 ? `<span style="font-size:13px;color:${C.grey}"> &middot; ${fmtUsd(totalRaised)} raised</span>` : ''}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden;margin-bottom:8px">
      <thead>
        <tr style="background:#F8FAFC">
          <th style="padding:10px 14px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid ${C.border}">Company</th>
          <th style="padding:10px 14px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid ${C.border}">Amount</th>
          <th style="padding:10px 14px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid ${C.border}">Round</th>
          <th style="padding:10px 14px;font-size:10px;font-weight:700;color:${C.light};text-transform:uppercase;letter-spacing:0.05em;text-align:left;border-bottom:1px solid ${C.border}">Sector</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <a href="${SITE_URL}/fundraising-tracker" style="font-size:12px;color:${C.red};text-decoration:none;font-weight:600">View all deals &rarr;</a>`;
}

function buildArticlesSection(articles) {
  if (!articles || articles.length === 0) return '';

  const cards = articles.map((a, i) => {
    const url = a.substackUrl || `${SITE_URL}/article/${a.slug}`;
    const date = a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';
    const isFirst = i === 0;
    const imgUrl = a.imageUrl ? `${a.imageUrl}?w=${isFirst ? 560 : 120}&h=${isFirst ? 300 : 80}&fit=crop` : null;
    const readBtn = `<a href="${url}" style="display:inline-block;margin-top:10px;padding:8px 20px;background:${C.navy};color:#fff;font-size:12px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.03em">Read &rarr;</a>`;

    if (isFirst) {
      return `
        <div style="padding:0 0 16px;border-bottom:1px solid ${C.border}">
          ${imgUrl ? `<a href="${url}" style="text-decoration:none"><img src="${imgUrl}" alt="" style="width:100%;border-radius:8px;margin-bottom:12px;display:block" /></a>` : ''}
          ${a.category ? `<div style="font-size:10px;font-weight:700;color:${C.red};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">${a.category}</div>` : ''}
          <a href="${url}" style="font-size:18px;font-weight:700;color:${C.navy};text-decoration:none;line-height:1.3;display:block">${a.title}</a>
          ${a.excerpt ? `<p style="font-size:13px;color:${C.grey};line-height:1.5;margin:6px 0 0">${a.excerpt}</p>` : ''}
          <div style="font-size:11px;color:${C.light};margin-top:6px">${a.author || ''}${date ? ` &middot; ${date}` : ''}</div>
          ${readBtn}
        </div>`;
    }

    return `
      <div style="padding:14px 0;border-bottom:${i < articles.length - 1 ? `1px solid ${C.border}` : 'none'}">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${imgUrl ? `<td width="100" style="vertical-align:top;padding-right:14px"><a href="${url}"><img src="${imgUrl}" alt="" style="width:100px;height:68px;border-radius:6px;object-fit:cover;display:block" /></a></td>` : ''}
          <td style="vertical-align:top">
            ${a.category ? `<div style="font-size:10px;font-weight:700;color:${C.red};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px">${a.category}</div>` : ''}
            <a href="${url}" style="font-size:15px;font-weight:700;color:${C.navy};text-decoration:none;line-height:1.3">${a.title}</a>
            <div style="font-size:11px;color:${C.light};margin-top:4px">${a.author || ''}${date ? ` &middot; ${date}` : ''}</div>
            <a href="${url}" style="font-size:11px;color:${C.red};font-weight:600;text-decoration:none;margin-top:4px;display:inline-block">Read &rarr;</a>
          </td>
        </tr></table>
      </div>`;
  }).join('');

  return `
    ${sectionHeading('Featured on Dollar Commerce')}
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 20px 4px">
      ${cards}
    </div>
    <div style="margin-top:8px">
      <a href="https://dollarcommerce.substack.com" style="font-size:12px;color:${C.red};text-decoration:none;font-weight:600">Read more on Dollar Commerce &rarr;</a>
    </div>`;
}

/* ── Intro generator (Exec Sum style) ──────────── */

function generateIntro(dcIndex, quotes, fundraising, articles) {
  const sentences = [];

  // Sentence 1: Market vibe — lead with the most interesting stock move or index direction
  if (quotes.length > 0) {
    const sorted = [...quotes].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    const big = sorted[0];
    const abs = Math.abs(big.changePercent);

    if (abs >= 5) {
      const verb = big.changePercent >= 0 ? 'ripped' : 'cratered';
      sentences.push(`${big.name} ${verb} ${abs.toFixed(1)}% yesterday, because apparently ${big.changePercent >= 0 ? 'everyone remembered they exist' : 'investors discovered the sell button'}.`);
    } else if (abs >= 2) {
      const verb = big.changePercent >= 0 ? 'led the charge' : 'led the sell-off';
      sentences.push(`${big.name} ${verb} at ${big.changePercent >= 0 ? '+' : ''}${big.changePercent.toFixed(1)}% — the DC Index ${dcIndex?.overallWeighted ? `sits at ${Number(dcIndex.overallWeighted.value).toFixed(1)}` : 'held steady'} as e-commerce stocks ${big.changePercent >= 0 ? 'caught a bid' : 'took a breather'}.`);
    } else {
      // Quiet day
      const greens = quotes.filter(q => q.changePercent >= 0).length;
      const mood = greens > quotes.length / 2 ? 'mostly green' : 'mixed';
      sentences.push(`Markets were ${mood} and uneventful yesterday — the DC Index ${dcIndex?.overallWeighted ? `closed at ${Number(dcIndex.overallWeighted.value).toFixed(1)}` : 'held flat'}, which is Wall Street's way of saying "check back tomorrow."`);
    }
  } else if (dcIndex?.overall) {
    sentences.push(`The DC Index is holding at ${Number(dcIndex.overallWeighted.value).toFixed(1)} — not thrilling, but not on fire either.`);
  }

  // Sentence 2: Deal flow / fundraising color
  if (fundraising && fundraising.length > 0) {
    const totalRaised = fundraising.reduce((s, e) => s + (e.amountUsd || 0), 0);
    const biggestDeal = fundraising.reduce((a, b) => (b.amountUsd || 0) > (a.amountUsd || 0) ? b : a, fundraising[0]);

    if (fundraising.length >= 5) {
      sentences.push(`${fundraising.length} deals crossed the wire this week totalling ${fmtUsd(totalRaised)} — VCs clearly didn't get the "wait for a pullback" memo${biggestDeal.company ? `, with ${biggestDeal.company} leading the pack` : ''}.`);
    } else if (fundraising.length > 0) {
      sentences.push(`On the deal front, ${fundraising.length} round${fundraising.length !== 1 ? 's' : ''} landed this week${totalRaised > 0 ? ` totalling ${fmtUsd(totalRaised)}` : ''}${biggestDeal.company ? ` — ${biggestDeal.company} grabbed the biggest cheque` : ''}.`);
    }
  } else {
    sentences.push(`Deal flow was quiet this week — either everyone's saving dry powder or their term sheets are stuck in legal.`);
  }

  // Sentence 3: Featured content hook or general sign-off
  const recentArticle = articles[0];
  const articleIsRecent = recentArticle?.publishedAt &&
    (Date.now() - new Date(recentArticle.publishedAt).getTime()) < 30 * 60 * 60 * 1000;

  if (articleIsRecent && recentArticle.title) {
    sentences.push(`Plus, we published "${recentArticle.title}" — scroll down or regret it later.`);
  } else {
    const activeBuckets = quotes.length > 0
      ? [...new Set(quotes.slice(0, 10).map(q => BUCKET_LABELS[q.bucket] || q.bucket))].slice(0, 2).join(' and ')
      : 'e-commerce';
    sentences.push(`Here's what's moving across ${activeBuckets} — your 3-minute briefing starts now.`);
  }

  // Replace Unicode chars with HTML entities for email safety
  return sentences.join(' ')
    .replace(/—/g, '&mdash;')
    .replace(/–/g, '&ndash;')
    .replace(/\u201C/g, '&ldquo;')
    .replace(/\u201D/g, '&rdquo;')
    .replace(/\u2018/g, '&lsquo;')
    .replace(/\u2019/g, '&rsquo;');
}

/* ── Full newsletter ────────────────────────────── */

function buildNewsletter(articles, dcIndex, quotes, fundraising, ytdData, platformNews) {
  const hero = articles[0];

  // Intro paragraph — 3-sentence editorial overview, Exec Sum style
  const introPara = generateIntro(dcIndex, quotes, fundraising, articles);

  // Subject line
  const subject = generateSubject(articles, dcIndex, quotes);

  // Logo URL (hosted on Beehiiv CDN)
  const logoUrl = process.env.DC_LOGO_URL || 'DC_LOGO_URL';
  const subheading = shortDate;

  return {
    subject,
    html: `<meta charset="utf-8" />
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:${C.navy}">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px">
        <img src="${logoUrl}" alt="Dollar Commerce" style="max-width:280px;height:auto;display:block;margin:0 auto 8px" />
        <div style="font-size:13px;color:${C.light};font-weight:500">${subheading}</div>
      </div>

      <!-- Intro -->
      <p style="font-size:15px;color:${C.grey};line-height:1.65;margin:0 0 28px">${introPara}</p>

      ${buildTopStory(quotes)}

      ${buildTopArticleSection(articles?.[0])}

      ${buildTopNewsSection(platformNews)}

      ${buildIndexSection(dcIndex, quotes, ytdData)}
      ${buildMoversSection(quotes, ytdData)}
      ${buildFundraisingSection(fundraising)}
      ${buildArticlesSection(articles?.slice(1))}

    </div>`,
  };
}

/* ── Subject line ───────────────────────────────── */

function generateSubject(articles, dcIndex, quotes) {
  // Only use article title if published in the last ~30 hours (yesterday or today)
  const recentArticle = articles[0];
  const articleIsRecent = recentArticle?.publishedAt &&
    (Date.now() - new Date(recentArticle.publishedAt).getTime()) < 30 * 60 * 60 * 1000;

  if (articleIsRecent) {
    const t = recentArticle.title.length > 55
      ? recentArticle.title.slice(0, 52) + '...'
      : recentArticle.title;
    return t;
  }

  // No recent article — build a market-oriented subject
  const parts = [];

  // Lead with top mover if notable
  if (quotes.length > 0) {
    const sorted = [...quotes].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    const bigMover = sorted[0];
    if (Math.abs(bigMover.changePercent) >= 2) {
      const dir = bigMover.changePercent >= 0 ? '↑' : '↓';
      parts.push(`${bigMover.name} ${dir}${Math.abs(bigMover.changePercent).toFixed(1)}%`);
    }
  }

  // DC Index direction
  if (dcIndex?.overallWeighted) {
    const ytd = Number(dcIndex.overallWeighted.value) - 100;
    const dir = ytd >= 0 ? 'up' : 'down';
    parts.push(`DC Index ${dir} ${Math.abs(ytd).toFixed(0)}% since inception`);
  }

  if (parts.length === 0) return `Dollar Commerce Daily \u2014 ${shortDate}`;
  return parts.join(' | ');
}

/* ── Main ─────────────────────────────────────── */

async function main() {
  console.log('📰 Generating Dollar Commerce newsletter...\n');

  if (!process.env.GMAIL_REFRESH_TOKEN && !DRY_RUN) {
    console.error('❌ Missing GMAIL_REFRESH_TOKEN. Run: node --env-file=.env.local scripts/gmail-auth.mjs');
    process.exit(1);
  }

  console.log('   Loading logos...');
  await loadLogos();

  console.log('   Fetching articles, DC Index, fundraising, stock quotes, YTD...');

  const [articles, dcIndex, fundraising, ytdData, platformNews] = await Promise.all([
    getLatestArticles(4),
    getDcIndexData(),
    getRecentFundraising(),
    getYtdData(),
    getLatestPlatformNews(2),
  ]);

  // Get stock quotes from DC Index API response (all 116 in one call)
  const quotes = await getStockQuotes(dcIndex);

  console.log(`   ${articles.length} articles`);
  console.log(`   DC Index (cap-weighted): ${dcIndex?.overallWeighted?.value || 'unavailable'}`);
  console.log(`   ${fundraising.length} fundraising deals`);
  console.log(`   ${quotes.length} stock quotes`);
  console.log(`   ${platformNews.length} platform news headlines`);
  console.log(`   YTD data: ${ytdData ? Object.keys(ytdData).length + ' symbols' : 'unavailable'}`);

  const { subject, html } = buildNewsletter(articles, dcIndex, quotes, fundraising, ytdData, platformNews);

  console.log(`\n   Subject: ${subject}`);

  if (DRY_RUN) {
    console.log('\n🔍 Dry run — email not sent.\n');
    console.log('── SUGGESTED SUBJECT ──');
    console.log(`   ${subject}\n`);
    console.log('── NEWSLETTER STRUCTURE ──');
    console.log('   1. Header: The Daily Briefing');
    console.log('   2. Intro paragraph');
    console.log('   3. [Hero image placeholder]');
    console.log(`   4. Everything Public: DC Index + ${dcIndex?.buckets?.length || 0} sectors`);
    console.log(`   5. Top Movers / Top Fallers (5 each)`);
    console.log(`   6. Deal Flow: ${fundraising.length} deals`);
    console.log(`   7. Articles: ${articles.length} featured`);
    console.log('   8. Footer');
    return;
  }

  // Save HTML file for Beehiiv import
  const fs = await import('fs');
  const path = await import('path');
  const outDir = path.join(process.cwd(), 'newsletter-drafts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const dateSlug = today.toISOString().slice(0, 10);
  const htmlPath = path.join(outDir, `dc-newsletter-${dateSlug}.html`);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`\n📄 HTML saved → ${htmlPath}`);

  // Auto-copy HTML to clipboard (macOS) for quick Beehiiv import
  try {
    const { execSync } = await import('child_process');
    execSync('pbcopy', { input: html, encoding: 'utf-8' });
    console.log('📋 HTML copied to clipboard — paste into Beehiiv HTML import');
  } catch {
    console.log('⚠️  Could not copy to clipboard — use the saved HTML file instead');
  }

  const emailSubject = `[DC Draft] ${subject}`;
  await sendEmail(RECIPIENT, emailSubject, html);
  console.log(`✅ Newsletter emailed to ${RECIPIENT}`);
  console.log('   → Clipboard ready for Beehiiv, or use the HTML file.');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  if (VERBOSE) console.error(err);
  process.exit(1);
});

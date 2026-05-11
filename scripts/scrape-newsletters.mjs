/**
 * Scrape fundraising data from Exec Sum newsletter emails in Gmail.
 *
 * Runs daily at 8am. Reads the latest Exec Sum emails, extracts fundraising
 * signals (company, amount, round), and upserts to Sanity's fundraisingEvent.
 *
 * Usage:
 *   node --env-file=.env.local scripts/scrape-newsletters.mjs
 *   node --env-file=.env.local scripts/scrape-newsletters.mjs --verbose
 *   node --env-file=.env.local scripts/scrape-newsletters.mjs --dry-run
 *
 * Prerequisites:
 *   - Run scripts/gmail-auth.mjs once to get GMAIL_REFRESH_TOKEN
 *   - AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, GMAIL_REFRESH_TOKEN in .env.local
 *   - SANITY_API_WRITE_TOKEN in .env.local
 */

import { google } from 'googleapis';
import { createClient } from '@sanity/client';
import crypto from 'crypto';

const VERBOSE = process.argv.includes('--verbose');
const DRY_RUN = process.argv.includes('--dry-run');

/* ── Gmail Setup ──────────────────────────────── */

const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
);
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

/* ── Sanity Setup ─────────────────────────────── */

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

/* ── Funding Pattern Detection ────────────────── */

const FUNDING_PATTERNS = [
  /rais(?:es?|ed|ing)\s+\$[\d,.]+\s*[BMKbmk]/i,
  /(?:series\s+[A-F]|seed|pre-seed)\s+(?:round|funding|raise)/i,
  /\$[\d,.]+\s*[BMKbmk]\s+(?:round|funding|raise|valuation)/i,
  /(?:secures?|closes?|lands?|bags?|nabs?)\s+\$[\d,.]+/i,
  /(?:acqui(?:res?|sition)|(?:gets?|is)\s+acquired)/i,
  /IPO|goes?\s+public|public\s+(?:listing|offering)/i,
  /(?:venture|vc|funding)\s+(?:round|deal|raise)/i,
];

const AMOUNT_RE = /\$\s*([\d,.]+)\s*([BMKbmk])/;
const ROUND_RE = /(?:Series\s+([A-F]\+?))|Pre-[Ss]eed|Seed|Growth|(?:Series\s+)?([A-F])\b/i;

const ROUND_MAP = {
  'pre-seed': 'Pre-seed',
  'seed': 'Seed',
  'a': 'Series A', 'b': 'Series B', 'c': 'Series C',
  'd': 'Series D', 'e': 'Series E', 'f': 'Series F',
  'growth': 'Growth',
};

function parseAmount(text) {
  const m = text.match(AMOUNT_RE);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ''));
  const mult = { b: 1e9, m: 1e6, k: 1e3 }[m[2].toLowerCase()] || 1;
  const val = num * mult;
  if (val > 20e9) return null; // reject obvious parse errors
  return val;
}

function parseRound(text) {
  const lower = text.toLowerCase();
  if (/acquisition|acquired|acquires/i.test(lower)) return 'Acquisition';
  if (/ipo|goes?\s+public|public\s+(?:listing|offering)/i.test(lower)) return 'IPO';

  const m = text.match(ROUND_RE);
  if (m) {
    const raw = (m[1] || m[2] || m[0]).toLowerCase().replace(/\+$/, '');
    return ROUND_MAP[raw] || 'Unknown';
  }

  if (/pre-seed/i.test(lower)) return 'Pre-seed';
  if (/\bseed\b/i.test(lower)) return 'Seed';
  if (/growth/i.test(lower)) return 'Growth';
  if (/debt|credit/i.test(lower)) return 'Debt';
  return 'Unknown';
}

function fmtUsd(n) {
  if (!n) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function inferSector(text) {
  const lower = text.toLowerCase();
  const checks = [
    [/\b(?:dtc|d2c|direct.to.consumer|shopify|ecommerce|e-commerce)\b/, 'DTC'],
    [/\b(?:marketplace|amazon|etsy|ebay)\b/, 'Marketplace'],
    [/\b(?:logistics|fulfillment|shipping|last.mile|supply.chain)\b/, 'Logistics'],
    [/\b(?:fintech|payments?|banking|neobank|crypto|defi)\b/, 'Fintech'],
    [/\b(?:saas|software|cloud|enterprise|b2b)\b/, 'SaaS'],
    [/\b(?:ai|artificial.intelligence|machine.learning|ml|llm|gpt)\b/, 'AI'],
    [/\b(?:health|healthtech|biotech|pharma|wellness|medical)\b/, 'Healthtech'],
    [/\b(?:food|grocery|meal|restaurant|delivery)\b/, 'Food & Bev'],
    [/\b(?:climate|clean.?tech|energy|solar|ev|carbon)\b/, 'Climate'],
    [/\b(?:edtech|education|learning)\b/, 'Edtech'],
    [/\b(?:proptech|real.estate|housing)\b/, 'Proptech'],
    [/\b(?:retail|brand|consumer)\b/, 'Retail'],
  ];
  for (const [re, sector] of checks) {
    if (re.test(lower)) return sector;
  }
  return 'Tech';
}

/* ── Email Parsing ────────────────────────────── */

function decodeBase64Url(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractBody(payload) {
  // Try direct body
  if (payload.body?.data) return decodeBase64Url(payload.body.data);

  // Try parts (multipart emails)
  if (payload.parts) {
    // Prefer text/plain, fall back to text/html
    for (const pref of ['text/plain', 'text/html']) {
      for (const part of payload.parts) {
        if (part.mimeType === pref && part.body?.data) {
          return decodeBase64Url(part.body.data);
        }
        // Nested parts
        if (part.parts) {
          for (const sub of part.parts) {
            if (sub.mimeType === pref && sub.body?.data) {
              return decodeBase64Url(sub.body.data);
            }
          }
        }
      }
    }
  }
  return '';
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractLinks(html) {
  const links = [];
  const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (url && text && !url.startsWith('mailto:') && !url.includes('unsubscribe')) {
      links.push({ url, text });
    }
  }
  return links;
}

function parseFundraisingFromEmail(body, htmlBody, emailDate, newsletterSrc = null) {
  // Traded VC has a clean pipe-delimited format that the generic
  // parser only catches partially. Use a dedicated parser when we
  // recognize this newsletter so we capture all 30+ deals per email.
  if (newsletterSrc?.name === 'Traded VC') {
    return parseTradedVcEmail(body, htmlBody, emailDate, newsletterSrc);
  }

  const events = [];
  const text = stripHtml(htmlBody || body);
  const links = extractLinks(htmlBody || '');

  // Split into sections/paragraphs
  const sections = text.split(/\n{2,}/);

  for (const section of sections) {
    const isFunding = FUNDING_PATTERNS.some(p => p.test(section));
    if (!isFunding) continue;

    const amount = parseAmount(section);
    const round = parseRound(section);
    const amountText = amount ? fmtUsd(amount) : null;

    // Try to extract company name — usually the first bold/notable phrase
    let company = null;

    // Pattern: "CompanyName raises $X..."
    const raiseMatch = section.match(/^([A-Z][A-Za-z0-9&.\-' ]{1,40})\s+(?:rais|secur|clos|land|bag|nab)/);
    if (raiseMatch) company = raiseMatch[1].trim();

    // Pattern: "CompanyName, a/the ..."
    if (!company) {
      const commaMatch = section.match(/^([A-Z][A-Za-z0-9&.\-' ]{1,40}),\s+(?:a|the|an)\s/);
      if (commaMatch) company = commaMatch[1].trim();
    }

    // Pattern: Pick the first capitalized multi-word phrase
    if (!company) {
      const capMatch = section.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/);
      if (capMatch) company = capMatch[1].trim();
    }

    if (!company || company.length < 2 || company.length > 60) continue;

    // Find a source link from nearby links
    let sourceUrl = null;
    let sourceName = null;
    for (const link of links) {
      if (link.text.toLowerCase().includes(company.toLowerCase().slice(0, 8)) ||
          section.toLowerCase().includes(link.text.toLowerCase().slice(0, 20))) {
        sourceUrl = link.url;
        // Extract domain as source name
        try {
          const host = new URL(link.url).hostname.replace('www.', '');
          sourceName = host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
        } catch {}
        break;
      }
    }

    // Fallback: use the first external link in the section
    if (!sourceUrl && links.length > 0) {
      const sectionLinks = links.filter(l =>
        !l.url.includes('execsum.co') && !l.url.includes('litquidity')
      );
      if (sectionLinks.length > 0) {
        sourceUrl = sectionLinks[0].url;
        try {
          const host = new URL(sourceUrl).hostname.replace('www.', '');
          sourceName = host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
        } catch {}
      }
    }

    if (!sourceUrl) sourceUrl = newsletterSrc?.fallbackUrl || 'https://www.execsum.co';
    if (!sourceName) sourceName = newsletterSrc?.sourceName || 'Exec Sum';

    const sector = inferSector(section);
    const description = section.slice(0, 500);

    // Hash the URL plus company+date so multiple signals from the same email
    // (which all share the execsum.co fallback URL) get distinct ids and
    // don't collapse into one record. Without the suffix, every Exec Sum
    // signal after the first one we ever scraped gets treated as a duplicate.
    const dedupKey = `${sourceUrl}|${company || ''}|${emailDate || ''}`;
    const urlHash = crypto.createHash('sha1').update(dedupKey).digest('hex').slice(0, 20);

    events.push({
      _id: `fundraising-nl-${urlHash}`,
      _type: 'fundraisingEvent',
      company,
      amountUsd: amount || undefined,
      amountText: amountText || undefined,
      round,
      sector,
      investors: [],
      announcedAt: emailDate,
      description,
      sourceUrl,
      sourceName,
      approved: true,
    });
  }

  return events;
}

/* ── Traded VC parser ─────────────────────────────
 *
 * Traded VC's "Dopamine Dealflow" body is rigorously structured:
 *
 *   ## Series B+ & Growth      (or Series A / Seed & Early / Strategic /
 *                               IPOs / VC Funds Raised & Raising)
 *
 *   * **Company | $Amount | Round | City, Region**
 *
 *     One-paragraph description. Often ends with "**Lead** led, joined by ..."
 *
 * The pipe-delimited deal header makes extraction trivial. We pull
 * company, amount, round and location directly, and keep the next
 * non-empty paragraph as the description.
 * ────────────────────────────────────────────────── */
function parseTradedVcEmail(body, htmlBody, emailDate, newsletterSrc) {
  const events = [];
  const text = stripHtml(htmlBody || body);

  // Match deal headers: bullet, optional [link wrapping], **Name | $X | Round | Location**
  // Examples seen in the wild:
  //   * **Anagram Therapeutics | $250M | Growth | Natick, MA**
  //   * [**Blitzy **](https://...)**| $200M | Series C | Cambridge, MA**
  //   * **QuTwo | $29M (€25M) | Angel | Helsinki, Finland**
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Strip markdown link wrapping around the company name. Traded VC
    // emits several variants, all of which need to collapse down to
    // **Name | $X | Round | Location**:
    //   [**Name **](url)**| $X ...   ← closing ** sits outside the link
    //   [**Name**](url) | $X ...
    //   **Name** | $X ...
    let cleaned = line
      // [**Name **](url)**...   →   **Name **...
      .replace(/\[(\*\*[^\]]+?)\]\([^)]+\)/g, '$1')
      // **Name **|   →   **Name** |
      .replace(/(\*\*[^*]+?)\s*\*\*\s*\*\*\s*\|/g, '$1** |')
      // **Name **| (no double **)   →   **Name** |
      .replace(/(\*\*[^*]+?)\s+\*\*\s*\|/g, '$1** |');

    // Pull the bolded "Company | Amount | Round | Location" block.
    // Allow the closing ** to appear either inline after the company
    // name or only at the very end of the location.
    const headerMatch = cleaned.match(
      /[*•\-]\s*\*\*\s*([^|*\n]+?)\s*(?:\*\*)?\s*\|\s*\$?([\d.,]+\s*[BMK](?:\s*\([^)]*\))?|Undisclosed|[\d.,]+\s*Valuation)\s*\|\s*([^|\n]+?)\s*\|\s*([^*\n]+?)\s*\*\*/i
    );
    if (!headerMatch) continue;

    const company = headerMatch[1].trim().replace(/\s+/g, ' ');
    const amountStr = headerMatch[2].trim();
    const roundStr = headerMatch[3].trim();
    const location = headerMatch[4].trim();

    // Skip the header row if it parsed something obviously bogus
    if (!company || company.length < 2 || company.length > 80) continue;

    // Look ahead for the description paragraph (next non-empty, non-header line)
    let description = '';
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const next = lines[j].trim();
      if (!next) continue;
      if (next.startsWith('#') || next.startsWith('*') || next.startsWith('-')) break;
      description = next;
      break;
    }

    // Parse the amount — supports "$200M", "$1.4B", "Undisclosed", "$22B Valuation"
    let amountUsd, amountText;
    if (/undisclosed/i.test(amountStr)) {
      amountText = 'Undisclosed';
    } else {
      const am = amountStr.match(/([\d.,]+)\s*([BMK])/i);
      if (am) {
        const num = parseFloat(am[1].replace(/,/g, ''));
        const mult = { B: 1e9, M: 1e6, K: 1e3 }[am[2].toUpperCase()] || 1;
        amountUsd = num * mult;
        amountText = `$${am[1]}${am[2].toUpperCase()}`;
        if (/valuation/i.test(amountStr)) amountText += ' Valuation';
      }
    }

    // Map round to canonical form. Traded uses Series A/B/C/D, Seed,
    // Pre-Seed, Angel, Growth, Secondary, VC Fund, Series A + B, etc.
    let round = roundStr;
    if (/^series\s+([a-f])(\+)?$/i.test(roundStr)) {
      const m = roundStr.match(/series\s+([a-f])/i);
      round = `Series ${m[1].toUpperCase()}`;
    } else if (/^seed/i.test(roundStr)) round = 'Seed';
    else if (/^pre-?seed/i.test(roundStr)) round = 'Pre-seed';
    else if (/^growth/i.test(roundStr)) round = 'Growth';
    else if (/^angel/i.test(roundStr)) round = 'Angel';
    else if (/^secondary/i.test(roundStr)) round = 'Secondary';
    else if (/vc\s+fund/i.test(roundStr)) round = 'VC Fund';
    else if (/extension/i.test(roundStr)) round = roundStr; // keep "Series D Extension"

    const sector = inferSector(`${company} ${description}`);

    // Stable id per (company, date) — a single Traded email can list
    // 30+ deals so we can't dedupe on URL alone.
    const dedupKey = `tradedvc|${company.toLowerCase()}|${emailDate || ''}`;
    const urlHash = crypto.createHash('sha1').update(dedupKey).digest('hex').slice(0, 20);

    events.push({
      _id: `fundraising-nl-${urlHash}`,
      _type: 'fundraisingEvent',
      company,
      amountUsd: amountUsd || undefined,
      amountText: amountText || undefined,
      round,
      sector,
      investors: [],
      announcedAt: emailDate,
      description: `${description} (${location})`.trim(),
      sourceUrl: newsletterSrc.fallbackUrl,
      sourceName: newsletterSrc.sourceName,
      approved: true,
    });
  }

  return events;
}

/* ── Main ─────────────────────────────────────── */

// Each entry defines a newsletter we want to scrape fundraising signals from.
// `gmailQuery` is a Gmail search filter; `sourceName` and `fallbackUrl` are
// stamped onto every event we parse from this newsletter so they show up
// correctly in the Deal Flow tracker.
//
// To add a new newsletter: append an object here and run the scraper. The
// parsing logic is shared (it splits the email body into sections and looks
// for "Company raises $X" patterns), so most beehiiv-style fundraising
// digests should work out of the box.
const NEWSLETTER_SOURCES = [
  {
    name: 'Exec Sum',
    sourceName: 'Exec Sum',
    gmailQuery: 'from:execsum.co newer_than:7d',
    fallbackUrl: 'https://www.execsum.co',
  },
  {
    name: 'This Week in CPG',
    sourceName: 'This Week in CPG',
    gmailQuery: 'from:thisweekincpg@mail.beehiiv.com newer_than:7d',
    fallbackUrl: 'https://thisweekincpg.beehiiv.com/',
  },
  {
    name: 'Traded VC',
    sourceName: 'Traded: Venture Capital',
    gmailQuery: 'from:newsletter@vc.traded.co newer_than:7d',
    fallbackUrl: 'https://vc.traded.co/',
  },
];

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN\n' : '📬 Scraping fundraising newsletters...\n');

  if (!process.env.GMAIL_REFRESH_TOKEN) {
    console.error('❌ Missing GMAIL_REFRESH_TOKEN. Run: node --env-file=.env.local scripts/gmail-auth.mjs');
    process.exit(1);
  }

  let totalEvents = 0;
  let newEvents = 0;
  let skipped = 0;

  for (const src of NEWSLETTER_SOURCES) {
    console.log(`\n══ ${src.name} ══`);
    const list = await gmail.users.messages.list({
      userId: 'me',
      q: src.gmailQuery,
      maxResults: 5,
    });

    const messages = list.data.messages || [];
    console.log(`Found ${messages.length} ${src.name} email(s) in last 7 days\n`);

    if (messages.length === 0) continue;

    for (const msg of messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const headers = full.data.payload.headers || [];
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
    const date = headers.find(h => h.name === 'Date')?.value;
    const emailDate = date ? new Date(date).toISOString() : new Date().toISOString();

    console.log(`📧 ${subject}`);
    console.log(`   Date: ${emailDate.slice(0, 10)}`);

    const body = extractBody(full.data.payload);
    const htmlBody = body.includes('<') ? body : '';
    const plainBody = htmlBody ? stripHtml(htmlBody) : body;

    const events = parseFundraisingFromEmail(plainBody, htmlBody, emailDate, src);
    console.log(`   Found ${events.length} fundraising signal(s)`);
    totalEvents += events.length;

    for (const ev of events) {
      if (VERBOSE) {
        console.log(`\n   → ${ev.company} | ${ev.amountText || '?'} | ${ev.round} | ${ev.sector}`);
        console.log(`     Source: ${ev.sourceUrl}`);
      }

      if (DRY_RUN) {
        newEvents++;
        continue;
      }

      // Dedup by _id (which now includes company+date), not by sourceUrl, so
      // multiple Exec Sum signals from the same email don't get collapsed.
      const exists = await sanity.fetch(
        `count(*[_id==$id])`,
        { id: ev._id }
      );

      if (exists > 0) {
        skipped++;
        if (VERBOSE) console.log(`     ⏭️  Already exists, skipping`);
        continue;
      }

      await sanity.createOrReplace(ev);
      newEvents++;
      if (VERBOSE) console.log(`     ✅ Created`);
    }

    console.log('');
    }
  }

  console.log('─'.repeat(40));
  console.log(`📊 Total fundraising signals: ${totalEvents}`);
  console.log(`   New: ${newEvents} | Skipped (dupe): ${skipped}`);
  if (DRY_RUN) console.log('\n🔍 Dry run — no data was written to Sanity.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  if (VERBOSE) console.error(err);
  process.exit(1);
});

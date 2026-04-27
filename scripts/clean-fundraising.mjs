#!/usr/bin/env node
/**
 * Fundraising cleanup pass.
 *
 * Two jobs:
 *   1. Blocklist   — delete documents that are obvious false positives
 *                    (parking lots, generic sector mentions, garbage company
 *                    names, etc.).
 *   2. Dedup       — group documents that clearly describe the same round
 *                    (same normalized company name + same amount OR within
 *                    7 days of each other) and keep only the "best" one.
 *                    Best = has an amount > has a round > oldest doc id.
 *
 * Idempotent. Safe to re-run.
 *
 * Usage: npm run clean:fundraising
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ---------- blocklist ---------------------------------------------------
// If the (lowercased) company name MATCHES any of these regexes, delete.
// These are noise the scraper let through because the headline contained an
// e-commerce keyword by coincidence.
const BLOCKLIST = [
  /^metropolis,?\s+biggest parking/i,           // parking lot network
  /^india['’]?s?\s+b2c\s+e-?commerce/i,         // sector, not a company
  /^india['’]?s?\s+b2c/i,
  /^india['’]?s?\s+b2b/i,
  /^opennai/i, /^openai, not yet public/i,      // openai isn't ecom
  /giant shein/i,                                // bad parse — becomes "Shein" after cleanup
  /^a timeline of/i,                             // "A timeline of what led up to Grüns" — backgrounder, not a round
  /^every\s/i,                                   // roundups
  /^top\s+\d+/i,                                 // listicles
  /^exclusive\s*\|/i,
  /^startup in spotlight/i,
  /^quick-?commerce battle/i,
  // Sentence-fragment garbage (title parsed as company by mistake)
  /\b(wants?|announces?|plans?|says?|told|will|could|aims?|seeks?|hopes?|expects?|looks?\s+to)\b/i,
  /\bit\s+just\b/i,
  /\s{2,}/,                                      // multiple consecutive spaces signal messy parse
  /^\s*$/,
  /^.{61,}$/,                                    // anything >60 chars is not a clean company name
  // Mojibake guard: UTF-8 bytes mis-decoded as Mac-Roman / cp1252 produce these
  // marker characters. Examples we've seen leak through:
  //   "Frankfurt,Äôs QuoIntelligence"  (apostrophe → ,Äô)
  //   "Seapoint: ,Ç¨7.5 Million"        (euro sign → ,Ç¨)
  // Anything carrying these markers is unsafe to ship to the newsletter.
  /[ÄÅÇÑÖÜâäåçèéêëîïôöûü][¨ô°§•ºπ£¢∞§¶•ªº]/,
  /,Ä[ôöÅùúû]/,
  /,Ç[¨°£¢]/,
  /Ã[©¨¶®]/,
];

// Normalize a company name for dedup comparison. We're aggressive here —
// strip punctuation, descriptors, geography, and common suffixes so that
// "Fashion quick commerce startup ZILO" and "ZILO" match as the same thing.
function normalize(name) {
  if (!name) return '';
  let s = name.toLowerCase();

  // Truncate at trailing clauses that leak in from the headline
  //   "NeoCognition, led by Ohio State's Yu Su" → "NeoCognition"
  //   "Syenta, which makes chips" → "Syenta"
  s = s.split(/,\s*(?:led by|which|backed by|a |an |the |previously)/i)[0];
  s = s.split(/\s+(?:led\s+by|backed\s+by|raises|raised|closes|files)\b/i)[0];

  // Drop possessive country/region prefixes: "australia's X" → "X"
  //   "britain's X" / "india's X" / "ohio's X" / "u.s. X"
  s = s.replace(/^(?:[a-z][a-z.\-]+?)['’]s\s+/i, '');

  s = s.replace(/['’`"]/g, '');
  s = s.replace(/[,.!?:;()\[\]{}]/g, ' ');

  const strip = [
    'fashion', 'baby', 'babycare', 'baby care', 'beauty', 'food', 'grocery',
    'b2b', 'b2c', 'd2c', 'dtc', 'quick commerce', 'quick-commerce', 'social commerce',
    'e-commerce', 'ecommerce', 'online', 'direct to consumer', 'direct-to-consumer',
    'startup', 'startups', 'company', 'firm', 'platform', 'marketplace',
    'indian', 'chinese', 'american', 'african', 'egyptian', 'pakistani',
    'kenyan', 'kuwaiti', 'nigerian', 'saudi', 'singapore', 'philippine',
    'vietnamese', 'korean', 'japanese', 'british', 'french', 'german',
    'australian', 'canadian', 'israeli', 'brazilian', 'dutch', 'mexican',
    'australia', 'india', 'britain', 'canada', 'israel', 'brazil',
    'full-stack', 'three-year-old', 'two-year-old', 'four-year-old',
    'drone', 'electric vehicle', 'logistics', 'solutions', 'wellness',
    'motorbike-based', 'ride-hailing and',
    // NEW — sector/category descriptors that create dupes
    'gaming', 'crypto', 'web3', 'blockchain', 'healthtech', 'medtech',
    'edtech', 'insurtech', 'proptech', 'climatetech', 'cleantech', 'biotech',
    'deeptech', 'quantum', 'defense', 'aerospace', 'space', 'chip',
    'semiconductor', 'ai', 'ai-powered', 'generative', 'genai', 'llm',
    'robotics', 'coding', 'tech', 'technology',
    // NEW — trade descriptors ("maker", "giant", "firm") and common headline words
    'maker', 'giant', 'group', 'inc', 'ltd', 'corp', 'plc',
    'raises', 'raised', 'closes', 'closed', 'secures', 'lands', 'bags',
  ];
  for (const p of strip) {
    s = s.replace(new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), '');
  }

  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// "Best" = the document we keep when a group is collapsed.
// Preference: has amountUsd > has specific round > earliest _createdAt (the
// scraper's initial run is the canonical one).
function pickBest(group) {
  return [...group].sort((a, b) => {
    const ahas = a.amountUsd ? 1 : 0;
    const bhas = b.amountUsd ? 1 : 0;
    if (ahas !== bhas) return bhas - ahas;
    const around = a.round && a.round !== 'Unknown' ? 1 : 0;
    const bround = b.round && b.round !== 'Unknown' ? 1 : 0;
    if (around !== bround) return bround - around;
    return (a._createdAt || '').localeCompare(b._createdAt || '');
  })[0];
}

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN');
    process.exit(1);
  }

  console.log('Fetching all fundraising events...');
  const docs = await client.fetch(
    `*[_type=="fundraisingEvent"]{_id, _createdAt, company, amountUsd, round, announcedAt}`
  );
  console.log(`  ${docs.length} total docs`);

  // ---------- phase 1: blocklist ----------
  const blocked = docs.filter((d) =>
    BLOCKLIST.some((rx) => rx.test(d.company || ''))
  );
  console.log(`\nBlocklist: ${blocked.length} matches`);
  blocked.slice(0, 20).forEach((d) => console.log(`  × ${d.company}`));
  if (blocked.length > 20) console.log(`  ... ${blocked.length - 20} more`);

  if (blocked.length > 0) {
    const tx = client.transaction();
    blocked.forEach((d) => tx.delete(d._id));
    await tx.commit();
    console.log(`  deleted ${blocked.length}`);
  }

  // ---------- phase 2: dedup ----------
  const remaining = docs.filter(
    (d) => !BLOCKLIST.some((rx) => rx.test(d.company || ''))
  );

  // Group by normalized company name
  const groups = new Map();
  for (const d of remaining) {
    const key = normalize(d.company);
    if (!key || key.length < 2) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  }

  // A group only needs collapsing if it has >1 docs AND the dates overlap
  // within 14 days (so multiple raises by the same company at different
  // times stay separate).
  const toDelete = [];
  let collapsed = 0;
  for (const [key, group] of groups.entries()) {
    if (group.length < 2) continue;

    // Sort by date ascending and walk, merging overlapping windows.
    const sorted = [...group].sort((a, b) =>
      (a.announcedAt || '').localeCompare(b.announcedAt || '')
    );
    const windows = [];
    for (const d of sorted) {
      const t = new Date(d.announcedAt || 0).getTime();
      const existing = windows.find(
        (w) => Math.abs(w.center - t) < 14 * 86400000
      );
      if (existing) {
        existing.members.push(d);
      } else {
        windows.push({ center: t, members: [d] });
      }
    }

    for (const w of windows) {
      if (w.members.length < 2) continue;
      const keeper = pickBest(w.members);
      const losers = w.members.filter((d) => d._id !== keeper._id);
      losers.forEach((l) => toDelete.push(l));
      collapsed++;
    }
  }

  console.log(`\nDedup: ${collapsed} groups collapsed, ${toDelete.length} duplicate docs to delete`);
  toDelete.slice(0, 10).forEach((d) => console.log(`  × ${d.company} (${d.announcedAt?.slice(0, 10)})`));

  if (toDelete.length > 0) {
    // Delete in batches of 100 to stay under mutation size limits.
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      const tx = client.transaction();
      batch.forEach((d) => tx.delete(d._id));
      await tx.commit();
    }
    console.log(`  deleted ${toDelete.length}`);
  }

  // ---------- summary ----------
  const finalCount = await client.fetch(`count(*[_type=="fundraisingEvent"])`);
  console.log(`\nDone. Final count: ${finalCount}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

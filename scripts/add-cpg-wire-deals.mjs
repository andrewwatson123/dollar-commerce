/**
 * One-shot: insert CPG Wire ("This Week in CPG") deals into Sanity.
 *
 * These come from the user's screenshot of thisweekincpg.beehiiv.com.
 * Parsed from post titles only — amounts, rounds, and announcement dates
 * are best-guess from the title, not from reading each post body.
 *
 * The CPG Wire scraper will take over once their first email arrives;
 * this is a one-shot backfill so the Deal Flow tracker reflects recent
 * CPG activity in the meantime.
 *
 * Usage:
 *   node --env-file=.env.local scripts/add-cpg-wire-deals.mjs
 */

import { createClient } from '@sanity/client';
import { createHash } from 'node:crypto';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Parsed from "This Week in CPG" post titles. Amount text preserved as-shown.
const DEALS = [
  // Apr 28 issue
  { company: 'Neutonic', amountText: '$6M', amountUsd: 6_000_000, announcedAt: '2026-04-28', sector: 'CPG', sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
  // Apr 23 issue
  { company: 'Frozen One', amountText: '$2M', amountUsd: 2_000_000, announcedAt: '2026-04-23', sector: 'CPG', sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
  // Apr 21 issue
  { company: 'Nomio', amountText: undefined, amountUsd: undefined, round: 'Seed', announcedAt: '2026-04-21', sector: 'CPG', investors: ['Collab Fund'], sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
  { company: 'Juice Runners', amountText: '$2M', amountUsd: 2_000_000, announcedAt: '2026-04-21', sector: 'CPG', sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
  // Apr 16 issue
  { company: 'Lucille', amountText: '7-Figures', amountUsd: 5_000_000, announcedAt: '2026-04-16', sector: 'CPG', sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
  // Apr 14 issue
  { company: 'Ripi', amountText: '$2.4M', amountUsd: 2_400_000, announcedAt: '2026-04-14', sector: 'CPG', sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
  // Apr 9 issue
  { company: 'Cadootz!', amountText: '$3M', amountUsd: 3_000_000, announcedAt: '2026-04-09', sector: 'CPG', sourceUrl: 'https://thisweekincpg.beehiiv.com/' },
];

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN');
    process.exit(1);
  }

  let created = 0;
  let existing = 0;
  for (const deal of DEALS) {
    // Stable id: hash company + announcedAt so re-runs don't dupe
    const idHash = createHash('sha1').update(`cpgwire-${deal.company}-${deal.announcedAt}`).digest('hex').slice(0, 20);
    const _id = `fundraising-cpg-${idHash}`;

    const exists = await client.fetch(`count(*[_id==$id])`, { id: _id });
    if (exists > 0) {
      console.log(`  · ${deal.company} — already in DB`);
      existing++;
      continue;
    }

    await client.createOrReplace({
      _id,
      _type: 'fundraisingEvent',
      company: deal.company,
      amountUsd: deal.amountUsd,
      amountText: deal.amountText,
      round: deal.round || 'Unknown',
      sector: deal.sector,
      investors: deal.investors || [],
      announcedAt: `${deal.announcedAt}T12:00:00.000Z`,
      sourceUrl: deal.sourceUrl,
      sourceName: 'This Week in CPG',
      approved: true,
    });
    console.log(`  ✅ ${deal.company} (${deal.amountText || '—'}) ${deal.announcedAt}`);
    created++;
  }

  console.log(`\nDone. Created ${created}, already-existing ${existing}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

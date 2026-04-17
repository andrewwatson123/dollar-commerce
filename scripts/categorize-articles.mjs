#!/usr/bin/env node
/**
 * One-shot categorization pass for imported articles.
 *
 * Your category rules from the brief:
 *   - Features → founder / brand / company features (Duckbill, Cheers Health,
 *     "12 days of commerce", IQBAR, guest features, etc.)
 *   - Opinion  → personal / random / sports / politics / life essays
 *   - Platforms → explicit platform, software, AI, or tech-change stories
 *                 (Meta, Facebook, Google, Amazon features, AI tools, ROAS, MMM)
 *   - E-Commerce → catch-all for industry pieces that aren't any of the above
 *
 * Seeds the four category docs if they don't exist, then updates every article
 * whose Substack slug matches one of the keyword rules.
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const CATEGORIES = [
  { id: 'category-e-commerce', title: 'E-Commerce', slug: 'e-commerce', color: '#D2042D', order: 10 },
  { id: 'category-platforms',  title: 'Platforms',  slug: 'platforms',  color: '#0066CC', order: 20 },
  { id: 'category-features',   title: 'Features',   slug: 'features',   color: '#9333EA', order: 30 },
  { id: 'category-opinion',    title: 'Opinion',    slug: 'opinion',    color: '#F59E0B', order: 40 },
  { id: 'category-tech',       title: 'Tech',       slug: 'tech',       color: '#10B981', order: 50 },
];

// Priority order matters — first match wins.
const RULES = [
  // Features: brand/founder features and "12 days of commerce" style
  { cat: 'category-features', match: (s) => /duckbill|cheers-health|baking-steel|abercrombie|dipsea|onlyfans|guinness|iqbar|on-running|hugz|hulken|jung-longevity|naomi-nomi|ben-cogan-guest|applovin-in-ecommerce|lemonade-business|action-supermarkets|boutique-fashion|twelve-days|cheers|hulken-bags|jung|naomi/.test(s) },

  // Platforms / software / AI / tech
  { cat: 'category-platforms', match: (s) => /facebook|meta|google|instagram|amazon-haul|amazon-fuel|nano-banana|veo|ai-creative|ai-in-recruiting|creative-generation|claude-creative|let-the-ai|duckbill|mmm|haus|applovin|ascending|auto-enhancements|existing-customer|gives-you-answers|manual-bidding|ai-come-to-you|metas|meta-vs-influencer|media-buyer|death-of-roas/.test(s) },

  // Opinion / personal / sports / politics / life
  { cat: 'category-opinion', match: (s) => /me-myself|tennis|break-point|dean-phillips|running-my-first-presidential|nil-|former-athlete|athlete|first-venture|painting-a-fake|breakfast-at|entrepreneur-become-dirty|stereotyping|miranda-priestly|side-effects-of-deleting|fake-it-till|chasing-wins|investors-nightmare|asking-the-right-questions/.test(s) },

  // Default bucket
  { cat: 'category-e-commerce', match: () => true },
];

async function seedCategories() {
  console.log('Seeding categories...');
  for (const c of CATEGORIES) {
    await client.createIfNotExists({
      _id: c.id,
      _type: 'category',
      title: c.title,
      slug: { _type: 'slug', current: c.slug },
      color: c.color,
      order: c.order,
    });
  }
}

async function categorize() {
  const articles = await client.fetch(
    `*[_type=="article"]{_id, title, substackUrl}`
  );
  console.log(`Re-categorizing ${articles.length} articles...`);

  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));

  for (const a of articles) {
    // Match against the Substack slug (clean, no human punctuation)
    const slug = (a.substackUrl || '').split('/p/')[1] || a.title.toLowerCase();
    const rule = RULES.find((r) => r.match(slug));
    const catId = rule.cat;

    await client
      .patch(a._id)
      .set({ category: { _type: 'reference', _ref: catId } })
      .commit();

    counts[catId]++;
    const label = CATEGORIES.find((c) => c.id === catId).title;
    console.log(`  ${label.padEnd(12)} ← ${a.title.slice(0, 70)}`);
  }

  console.log('\nSummary:');
  for (const c of CATEGORIES) {
    console.log(`  ${c.title.padEnd(12)} ${counts[c.id]}`);
  }
}

async function main() {
  await seedCategories();
  await categorize();
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

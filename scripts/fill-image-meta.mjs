/**
 * Fill missing alt text and captions on article hero images.
 *
 * Generates alt text from the article title + category.
 * Generates caption from the article title.
 *
 * Usage:
 *   node --env-file=.env.local scripts/fill-image-meta.mjs
 *   node --env-file=.env.local scripts/fill-image-meta.mjs --dry-run
 */

import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no changes will be made\n' : '✏️  Filling missing image metadata...\n');

  const articles = await client.fetch(`
    *[_type=="article"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      "category": category->title,
      "author": author->name,
      "hasHeroImage": defined(heroImage.asset),
      "heroAlt": heroImage.alt,
      "heroCap": heroImage.caption
    }
  `);

  console.log(`Found ${articles.length} articles total\n`);

  const toUpdate = [];

  for (const a of articles) {
    if (!a.hasHeroImage) continue;

    const needsAlt = !a.heroAlt || a.heroAlt.trim() === '';
    const needsCap = !a.heroCap || a.heroCap.trim() === '';

    if (!needsAlt && !needsCap) continue;

    const alt = needsAlt ? generateAlt(a) : a.heroAlt;
    const caption = needsCap ? generateCaption(a) : a.heroCap;

    toUpdate.push({ _id: a._id, title: a.title, alt, caption, needsAlt, needsCap });
  }

  if (toUpdate.length === 0) {
    console.log('✅ All hero images already have alt text and captions!');
    return;
  }

  console.log(`${toUpdate.length} articles need updates:\n`);
  for (const u of toUpdate) {
    const flags = [u.needsAlt ? 'alt' : null, u.needsCap ? 'caption' : null].filter(Boolean).join(' + ');
    console.log(`  [${flags}] ${u.title}`);
    if (u.needsAlt) console.log(`    alt: "${u.alt}"`);
    if (u.needsCap) console.log(`    caption: "${u.caption}"`);
  }

  if (DRY_RUN) {
    console.log('\n🔍 Dry run complete. Run without --dry-run to apply changes.');
    return;
  }

  console.log('\nApplying updates...');

  const tx = client.transaction();
  for (const u of toUpdate) {
    const patch = {};
    if (u.needsAlt) patch['heroImage.alt'] = u.alt;
    if (u.needsCap) patch['heroImage.caption'] = u.caption;
    tx.patch(u._id, { set: patch });
  }

  await tx.commit();
  console.log(`\n✅ Updated ${toUpdate.length} articles!`);
}

function generateAlt(article) {
  // Descriptive alt text: "Article title - Category article hero image"
  const cat = article.category || 'article';
  return `${article.title} — ${cat} article on Dollar Commerce`;
}

function generateCaption(article) {
  // Simple caption: just the article title
  return article.title;
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

/**
 * Patch a Sanity article's mainImage from a remote URL.
 *
 * Use this when you've published a DC article without a hero image but you
 * already have one hosted somewhere (Beehiiv, S3, the public web). The script
 * downloads the image, uploads it to Sanity as an asset, and points the
 * article's `mainImage.asset` at it.
 *
 * Usage:
 *   node --env-file=.env.local scripts/patch-article-image.mjs <slug> <imageUrl>
 *
 * Example:
 *   node --env-file=.env.local scripts/patch-article-image.mjs \
 *     mark-yourself-to-market \
 *     https://beehiiv-images-production.s3.amazonaws.com/.../Hero_64-37.png
 */

import { createClient } from '@sanity/client';
import path from 'node:path';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  const [slug, imageUrl] = process.argv.slice(2);
  if (!slug || !imageUrl) {
    console.error('Usage: patch-article-image.mjs <slug> <imageUrl>');
    process.exit(1);
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN');
    process.exit(1);
  }

  // Find the article
  const article = await client.fetch(
    `*[_type=="article" && slug.current==$slug][0]{_id, title, "hasImage": defined(mainImage.asset)}`,
    { slug }
  );
  if (!article) {
    console.error(`No article found with slug "${slug}"`);
    process.exit(1);
  }
  console.log(`Found: ${article.title}  (${article._id})`);
  if (article.hasImage) {
    console.log('  Note: this article already has a mainImage — it will be replaced.');
  }

  // Download the image
  console.log(`Downloading ${imageUrl} ...`);
  const res = await fetch(imageUrl);
  if (!res.ok) {
    console.error(`Download failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = path.basename(new URL(imageUrl).pathname) || 'hero.png';
  console.log(`  ${buf.length.toLocaleString()} bytes`);

  // Upload to Sanity
  console.log('Uploading to Sanity...');
  const asset = await client.assets.upload('image', buf, { filename });
  console.log(`  asset _id: ${asset._id}`);

  // Patch the article
  await client
    .patch(article._id)
    .set({ mainImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
    .commit();
  console.log(`Patched ${article._id} → mainImage now points to ${asset._id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * One-off: create the Alex Knight author record in Sanity and upload
 * his headshot. Idempotent — safe to re-run.
 *
 *   node --env-file=.env.local scripts/add-alex-knight.mjs
 */
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const AUTHOR = {
  slug: 'alex-knight',
  name: 'Alex Knight',
  role: 'Co-Founder @ Igloo Media Group · Google Ads Lead',
  bio: 'A former professional tennis player on the ATP Tour. Captained the University of Michigan Men\u2019s Tennis Team and earned ITA All-American honours, ranking as high as No. 3 in the nation. Studied Ecology and Evolutionary Biology at Michigan. Co-founder of Igloo Media Group, where he leads the agency\u2019s Google Ads practice and educates clients and team members across the paid search stack. Based in Tampa, FL.',
  location: 'Tampa, FL',
  twitter: null,
  linkedin: null,
  file: 'public/writers/alex-knight.jpeg',
};

async function uploadImage(filePath) {
  const abs = path.resolve(filePath);
  const stream = fs.createReadStream(abs);
  const asset = await client.assets.upload('image', stream, {
    filename: path.basename(abs),
  });
  return asset._id;
}

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN');
  process.exit(1);
}

const _id = `author-${AUTHOR.slug}`;
console.log(`\n→ ${AUTHOR.name}`);
console.log(`  Uploading ${AUTHOR.file}...`);
const assetId = await uploadImage(AUTHOR.file);
console.log(`  ✓ Asset: ${assetId}`);

await client.createIfNotExists({
  _id,
  _type: 'author',
  name: AUTHOR.name,
  slug: { current: AUTHOR.slug, _type: 'slug' },
});

await client
  .patch(_id)
  .set({
    name: AUTHOR.name,
    role: AUTHOR.role,
    bio: AUTHOR.bio,
    location: AUTHOR.location,
    slug: { current: AUTHOR.slug, _type: 'slug' },
    avatar: {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
    },
    ...(AUTHOR.twitter ? { twitter: AUTHOR.twitter } : {}),
    ...(AUTHOR.linkedin ? { linkedin: AUTHOR.linkedin } : {}),
  })
  .commit();

console.log(`  ✓ Author record created/updated`);
console.log(`\nVisit https://dollarcommerce.co/author/${AUTHOR.slug} after deploy.`);

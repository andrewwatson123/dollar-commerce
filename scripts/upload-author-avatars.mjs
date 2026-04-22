/**
 * One-off: upload headshot PNGs from /public/writers/ to Sanity as author
 * avatars, and ensure a record exists for Jesse Horwitz.
 *
 * Idempotent — re-running updates the avatar to the latest file without
 * duplicating author records.
 *
 * Usage:
 *   node --env-file=.env.local scripts/upload-author-avatars.mjs
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

const AUTHORS = [
  {
    slug: 'andrew-watson',
    name: 'Andrew Watson',
    bio: 'Co-Founder @ Igloo Media. E-Commerce Writer. Former ATP Tennis player. Previously co-founded Electric Boarding Company (acquired 2021). Based in London.',
    twitter: null,
    file: 'public/writers/andrew-watson.png',
  },
  {
    slug: 'benjamin-cogan',
    name: 'Benjamin Cogan',
    bio: 'Co-founder of Agora, a DTC e-commerce aggregator ($32M raised). Co-founder of Beanstalk, the conference for the top 1,500 consumer brands. Co-founded Hubble Contacts ($72M raised, hundreds of millions in revenue). Advisor at Mockingbird Strollers. Based in New York.',
    twitter: null,
    file: 'public/writers/benjamin-cogan.png',
  },
  {
    slug: 'jesse-horwitz',
    name: 'Jesse Horwitz',
    bio: 'Co-founder of Mangrove. Previously co-founded Hubble Contacts (acquired), Mockingbird Strollers, and Agora Brands. Started his career in research at Bridgewater. Author of "Selling Naked", an e-commerce favourite on building DTC brands without paid ads. Based in New York.',
    twitter: null,
    linkedin: 'https://www.linkedin.com/in/jesse-horwitz/',
    file: 'public/writers/jesse-horwitz.png',
  },
];

async function uploadImage(filePath) {
  const abs = path.resolve(filePath);
  const stream = fs.createReadStream(abs);
  const asset = await client.assets.upload('image', stream, {
    filename: path.basename(abs),
  });
  return asset._id;
}

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN');
    process.exit(1);
  }

  for (const a of AUTHORS) {
    console.log(`\n→ ${a.name}`);
    console.log(`  Uploading ${a.file}...`);
    const assetId = await uploadImage(a.file);
    console.log(`  ✓ Asset: ${assetId}`);

    const _id = `author-${a.slug}`;
    // Upsert: createIfNotExists then always patch so we overwrite the avatar
    await client.createIfNotExists({
      _id,
      _type: 'author',
      name: a.name,
      slug: { current: a.slug, _type: 'slug' },
    });
    await client
      .patch(_id)
      .set({
        name: a.name,
        bio: a.bio,
        slug: { current: a.slug, _type: 'slug' },
        avatar: {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
        },
        ...(a.twitter ? { twitter: a.twitter } : {}),
      })
      .commit();
    console.log(`  ✓ Author record updated`);
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

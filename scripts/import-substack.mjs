#!/usr/bin/env node
/**
 * Substack → Sanity importer.
 *
 * Pulls all posts from https://dollarcommerce.substack.com via:
 *   1. RSS feed for the most recent ~20 posts (has full <content:encoded>)
 *   2. sitemap.xml for the long tail, then scrapes each post page
 *
 * For every post:
 *   - Creates/updates an Author doc
 *   - Uploads the hero image + inline images to Sanity
 *   - Rewrites the HTML body to Portable Text
 *   - Upserts an Article doc (idempotent by substackUrl)
 *
 * Usage:
 *   node scripts/import-substack.mjs              # incremental (skip existing)
 *   node scripts/import-substack.mjs --force      # re-import all
 *   node scripts/import-substack.mjs --limit 5    # debug, only first 5
 */

import { createClient } from '@sanity/client';
import * as cheerio from 'cheerio';
import { htmlToBlocks } from './lib/html-to-blocks.mjs';

const SUBSTACK = 'https://dollarcommerce.substack.com';
const FORCE = process.argv.includes('--force');
const LIMIT_IDX = process.argv.indexOf('--limit');
const LIMIT = LIMIT_IDX >= 0 ? Number(process.argv[LIMIT_IDX + 1]) : Infinity;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ---------- helpers ----------

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96);

async function upsertAuthor(name) {
  const _id = `author-${slugify(name)}`;
  await client.createIfNotExists({
    _id,
    _type: 'author',
    name,
    slug: { _type: 'slug', current: slugify(name) },
  });
  return { _type: 'reference', _ref: _id };
}

async function upsertCategory(title) {
  const _id = `category-${slugify(title)}`;
  await client.createIfNotExists({
    _id,
    _type: 'category',
    title,
    slug: { _type: 'slug', current: slugify(title) },
  });
  return { _type: 'reference', _ref: _id };
}

async function uploadImage(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload('image', buf, {
      filename: url.split('/').pop()?.split('?')[0] || 'image.jpg',
    });
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  } catch (e) {
    console.warn(`  ! image upload failed: ${url} (${e.message})`);
    return null;
  }
}

// ---------- fetch post lists ----------

async function fetchSitemapUrls() {
  const res = await fetch(`${SUBSTACK}/sitemap.xml`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => u.includes('/p/'));
  return urls;
}

async function fetchRssItems() {
  const res = await fetch(`${SUBSTACK}/feed`);
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const items = [];
  $('item').each((_, el) => {
    const $el = $(el);
    items.push({
      link: $el.find('link').text().trim(),
      title: $el.find('title').text().trim(),
      pubDate: $el.find('pubDate').text().trim(),
      author: $el.find('dc\\:creator').text().trim() || 'Andrew Watson',
      html: $el.find('content\\:encoded').text(),
    });
  });
  return items;
}

// Fallback page scraper for older posts not in RSS.
async function fetchPostPage(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (DC Importer)' },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);

  // Substack embeds post metadata as JSON-LD.
  let meta = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'NewsArticle' || data['@type'] === 'Article') {
        meta = data;
      }
    } catch {}
  });

  const title = meta.headline || $('h1').first().text().trim();
  const pubDate = meta.datePublished || '';
  const author = meta.author?.name || 'Andrew Watson';
  const bodyEl =
    $('.body.markup').first().length > 0
      ? $('.body.markup').first()
      : $('[class*="available-content"]').first();
  const bodyHtml = bodyEl.html() || '';

  return { link: url, title, pubDate, author, html: bodyHtml };
}

// ---------- main ----------

async function importPost(post) {
  const existing = !FORCE
    ? await client.fetch(`*[_type=="article" && substackUrl==$u][0]{_id}`, {
        u: post.link,
      })
    : null;
  if (existing) {
    console.log(`  - skip (exists): ${post.title}`);
    return;
  }

  console.log(`  + importing: ${post.title}`);

  // Parse body
  const $ = cheerio.load(`<div>${post.html}</div>`);
  const root = $('div').first();

  // Hero image = first <img> in body
  const heroUrl = root.find('img').first().attr('src');
  const heroImage = heroUrl ? await uploadImage(heroUrl) : null;

  // Remove the hero from inline body to avoid duplication
  root.find('img').first().remove();

  // Convert remaining HTML to Portable Text, uploading inline images
  const blocks = await htmlToBlocks(root.html() || '', uploadImage);

  // Excerpt from first block
  const firstText = blocks.find(
    (b) => b._type === 'block' && b.children?.some((c) => c.text)
  );
  const excerpt = firstText
    ? firstText.children.map((c) => c.text).join('').slice(0, 240)
    : '';

  const author = await upsertAuthor(post.author);
  const category = await upsertCategory('E-Commerce'); // default; re-categorize in Studio

  const doc = {
    _id: `article-${slugify(post.title)}`,
    _type: 'article',
    title: post.title,
    slug: { _type: 'slug', current: slugify(post.title) },
    author,
    category,
    publishedAt: new Date(post.pubDate || Date.now()).toISOString(),
    heroImage,
    body: blocks,
    excerpt,
    substackUrl: post.link,
  };

  await client.createOrReplace(doc);
}

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN in .env.local');
    process.exit(1);
  }

  console.log('Fetching RSS...');
  const rss = await fetchRssItems();
  const rssByUrl = new Map(rss.map((p) => [p.link, p]));

  console.log('Fetching sitemap...');
  const urls = await fetchSitemapUrls();
  console.log(`  ${urls.length} post URLs in sitemap`);

  let all = [];
  for (const url of urls) {
    if (rssByUrl.has(url)) {
      all.push(rssByUrl.get(url));
    } else {
      const page = await fetchPostPage(url);
      if (page) all.push(page);
    }
    if (all.length >= LIMIT) break;
  }

  console.log(`Importing ${all.length} posts into Sanity...`);
  for (const post of all) {
    try {
      await importPost(post);
    } catch (e) {
      console.error(`  ! failed: ${post.title} — ${e.message}`);
    }
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { sanityClient } from './client';

// Minimal projection for card-style rendering (homepage rails, archive lists).
const ARTICLE_CARD_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  subtitle,
  excerpt,
  publishedAt,
  isPremium,
  "viewCount": coalesce(viewCount, 0),
  "likeCount": coalesce(likeCount, 0),
  "category": category->{title, "slug": slug.current, color},
  "author": author->{name, "slug": slug.current, "avatar": avatar},
  heroImage
}`;

// Full projection for the single article page.
const ARTICLE_FULL_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  subtitle,
  excerpt,
  publishedAt,
  isPremium,
  substackUrl,
  body,
  heroImage,
  "heroImageUrl": heroImage.asset->url,
  seo {
    seoTitle,
    metaDescription,
    ogImage,
    "ogImageUrl": ogImage.asset->url
  },
  "likeCount": coalesce(likeCount, 0),
  "viewCount": coalesce(viewCount, 0),
  "category": category->{title, "slug": slug.current, color},
  "author": author->{name, "slug": slug.current, bio, avatar},
  "tags": tags[]->{title, "slug": slug.current}
}`;

export async function getLatestArticles(limit = 8) {
  return sanityClient.fetch(
    `*[_type=="article"] | order(publishedAt desc)[0...${limit}] ${ARTICLE_CARD_PROJECTION}`,
    {},
    { next: { revalidate: 60, tags: ['articles'] } }
  );
}

export async function getMostReadArticles(limit = 5) {
  return sanityClient.fetch(
    `*[_type=="article"] | order(coalesce(viewCount, 0) desc, publishedAt desc)[0...${limit}] ${ARTICLE_CARD_PROJECTION}`,
    {},
    { next: { revalidate: 60, tags: ['articles'] } }
  );
}

export async function getHomepageData({ limit = 12 } = {}) {
  return sanityClient.fetch(
    `{
      "hero": *[_type=="article"] | order(publishedAt desc)[0] ${ARTICLE_CARD_PROJECTION},
      "topStories": *[_type=="article"] | order(publishedAt desc)[1...${limit + 1}] ${ARTICLE_CARD_PROJECTION},
      "features": *[_type=="article" && category->slug.current=="features"] | order(publishedAt desc)[0...6] ${ARTICLE_CARD_PROJECTION},
      "platforms": *[_type=="article" && category->slug.current=="platforms"] | order(publishedAt desc)[0...6] ${ARTICLE_CARD_PROJECTION},
      "opinion": *[_type=="article" && category->slug.current=="opinion"] | order(publishedAt desc)[0...6] ${ARTICLE_CARD_PROJECTION},
      "ecommerce": *[_type=="article" && category->slug.current=="e-commerce"] | order(publishedAt desc)[0...6] ${ARTICLE_CARD_PROJECTION}
    }`,
    {},
    { next: { revalidate: 60, tags: ['articles'] } }
  );
}

export async function getArticleBySlug(slug) {
  return sanityClient.fetch(
    `*[_type=="article" && slug.current==$slug][0] ${ARTICLE_FULL_PROJECTION}`,
    { slug },
    { next: { revalidate: 60, tags: [`article:${slug}`] } }
  );
}

export async function getAllArticleSlugs() {
  return sanityClient.fetch(`*[_type=="article" && defined(slug.current)].slug.current`);
}

export async function getArticlesByCategory(categorySlug, { limit = 100 } = {}) {
  return sanityClient.fetch(
    `*[_type=="article" && category->slug.current==$slug] | order(publishedAt desc)[0...${limit}] ${ARTICLE_CARD_PROJECTION}`,
    { slug: categorySlug },
    { next: { revalidate: 60, tags: ['articles', `category:${categorySlug}`] } }
  );
}

export async function getArticlesByAuthor(authorSlug, { limit = 100 } = {}) {
  return sanityClient.fetch(
    `*[_type=="article" && author->slug.current==$slug] | order(publishedAt desc)[0...${limit}] ${ARTICLE_CARD_PROJECTION}`,
    { slug: authorSlug },
    { next: { revalidate: 60, tags: ['articles', `author:${authorSlug}`] } }
  );
}

export async function getAllArticles({ limit = 200 } = {}) {
  // Sort by viewCount desc, then publishedAt desc. When viewCount is 0 (initial
  // state), this effectively falls back to most-recent-first.
  return sanityClient.fetch(
    `*[_type=="article"] | order(coalesce(viewCount, 0) desc, publishedAt desc)[0...${limit}] ${ARTICLE_CARD_PROJECTION}`,
    {},
    { next: { revalidate: 60, tags: ['articles'] } }
  );
}

export async function getAllCategories() {
  return sanityClient.fetch(
    `*[_type=="category"] | order(order asc){title, "slug": slug.current, color, order}`,
    {},
    { next: { revalidate: 300 } }
  );
}

// ---------- Fundraising ----------

const SORT_MAP = {
  date_desc:   'order(announcedAt desc)',
  date_asc:    'order(announcedAt asc)',
  amount_desc: 'order(coalesce(amountUsd, 0) desc, announcedAt desc)',
  amount_asc:  'order(coalesce(amountUsd, 999999999999) asc, announcedAt desc)',
};

export async function getFundraisingEvents({
  limit = 200,
  round,
  sector,
  sort = 'date_desc',
} = {}) {
  const filters = [`_type == "fundraisingEvent"`, `approved == true`];
  const params = {};
  if (round) {
    filters.push(`round == $round`);
    params.round = round;
  }
  if (sector) {
    filters.push(`sector == $sector`);
    params.sector = sector;
  }
  // Amount-asc excludes rows without an amount so they don't cluster at the top.
  if (sort === 'amount_asc') {
    filters.push(`defined(amountUsd)`);
  }
  const orderClause = SORT_MAP[sort] || SORT_MAP.date_desc;
  return sanityClient.fetch(
    `*[${filters.join(' && ')}] | ${orderClause}[0...${limit}]{
      _id,
      company,
      amountUsd,
      amountText,
      round,
      sector,
      investors,
      announcedAt,
      description,
      sourceUrl,
      sourceName,
      brandWebsite
    }`,
    params,
    { next: { revalidate: 300, tags: ['fundraising'] } }
  );
}

export async function getFundraisingStats() {
  // GROQ can't compute `now() - 30 days` reliably, so we compute the cutoff
  // in JS and pass it as a parameter.
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return sanityClient.fetch(
    `{
      "total": count(*[_type == "fundraisingEvent" && approved == true]),
      "last30d": count(*[_type == "fundraisingEvent" && approved == true && announcedAt > $cutoff]),
      "totalAmountLast30d": math::sum(*[_type == "fundraisingEvent" && approved == true && announcedAt > $cutoff && defined(amountUsd)].amountUsd),
      "totalAmountAllTime": math::sum(*[_type == "fundraisingEvent" && approved == true && defined(amountUsd)].amountUsd),
      "byRound": *[_type == "fundraisingEvent" && approved == true] {round} | {"round": round},
      "bySector": *[_type == "fundraisingEvent" && approved == true] {sector} | {"sector": sector}
    }`,
    { cutoff },
    { next: { revalidate: 300, tags: ['fundraising'] } }
  );
}

// ---------- Platform Tracker ----------

export async function getPlatformUpdates({ platform, category, sort = 'date', limit = 200 } = {}) {
  const filters = [`_type == "platformUpdate"`, `approved == true`];
  const params = {};
  if (platform) {
    filters.push(`platform == $platform`);
    params.platform = platform;
  }
  if (category) {
    filters.push(`category == $category`);
    params.category = category;
  }
  const orderClause = sort === 'heat'
    ? 'order(coalesce(heat, 1) desc, reportedAt desc)'
    : 'order(reportedAt desc)';
  return sanityClient.fetch(
    `*[${filters.join(' && ')}] | ${orderClause}[0...${limit}]{
      _id,
      platform,
      title,
      summary,
      category,
      heat,
      reportedAt,
      sourceUrl,
      sourceName
    }`,
    params,
    { next: { revalidate: 300, tags: ['platforms'] } }
  );
}

export async function getPlatformStats() {
  return sanityClient.fetch(
    `{
      "total": count(*[_type == "platformUpdate" && approved == true]),
      "byPlatform": *[_type == "platformUpdate" && approved == true]{platform} | {"p": platform},
      "byCategory": *[_type == "platformUpdate" && approved == true]{category} | {"c": category}
    }`,
    {},
    { next: { revalidate: 300, tags: ['platforms'] } }
  );
}

export async function getAllAuthors() {
  return sanityClient.fetch(
    `*[_type=="author"] | order(name asc){name, "slug": slug.current, bio, avatar}`,
    {},
    { next: { revalidate: 300 } }
  );
}

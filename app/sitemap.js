import { getAllArticleSlugs, getAllCategories, getAllAuthors } from '@/sanity/lib/queries';

const BASE = 'https://dollarcommerce.co';

export default async function sitemap() {
  const now = new Date();

  // Static routes
  const staticRoutes = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/dc-index`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/fundraising-tracker`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/platform-tracker`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/top-articles`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/dc-daily`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  // Dynamic routes from Sanity
  let articles = [];
  let categories = [];
  let authors = [];
  try {
    [articles, categories, authors] = await Promise.all([
      getAllArticleSlugs(),
      getAllCategories(),
      getAllAuthors(),
    ]);
  } catch {
    // Don't let sitemap crash the build if Sanity is unreachable
  }

  const articleRoutes = (articles || []).map((slug) => ({
    url: `${BASE}/article/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categoryRoutes = (categories || []).map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const authorRoutes = (authors || []).map((a) => ({
    url: `${BASE}/author/${a.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...authorRoutes];
}

export default {
  name: 'platformUpdate',
  title: 'Platform Update',
  type: 'document',
  description:
    'A tracked change, feature, bug, or policy update on an e-commerce platform. Populated by the scraper (scripts/scrape-platform-news.mjs). Editable in Studio.',
  fields: [
    {
      name: 'platform',
      title: 'Platform',
      type: 'string',
      validation: (R) => R.required(),
      options: {
        list: ['Amazon', 'Shopify', 'Meta', 'Google', 'TikTok', 'Pinterest'],
      },
    },
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (R) => R.required(),
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: '2-3 sentence description of the update.',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      validation: (R) => R.required(),
      options: {
        list: ['Feature', 'Bug', 'Policy', 'API Update', 'AI Update'],
      },
      initialValue: 'Feature',
    },
    {
      name: 'heat',
      title: 'Heat (1-3 peppers)',
      type: 'number',
      description: '1 = normal, 2 = important, 3 = very big news/urgent. Shown as pepper icons.',
      validation: (R) => R.min(1).max(3),
      initialValue: 1,
    },
    {
      name: 'reportedAt',
      title: 'Reported at',
      type: 'datetime',
      validation: (R) => R.required(),
    },
    {
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      validation: (R) => R.required(),
    },
    {
      name: 'sourceName',
      title: 'Source',
      type: 'string',
    },
    {
      name: 'approved',
      title: 'Approved?',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide from the public tracker without deleting.',
    },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'reportedAtDesc',
      by: [{ field: 'reportedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      platform: 'platform',
      category: 'category',
      date: 'reportedAt',
    },
    prepare({ title, platform, category, date }) {
      return {
        title: `${platform} — ${title?.slice(0, 50)}`,
        subtitle: `${category} · ${date ? new Date(date).toLocaleDateString() : ''}`,
      };
    },
  },
};

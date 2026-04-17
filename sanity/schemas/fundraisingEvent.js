export default {
  name: 'fundraisingEvent',
  title: 'Fundraising Event',
  type: 'document',
  description:
    'A startup fundraising round. Populated by the scraper (scripts/scrape-fundraising.mjs) from TechCrunch + StrictlyVC RSS feeds. Editable here so you can delete noise, fix parsed amounts, or add missing fields.',
  fields: [
    {
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (R) => R.required(),
    },
    {
      name: 'amountUsd',
      title: 'Amount (USD)',
      type: 'number',
      description: 'Dollar amount of the round. Parsed from headline.',
    },
    {
      name: 'amountText',
      title: 'Amount as written',
      type: 'string',
      description: 'Original phrasing (e.g. "$25M", "$1.2 billion") for display fallback.',
    },
    {
      name: 'round',
      title: 'Round',
      type: 'string',
      options: {
        list: [
          'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D',
          'Series E+', 'Growth', 'Debt', 'IPO', 'Acquisition', 'Unknown',
        ],
      },
      initialValue: 'Unknown',
    },
    {
      name: 'sector',
      title: 'Sector',
      type: 'string',
      description: 'Which slice of e-commerce (DTC, Marketplaces, Infra, Logistics, AI Tools, etc.)',
    },
    {
      name: 'investors',
      title: 'Investors',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'announcedAt',
      title: 'Announced at',
      type: 'datetime',
      validation: (R) => R.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Summary from the source article.',
    },
    {
      name: 'brandWebsite',
      title: 'Brand website',
      type: 'url',
      description:
        'Optional homepage URL for the company. If blank, the tracker shows a Google search link. Fill this in for high-profile brands so clicks go straight to the source.',
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
      description: 'TechCrunch, StrictlyVC, etc.',
    },
    {
      name: 'approved',
      title: 'Approved?',
      type: 'boolean',
      description:
        'The scraper sets this to true when it is confident. Uncheck to hide from the public site without deleting.',
      initialValue: true,
    },
  ],
  orderings: [
    {
      title: 'Announced, newest first',
      name: 'announcedAtDesc',
      by: [{ field: 'announcedAt', direction: 'desc' }],
    },
    {
      title: 'Amount, largest first',
      name: 'amountDesc',
      by: [{ field: 'amountUsd', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'company',
      amount: 'amountText',
      round: 'round',
      date: 'announcedAt',
    },
    prepare({ title, amount, round, date }) {
      return {
        title: `${title} — ${amount || '—'}`,
        subtitle: `${round} · ${date ? new Date(date).toLocaleDateString() : ''}`,
      };
    },
  },
};

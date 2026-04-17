export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  description:
    'Top-level section on the site. Each article has exactly one category. Examples: E-Commerce, Platforms, Opinion, Tech, Logistics, Advertising.',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', title: 'Description', type: 'text', rows: 2 },
    {
      name: 'color',
      title: 'Accent color (hex)',
      type: 'string',
      description: 'Used as the red/blue pill on article cards.',
      initialValue: '#D2042D',
    },
    {
      name: 'order',
      title: 'Nav order',
      type: 'number',
      description: 'Lower = earlier in nav.',
      initialValue: 100,
    },
  ],
};

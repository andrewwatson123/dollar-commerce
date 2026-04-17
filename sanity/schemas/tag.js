export default {
  name: 'tag',
  title: 'Tag',
  type: 'document',
  description:
    'Free-form tag. Articles can have many. Used for cross-cutting filters (e.g. "Amazon", "Meta", "AI").',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
  ],
};

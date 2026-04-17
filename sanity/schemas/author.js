export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'bio', title: 'Short bio', type: 'text', rows: 3 },
    { name: 'avatar', title: 'Avatar', type: 'image', options: { hotspot: true } },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'twitter', title: 'Twitter / X handle', type: 'string' },
  ],
  preview: { select: { title: 'name', media: 'avatar' } },
};

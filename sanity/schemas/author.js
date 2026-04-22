export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'bio', title: 'Short bio', type: 'text', rows: 3 },
    { name: 'avatar', title: 'Avatar', type: 'image', options: { hotspot: true } },
    { name: 'role', title: 'Role / title', type: 'string', description: 'Shown under the name on the author page, e.g. "Co-Founder @ Igloo Media"' },
    { name: 'location', title: 'Location', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'twitter', title: 'Twitter / X handle', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
    { name: 'website', title: 'Personal website', type: 'url' },
  ],
  preview: { select: { title: 'name', media: 'avatar' } },
};

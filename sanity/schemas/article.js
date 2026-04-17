export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle / deck',
      type: 'text',
      rows: 2,
    },
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Shown as the main image on the homepage and article page. Substack imports auto-populate this with the first image from the post.',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        { name: 'caption', title: 'Caption', type: 'string' },
      ],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (R) => R.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (R) => R.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (R) => R.required(),
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'homepageSection',
      title: 'Homepage Section',
      type: 'string',
      description: 'Pin this article to a specific homepage section. Leave blank for default placement.',
      options: {
        list: [
          { title: 'Top Story (hero)', value: 'top-story' },
          { title: 'Top Stories (sidebar)', value: 'top-stories' },
          { title: 'Founder Features', value: 'founder-features' },
          { title: 'Latest', value: 'latest' },
          { title: 'Most Read', value: 'most-read' },
        ],
      },
    },
    {
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      description: 'Lower numbers appear first within the section. Leave blank for default sort by date.',
    },
    {
      name: 'isPremium',
      title: 'Premium only?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'likeCount',
      title: 'Like count',
      type: 'number',
      description: 'Total likes. Incremented by the site via /api/like.',
      initialValue: 0,
      readOnly: true,
    },
    {
      name: 'viewCount',
      title: 'View count',
      type: 'number',
      description:
        'Lifetime article views. Updated by the site (incremented on /article/[slug] hits). Used to sort the Top Articles page.',
      initialValue: 0,
      readOnly: true,
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary shown on cards. Auto-generated from body on import.',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'substackUrl',
      title: 'Original Substack URL',
      type: 'url',
      description: 'If imported from Substack, the canonical source URL.',
      readOnly: true,
    },
  ],
  orderings: [
    {
      title: 'Published, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'heroImage',
      date: 'publishedAt',
    },
    prepare({ title, author, media, date }) {
      return {
        title,
        subtitle: `${author ?? 'Unknown'} — ${date ? new Date(date).toLocaleDateString() : 'Draft'}`,
        media,
      };
    },
  },
};

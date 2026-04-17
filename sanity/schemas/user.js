export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'emailVerified', title: 'Email Verified', type: 'datetime' },
    { name: 'image', title: 'Avatar URL', type: 'url' },
    {
      name: 'savedArticles',
      title: 'Saved Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
    },
    {
      name: 'notificationPrefs',
      title: 'Notification Preferences',
      type: 'object',
      fields: [
        { name: 'newArticles', title: 'New Articles', type: 'boolean', initialValue: true },
        { name: 'platformUpdates', title: 'Platform Updates', type: 'boolean', initialValue: true },
        { name: 'marketAlerts', title: 'Market Alerts', type: 'boolean', initialValue: true },
        { name: 'weeklyDigest', title: 'Weekly Digest', type: 'boolean', initialValue: true },
        { name: 'newsletter', title: 'Newsletter', type: 'boolean', initialValue: false },
      ],
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
};

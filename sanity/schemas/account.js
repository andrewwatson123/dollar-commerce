export default {
  name: 'account',
  title: 'Account',
  type: 'document',
  fields: [
    { name: 'providerType', title: 'Provider Type', type: 'string' },
    { name: 'providerId', title: 'Provider ID', type: 'string' },
    { name: 'providerAccountId', title: 'Provider Account ID', type: 'string' },
    { name: 'refreshToken', title: 'Refresh Token', type: 'string' },
    { name: 'accessToken', title: 'Access Token', type: 'string' },
    { name: 'accessTokenExpires', title: 'Access Token Expires', type: 'number' },
    {
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
    },
  ],
};

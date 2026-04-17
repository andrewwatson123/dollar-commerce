export default {
  name: 'verificationToken',
  title: 'Verification Token',
  type: 'document',
  fields: [
    { name: 'identifier', title: 'Identifier', type: 'string' },
    { name: 'token', title: 'Token', type: 'string' },
    { name: 'expires', title: 'Expires', type: 'datetime' },
  ],
};

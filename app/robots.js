export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile/', '/login/', '/studio/', '/preview/'],
      },
    ],
    sitemap: 'https://dollarcommerce.co/sitemap.xml',
    host: 'https://dollarcommerce.co',
  };
}

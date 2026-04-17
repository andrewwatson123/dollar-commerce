// Platform metadata for the Platform Tracker.
// Colors follow the VegaTrak-inspired category scheme.

export const PLATFORMS = [
  { name: 'Amazon',    slug: 'amazon',    domain: 'amazon.com',    color: '#FF9900' },
  { name: 'Shopify',   slug: 'shopify',   domain: 'shopify.com',   color: '#96BF48' },
  { name: 'Meta',      slug: 'meta',      domain: 'meta.com',      color: '#0081FB' },
  { name: 'Google',    slug: 'google',    domain: 'google.com',    color: '#4285F4' },
  { name: 'TikTok',    slug: 'tiktok',    domain: 'tiktok.com',    color: '#000000' },
  { name: 'Pinterest', slug: 'pinterest', domain: 'pinterest.com', color: '#E60023' },
];

// Category metadata — color-coded badges
export const CATEGORIES = {
  'Feature':    { color: '#3CB4FF', label: 'Feature' },
  'Bug':        { color: '#FF6450', label: 'Bug' },
  'Policy':     { color: '#FFC832', label: 'Policy' },
  'API Update': { color: '#50DC96', label: 'API' },
  'AI Update':  { color: '#B47AFF', label: 'AI' },
};

export function platformLogoUrl(domain, size = 24) {
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
}

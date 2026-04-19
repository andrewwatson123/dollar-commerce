import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata = { title: 'Newsletter Card Preview', robots: { index: false } };

export default function NewsletterCardPreview() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4F1EA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ width: 400 }}>
        <NewsletterSignup variant="dark" />
      </div>
    </div>
  );
}

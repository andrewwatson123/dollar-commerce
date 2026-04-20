import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Today Newsletter Preview', robots: { index: false } };

export default function NewsletterTodayPreview() {
  let html = '';
  try {
    const today = new Date().toISOString().slice(0, 10);
    const filePath = path.join(process.cwd(), 'newsletter-drafts', `dc-newsletter-${today}.html`);
    html = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    html = `<p>No newsletter draft for today yet.</p>`;
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '40px 20px' }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

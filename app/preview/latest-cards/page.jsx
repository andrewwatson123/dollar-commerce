/**
 * Preview: Latest section layout options with left-aligned images.
 */
'use client';

const SERIF = "Georgia, 'Times New Roman', serif";

const ARTICLES = [
  { cat: 'OPINION', catColor: '#D97706', title: 'A WHOOPing Masters from Rory McIlroy', author: 'Andrew Watson', time: '2h ago', likes: 0, img: '🏌️' },
  { cat: 'E-COMMERCE', catColor: '#D2042D', title: "Amazon's fuel surcharge: Cost recovery or margin play?", author: 'Andrew Watson', time: '8d ago', likes: 0, img: '📦' },
  { cat: 'E-COMMERCE', catColor: '#D2042D', title: 'The Iran war hits e-commerce three times', author: 'Benjamin Cogan', time: '16d ago', likes: 0, img: '📰' },
  { cat: 'PLATFORMS', catColor: '#0066CC', title: 'Let the AI come to you', author: 'Andrew Watson', time: '22d ago', likes: 0, img: '🤖' },
  { cat: 'PLATFORMS', catColor: '#0066CC', title: 'Why expensive MMM tools like Haus might be the next SaaS category in marketing to be axed', author: 'Andrew Watson', time: '29d ago', likes: 1, img: '📊' },
];

export default function LatestPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '48px 40px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>Latest Section — Layout Options</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 48px' }}>Images left-aligned. Pick your favorite.</p>

        {/* ═══ OPTION A: Large left thumbnail ═══ */}
        <Section title="Option A — Large left thumbnail">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 16px' }}>
            Big square image on the left, text on the right. Magazine editorial feel.
          </p>
          {ARTICLES.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid #E0E0E0', alignItems: 'flex-start' }}>
              <div style={{
                width: 140, height: 100, borderRadius: 6, flexShrink: 0,
                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              }}>
                {a.img}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: a.catColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  {a.cat}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, margin: '0 0 8px', color: '#0F172A' }}>
                  {a.title}
                </h3>
                <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{a.author}</span>
                  <span>·</span>
                  <span>{a.time}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ color: '#ccc' }}>♡</span>
                  <span style={{ color: '#ccc' }}>⊟</span>
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* ═══ OPTION B: Compact left thumbnail with accent border ═══ */}
        <Section title="Option B — Compact left image + red accent border">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 16px' }}>
            Smaller image with a red left border on the card. More compact, branded feel.
          </p>
          {ARTICLES.map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, padding: '20px 20px', marginBottom: 12,
              background: '#fff', borderRadius: 8, border: '1px solid #E0E0E0',
              borderLeft: '3px solid #D2042D', alignItems: 'flex-start',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 6, flexShrink: 0,
                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>
                {a.img}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: a.catColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {a.cat}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, margin: '0 0 6px', color: '#0F172A' }}>
                  {a.title}
                </h3>
                <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{a.author}</span>
                  <span>·</span>
                  <span>{a.time}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ color: '#ccc' }}>♡</span>
                  <span style={{ color: '#ccc' }}>⊟</span>
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* ═══ OPTION C: Full-width image top, text below ═══ */}
        <Section title="Option C — Image top, stacked layout">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 16px' }}>
            Each card gets a wider image on top with text below. More visual, blog-style.
          </p>
          {ARTICLES.slice(0, 3).map((a, i) => (
            <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E0E0E0' }}>
              <div style={{
                width: '100%', height: 180, borderRadius: 8,
                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
                marginBottom: 16,
              }}>
                {a.img}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: a.catColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {a.cat}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, margin: '0 0 8px', color: '#0F172A' }}>
                {a.title}
              </h3>
              <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{a.author}</span>
                <span>·</span>
                <span>{a.time}</span>
                <div style={{ flex: 1 }} />
                <span style={{ color: '#ccc' }}>♡</span>
                <span style={{ color: '#ccc' }}>⊟</span>
              </div>
            </div>
          ))}
        </Section>

        {/* ═══ OPTION D: Left image, excerpt included ═══ */}
        <Section title="Option D — Left image + excerpt">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 16px' }}>
            Larger left image with a short excerpt. More informative, NYT-style.
          </p>
          {ARTICLES.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid #E0E0E0', alignItems: 'flex-start' }}>
              <div style={{
                width: 180, height: 120, borderRadius: 6, flexShrink: 0,
                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              }}>
                {a.img}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: a.catColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  {a.cat}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.35, margin: '0 0 8px', color: '#0F172A' }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px', lineHeight: 1.5 }}>
                  A brief summary of the article that gives readers a taste of what to expect before clicking through to read more...
                </p>
                <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{a.author}</span>
                  <span>·</span>
                  <span>{a.time}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ color: '#ccc' }}>♡</span>
                  <span style={{ color: '#ccc' }}>⊟</span>
                </div>
              </div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{title}</h2>
      <div style={{ height: 2, background: '#D2042D', width: 40, marginBottom: 16 }} />
      {children}
    </section>
  );
}

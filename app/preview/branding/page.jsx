/**
 * Branding application ideas — how the dollar·commerce identity extends
 * across page titles, section headers, cards, and UI elements.
 */

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, sans-serif";

function DC({ size = 22 }) {
  return (
    <span style={{ fontFamily: SERIF, fontSize: size, letterSpacing: 0.3, color: '#0F172A' }}>
      <span style={{ fontWeight: 400 }}>dollar</span>
      <span style={{ color: '#D2042D', margin: '0 2px', fontSize: '110%' }}>·</span>
      <span style={{ fontWeight: 700 }}>commerce</span>
    </span>
  );
}

export default function BrandingPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: SANS, padding: '48px 40px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Branding Application Ideas</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 48px' }}>
          How the <DC size={14} /> identity can extend beyond the logo into page titles, section headers, and UI elements.
        </p>

        {/* ===== 1. Page titles with dot separator ===== */}
        <Section title="1. Page titles — use the red dot as a separator">
          <Card>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', fontFamily: SERIF }}>
              <span style={{ fontWeight: 400 }}>fundraising</span>
              <span style={{ color: '#D2042D', margin: '0 4px' }}>·</span>
              <span style={{ fontWeight: 700 }}>tracker</span>
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', fontFamily: SERIF }}>
              <span style={{ fontWeight: 400 }}>platform</span>
              <span style={{ color: '#D2042D', margin: '0 4px' }}>·</span>
              <span style={{ fontWeight: 700 }}>tracker</span>
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', fontFamily: SERIF }}>
              <span style={{ fontWeight: 400 }}>dc</span>
              <span style={{ color: '#D2042D', margin: '0 4px' }}>·</span>
              <span style={{ fontWeight: 700 }}>index</span>
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', fontFamily: SERIF }}>
              <span style={{ fontWeight: 400 }}>top</span>
              <span style={{ color: '#D2042D', margin: '0 4px' }}>·</span>
              <span style={{ fontWeight: 700 }}>articles</span>
            </div>
          </Card>
          <Note>Every page title follows the same light·bold pattern with the red dot. Creates instant brand recognition across the whole site.</Note>
        </Section>

        {/* ===== 2. Section headings ===== */}
        <Section title="2. Section headings — dot before the label">
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SectionHead>founder features</SectionHead>
              <SectionHead>latest</SectionHead>
              <SectionHead>most read</SectionHead>
              <SectionHead>top movers today</SectionHead>
              <SectionHead>e-commerce etfs</SectionHead>
            </div>
          </Card>
          <Note>The red dot becomes a bullet/prefix for every section heading. Lowercase serif keeps the editorial feel consistent.</Note>
        </Section>

        {/* ===== 3. Category tags ===== */}
        <Section title="3. Category tags — dot before category name">
          <Card>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <CatTag>e-commerce</CatTag>
              <CatTag>platforms</CatTag>
              <CatTag>opinion</CatTag>
              <CatTag>features</CatTag>
              <CatTag>tech</CatTag>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <CatTagPill color="#D2042D">e-commerce</CatTagPill>
              <CatTagPill color="#0066CC">platforms</CatTagPill>
              <CatTagPill color="#F59E0B">opinion</CatTagPill>
              <CatTagPill color="#9333EA">features</CatTagPill>
              <CatTagPill color="#10B981">tech</CatTagPill>
            </div>
          </Card>
          <Note>Option 1: red dot prefix, all same color. Option 2: colored dot matching the category, lowercase serif text.</Note>
        </Section>

        {/* ===== 4. The top bar ===== */}
        <Section title="4. Top bar — branded DC Index callout">
          <div style={{
            background: '#0F172A', borderRadius: 8, padding: '10px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: SERIF, fontSize: 12, color: '#F59E0B', fontWeight: 400 }}>
                dc<span style={{ color: '#D2042D', margin: '0 1px' }}>·</span><span style={{ fontWeight: 700 }}>index</span>
              </span>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>114.36</span>
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>+0.81%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#D2042D', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 3, textTransform: 'uppercase' }}>e-commerce</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Amazon's fuel surcharge: Cost recovery or margin play?</span>
            </div>
          </div>
          <Note>The dc·index label in the top bar uses the same serif light·bold pattern in gold. Ties the branding to every page.</Note>
        </Section>

        {/* ===== 5. Article byline ===== */}
        <Section title="5. Article bylines — branded separator">
          <Card>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#D2042D', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                <span style={{ color: '#D2042D' }}>·</span> e-commerce
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                Amazon's fuel surcharge: Cost recovery or margin play?
              </h3>
              <div style={{ fontSize: 13, color: '#666' }}>
                Andrew Watson <span style={{ color: '#D2042D', margin: '0 4px' }}>·</span> 6d ago
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9333EA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                <span style={{ color: '#D2042D' }}>·</span> features
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                Duckbill: The AI that can
              </h3>
              <div style={{ fontSize: 13, color: '#666' }}>
                Andrew Watson <span style={{ color: '#D2042D', margin: '0 4px' }}>·</span> Nov 5
              </div>
            </div>
          </Card>
          <Note>Article titles in serif. Red dot as the separator in bylines ("Author · Date") and as a bullet before the category tag. The dot becomes the brand's recurring motif.</Note>
        </Section>

        {/* ===== 6. Burger menu ===== */}
        <Section title="6. Burger menu — branded section labels">
          <div style={{
            background: '#F4F1EA', width: 320, borderRadius: 8, padding: '24px 20px',
            border: '1px solid rgba(0,0,0,0.06)', marginBottom: 10,
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: '#D2042D', marginBottom: 20 }}>
              <span style={{ fontWeight: 400 }}>dollar</span>
              <span style={{ margin: '0 2px' }}>·</span>
              <span style={{ fontWeight: 700 }}>menu</span>
            </div>
            <MenuSection label="articles">
              <MenuItem>most recent</MenuItem>
              <MenuItem>top articles</MenuItem>
              <MenuItem>features</MenuItem>
              <MenuItem>opinion</MenuItem>
            </MenuSection>
            <MenuSection label="market">
              <MenuItem live>fundraising tracker</MenuItem>
              <MenuItem live>dc index</MenuItem>
              <MenuItem live>platform tracker</MenuItem>
              <MenuItem>brand leaderboard</MenuItem>
            </MenuSection>
            <MenuSection label="writers">
              <MenuItem>andrew watson</MenuItem>
              <MenuItem>benjamin cogan</MenuItem>
            </MenuSection>
          </div>
          <Note>Menu header uses the brand pattern. Section labels prefixed with red dot. All lowercase = consistent brand voice.</Note>
        </Section>

        {/* ===== 7. Loading / empty states ===== */}
        <Section title="7. Loading & empty states">
          <Card>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: '#0F172A', marginBottom: 8 }}>
                <span style={{ fontWeight: 400 }}>dollar</span>
                <span style={{ color: '#D2042D', margin: '0 2px', fontSize: '110%', animation: 'dc-dot-pulse 1.2s infinite' }}>·</span>
                <span style={{ fontWeight: 700 }}>commerce</span>
              </div>
              <div style={{ fontSize: 13, color: '#999' }}>Loading...</div>
              <style>{`@keyframes dc-dot-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.2; }
              }`}</style>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <span style={{ color: '#D2042D', fontSize: 32 }}>·</span>
              <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>No articles match this filter</div>
            </div>
          </Card>
          <Note>The pulsing red dot becomes the loading indicator. The dot alone works as an empty-state icon. Branded without being heavy.</Note>
        </Section>

        {/* ===== 8. Full page mockup ===== */}
        <Section title="8. Full page mockup — everything together">
          <div style={{ background: '#F4F1EA', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            {/* Top bar */}
            <div style={{ background: '#0F172A', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: SERIF, fontSize: 11, color: '#F59E0B' }}>
                  dc<span style={{ color: '#D2042D', margin: '0 1px' }}>·</span><span style={{ fontWeight: 700 }}>index</span>
                </span>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>114.36</span>
                <span style={{ color: '#10b981', fontSize: 11 }}>+0.81%</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Amazon's fuel surcharge...</span>
            </div>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E0E0E0', textAlign: 'center' }}>
              <span style={{ fontFamily: SERIF, fontSize: 22 }}>
                <span style={{ fontWeight: 400, color: '#0F172A' }}>dollar</span>
                <span style={{ color: '#D2042D', margin: '0 2px', fontSize: '110%' }}>·</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>commerce</span>
              </span>
            </div>
            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#D2042D', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                · e-commerce
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                Amazon's fuel surcharge: Cost recovery or margin play?
              </h2>
              <div style={{ fontSize: 12, color: '#666' }}>
                Andrew Watson <span style={{ color: '#D2042D' }}>·</span> 6d ago
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
                <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  <span style={{ color: '#D2042D' }}>·</span> founder features
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Duckbill', 'Ben Cogan', 'AppLovin'].map(t => (
                    <div key={t} style={{ flex: 1, background: '#fff', borderRadius: 6, padding: 12, border: '1px solid #f0f0f0' }}>
                      <div style={{ height: 60, background: '#eee', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700 }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>{title}</h2>
      <div style={{ height: 2, background: '#D2042D', width: 40, marginBottom: 16 }} />
      {children}
    </section>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: '#F4F1EA', padding: '20px 24px', borderRadius: 8, marginBottom: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

function Note({ children }) {
  return <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>{children}</p>;
}

function SectionHead({ children }) {
  return (
    <div style={{
      fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 600, color: '#666',
      textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 8,
      borderBottom: '1px solid #E0E0E0',
    }}>
      <span style={{ color: '#D2042D', marginRight: 6 }}>·</span>
      {children}
    </div>
  );
}

function CatTag({ children }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: '#D2042D', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      <span style={{ marginRight: 4 }}>·</span>{children}
    </span>
  );
}

function CatTagPill({ color, children }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {children}
    </span>
  );
}

function MenuSection({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        <span style={{ color: '#D2042D', marginRight: 4 }}>·</span>{label}
      </div>
      {children}
    </div>
  );
}

function MenuItem({ children, live }) {
  return (
    <div style={{ padding: '6px 0 6px 12px', fontSize: 14, color: live ? '#0F172A' : '#999', fontWeight: live ? 500 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
      → {children}
      {live && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />}
    </div>
  );
}

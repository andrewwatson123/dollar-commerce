/**
 * Preview: Dollar Commerce logo variations.
 * Square icons, full logos, compact marks.
 */

'use client';

const SERIF = "Georgia, 'Times New Roman', serif";
const BG = '#F4F1EA';
const DARK = '#0F172A';
const RED = '#D2042D';

export default function LogoPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#e5e5e5', fontFamily: 'system-ui, sans-serif', padding: '48px 40px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>Logo Variations</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 48px' }}>
          Square icons (favicon, app icon, social) + full logos. All on cream and dark backgrounds.
        </p>

        {/* ═══ SQUARE ICONS ═══ */}
        <Section title="1. Square Icons — d·c mark">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>
            Compact square marks for favicons, app icons, and social profile pictures.
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* A: d·c on cream */}
            <IconBox label="d·c on cream" bg={BG} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 44, color: DARK, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle', margin: '0 1px' }}>·</span>
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>

            {/* B: d·c on dark */}
            <IconBox label="d·c on dark" bg={DARK} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 44, color: '#fff', letterSpacing: -1 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle', margin: '0 1px' }}>·</span>
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>

            {/* C: dc with red C on cream */}
            <IconBox label="d + red C" bg={BG} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 44, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400, color: DARK }}>d</span>
                <span style={{ fontWeight: 700, color: RED }}>c</span>
              </span>
            </IconBox>

            {/* D: dc with red C on dark */}
            <IconBox label="d + red C (dark)" bg={DARK} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 44, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400, color: '#fff' }}>d</span>
                <span style={{ fontWeight: 700, color: RED }}>c</span>
              </span>
            </IconBox>

            {/* E: Red dot only */}
            <IconBox label="Red dot mark" bg={BG} size={120}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: RED, display: 'block' }} />
            </IconBox>

            {/* F: Red dot on dark */}
            <IconBox label="Red dot (dark)" bg={DARK} size={120}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: RED, display: 'block' }} />
            </IconBox>
          </div>
        </Section>

        {/* ═══ SQUARE ICONS — STACKED ═══ */}
        <Section title="2. Square Icons — Stacked">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>
            Dollar over commerce, stacked vertically in a square frame.
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <IconBox label="Stacked on cream" bg={BG} size={120}>
              <div style={{ fontFamily: SERIF, textAlign: 'center', lineHeight: 1.1 }}>
                <div style={{ fontSize: 22, fontWeight: 400, color: DARK }}>dollar</div>
                <div style={{ fontSize: 10, color: RED, lineHeight: 0.8 }}>·</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: DARK }}>commerce</div>
              </div>
            </IconBox>

            <IconBox label="Stacked on dark" bg={DARK} size={120}>
              <div style={{ fontFamily: SERIF, textAlign: 'center', lineHeight: 1.1 }}>
                <div style={{ fontSize: 22, fontWeight: 400, color: '#fff' }}>dollar</div>
                <div style={{ fontSize: 10, color: RED, lineHeight: 0.8 }}>·</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>commerce</div>
              </div>
            </IconBox>

            <IconBox label="Stacked (compact)" bg={BG} size={120}>
              <div style={{ fontFamily: SERIF, textAlign: 'center', lineHeight: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 400, color: DARK, letterSpacing: 2, textTransform: 'uppercase' }}>dollar</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: RED, margin: '4px auto' }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: DARK, letterSpacing: 2, textTransform: 'uppercase' }}>commerce</div>
              </div>
            </IconBox>
          </div>
        </Section>

        {/* ═══ COMPACT MARKS ═══ */}
        <Section title="3. Compact Marks — d[dot]c variations">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>
            Trying different weights, sizes, and dot placements.
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Large bold */}
            <IconBox label="Bold d·c" bg={BG} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: DARK, letterSpacing: -2 }}>
                d<span style={{ color: RED, fontSize: '40%', verticalAlign: 'middle' }}>●</span>c
              </span>
            </IconBox>

            {/* Outline style */}
            <IconBox label="Ring dot" bg={BG} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 48, color: DARK, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ width: 12, height: 12, borderRadius: '50%', border: `3px solid ${RED}`, display: 'inline-block' }} />
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>

            {/* Monogram with bar */}
            <IconBox label="DC bar" bg={BG} size={120}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: DARK, letterSpacing: 4 }}>DC</span>
                <div style={{ height: 3, background: RED, borderRadius: 2, marginTop: 4, width: '100%' }} />
              </div>
            </IconBox>

            {/* DC bar on dark */}
            <IconBox label="DC bar (dark)" bg={DARK} size={120}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: 4 }}>DC</span>
                <div style={{ height: 3, background: RED, borderRadius: 2, marginTop: 4, width: '100%' }} />
              </div>
            </IconBox>

            {/* Minimal lowercase */}
            <IconBox label="Minimal dc" bg={BG} size={120}>
              <span style={{ fontFamily: SERIF, fontSize: 48, color: DARK, letterSpacing: 2 }}>
                <span style={{ fontWeight: 300 }}>d</span>
                <span style={{ fontWeight: 700, color: RED }}>c</span>
              </span>
            </IconBox>
          </div>
        </Section>

        {/* ═══ FULL LOGOS ═══ */}
        <Section title="4. Full Logos — Horizontal">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>
            The full wordmark for headers, email signatures, and marketing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Original on cream */}
            <LogoRow label="Standard (cream)" bg={BG}>
              <span style={{ fontFamily: SERIF, fontSize: 32, color: DARK, letterSpacing: 0.3 }}>
                <span style={{ fontWeight: 400 }}>dollar</span>
                <span style={{ color: RED, margin: '0 3px', fontSize: '110%' }}>·</span>
                <span style={{ fontWeight: 700 }}>commerce</span>
              </span>
            </LogoRow>

            {/* On dark */}
            <LogoRow label="Standard (dark)" bg={DARK}>
              <span style={{ fontFamily: SERIF, fontSize: 32, color: '#fff', letterSpacing: 0.3 }}>
                <span style={{ fontWeight: 400 }}>dollar</span>
                <span style={{ color: RED, margin: '0 3px', fontSize: '110%' }}>·</span>
                <span style={{ fontWeight: 700 }}>commerce</span>
              </span>
            </LogoRow>

            {/* With red commerce */}
            <LogoRow label="Red commerce" bg={BG}>
              <span style={{ fontFamily: SERIF, fontSize: 32, letterSpacing: 0.3 }}>
                <span style={{ fontWeight: 400, color: DARK }}>dollar</span>
                <span style={{ color: RED, margin: '0 3px', fontSize: '110%' }}>·</span>
                <span style={{ fontWeight: 700, color: RED }}>commerce</span>
              </span>
            </LogoRow>

            {/* All caps with bar */}
            <LogoRow label="Caps + underline" bg={BG}>
              <div>
                <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: 6, textTransform: 'uppercase' }}>
                  dollar<span style={{ color: RED, margin: '0 2px', letterSpacing: 0 }}>·</span>commerce
                </span>
                <div style={{ height: 2, background: RED, marginTop: 6 }} />
              </div>
            </LogoRow>

            {/* Compact with dc icon */}
            <LogoRow label="dc mark + wordmark" bg={BG}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, background: DARK,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: SERIF, fontSize: 22, color: '#fff', letterSpacing: -1 }}>
                    d<span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle' }}>·</span>c
                  </span>
                </div>
                <span style={{ fontFamily: SERIF, fontSize: 28, color: DARK, letterSpacing: 0.3 }}>
                  <span style={{ fontWeight: 400 }}>dollar</span>
                  <span style={{ color: RED, margin: '0 3px', fontSize: '110%' }}>·</span>
                  <span style={{ fontWeight: 700 }}>commerce</span>
                </span>
              </div>
            </LogoRow>

            {/* dc mark + wordmark on dark */}
            <LogoRow label="dc mark + wordmark (dark)" bg={DARK}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: SERIF, fontSize: 22, color: '#fff', letterSpacing: -1 }}>
                    d<span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle' }}>·</span>c
                  </span>
                </div>
                <span style={{ fontFamily: SERIF, fontSize: 28, color: '#fff', letterSpacing: 0.3 }}>
                  <span style={{ fontWeight: 400 }}>dollar</span>
                  <span style={{ color: RED, margin: '0 3px', fontSize: '110%' }}>·</span>
                  <span style={{ fontWeight: 700 }}>commerce</span>
                </span>
              </div>
            </LogoRow>
          </div>
        </Section>

        {/* ═══ SIZE REFERENCE ═══ */}
        <Section title="5. Size Reference — All icons at real sizes">
          <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', margin: '0 0 20px' }}>
            How the d·c mark looks at favicon (32px), app icon (64px), and social (128px) sizes.
          </p>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
            <IconBox label="32px favicon" bg={BG} size={32} noPad>
              <span style={{ fontFamily: SERIF, fontSize: 14, color: DARK, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle' }}>·</span>
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>

            <IconBox label="48px" bg={BG} size={48} noPad>
              <span style={{ fontFamily: SERIF, fontSize: 20, color: DARK, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle' }}>·</span>
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>

            <IconBox label="64px app" bg={BG} size={64} noPad>
              <span style={{ fontFamily: SERIF, fontSize: 28, color: DARK, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle' }}>·</span>
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>

            <IconBox label="128px social" bg={BG} size={128} noPad>
              <span style={{ fontFamily: SERIF, fontSize: 56, color: DARK, letterSpacing: -1 }}>
                <span style={{ fontWeight: 400 }}>d</span>
                <span style={{ color: RED, fontSize: '50%', verticalAlign: 'middle' }}>·</span>
                <span style={{ fontWeight: 700 }}>c</span>
              </span>
            </IconBox>
          </div>
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

function IconBox({ label, bg, size, children, noPad }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: size, height: size, background: bg, borderRadius: size > 64 ? 16 : 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {children}
      </div>
      <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>{label}</div>
    </div>
  );
}

function LogoRow({ label, bg, children }) {
  return (
    <div style={{
      background: bg, borderRadius: 12, padding: '32px 40px',
      border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {children}
      <span style={{ fontSize: 11, color: bg === '#0F172A' ? 'rgba(255,255,255,0.4)' : '#999' }}>{label}</span>
    </div>
  );
}

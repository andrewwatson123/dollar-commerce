/**
 * Logo export page — renders each logo as a canvas and triggers PNG download.
 * Navigate to /preview/logo-export to download all three.
 */
'use client';

import { useRef, useEffect, useState } from 'react';

const SERIF = "Georgia, 'Times New Roman', serif";
const DARK = '#0F172A';
const RED = '#D2042D';
const BG = '#F4F1EA';

export default function LogoExport() {
  return (
    <div style={{ minHeight: '100vh', background: '#e5e5e5', fontFamily: 'system-ui, sans-serif', padding: '48px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Logo PNG Export</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 40px' }}>Click each button to download the PNG.</p>

        <LogoCanvas
          name="dc-logo-full-cream"
          label="1. Full wordmark on cream"
          width={1600}
          height={320}
          draw={(ctx, w, h) => {
            ctx.fillStyle = BG;
            ctx.fillRect(0, 0, w, h);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const y = h / 2 + 8;
            const size = 96;
            let x = w / 2 - 270;

            ctx.font = `normal ${size}px Georgia, serif`;
            ctx.fillStyle = DARK;
            ctx.textAlign = 'left';
            ctx.fillText('dollar', x, y);
            x += ctx.measureText('dollar').width + 8;

            ctx.font = `normal ${Math.round(size * 1.1)}px Georgia, serif`;
            ctx.fillStyle = RED;
            ctx.fillText('·', x, y - 4);
            x += ctx.measureText('·').width + 8;

            ctx.font = `bold ${size}px Georgia, serif`;
            ctx.fillStyle = DARK;
            ctx.fillText('commerce', x, y);
          }}
        />

        <LogoCanvas
          name="dc-logo-mark-wordmark"
          label="2. dc mark + wordmark on cream"
          width={1600}
          height={320}
          draw={(ctx, w, h) => {
            ctx.fillStyle = BG;
            ctx.fillRect(0, 0, w, h);

            // Navy rounded rect for dc icon
            const boxSize = 140;
            const boxX = 200;
            const boxY = (h - boxSize) / 2;
            const r = 20;
            ctx.beginPath();
            ctx.moveTo(boxX + r, boxY);
            ctx.lineTo(boxX + boxSize - r, boxY);
            ctx.quadraticCurveTo(boxX + boxSize, boxY, boxX + boxSize, boxY + r);
            ctx.lineTo(boxX + boxSize, boxY + boxSize - r);
            ctx.quadraticCurveTo(boxX + boxSize, boxY + boxSize, boxX + boxSize - r, boxY + boxSize);
            ctx.lineTo(boxX + r, boxY + boxSize);
            ctx.quadraticCurveTo(boxX, boxY + boxSize, boxX, boxY + boxSize - r);
            ctx.lineTo(boxX, boxY + r);
            ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
            ctx.closePath();
            ctx.fillStyle = DARK;
            ctx.fill();

            // dc text inside box
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const cx = boxX + boxSize / 2;
            const cy = boxY + boxSize / 2 + 4;

            ctx.font = `normal 68px Georgia, serif`;
            ctx.fillStyle = '#fff';
            const dWidth = ctx.measureText('d').width;
            ctx.font = `bold 68px Georgia, serif`;
            const cWidth = ctx.measureText('c').width;
            ctx.font = `normal 34px Georgia, serif`;
            const dotWidth = ctx.measureText('·').width;
            const totalW = dWidth + dotWidth + cWidth;
            let ix = cx - totalW / 2;

            ctx.font = `normal 68px Georgia, serif`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText('d', ix, cy);
            ix += dWidth;
            ctx.font = `normal 34px Georgia, serif`;
            ctx.fillStyle = RED;
            ctx.fillText('·', ix, cy - 10);
            ix += dotWidth;
            ctx.font = `bold 68px Georgia, serif`;
            ctx.fillStyle = '#fff';
            ctx.fillText('c', ix, cy);

            // Wordmark
            const y = h / 2 + 8;
            let x = 380;
            const size = 84;
            ctx.textAlign = 'left';

            ctx.font = `normal ${size}px Georgia, serif`;
            ctx.fillStyle = DARK;
            ctx.fillText('dollar', x, y);
            x += ctx.measureText('dollar').width + 6;

            ctx.font = `normal ${Math.round(size * 1.1)}px Georgia, serif`;
            ctx.fillStyle = RED;
            ctx.fillText('·', x, y - 4);
            x += ctx.measureText('·').width + 6;

            ctx.font = `bold ${size}px Georgia, serif`;
            ctx.fillStyle = DARK;
            ctx.fillText('commerce', x, y);
          }}
        />

        <LogoCanvas
          name="dc-icon-navy"
          label="3. Navy dc square icon"
          width={512}
          height={512}
          draw={(ctx, w, h) => {
            // Navy rounded rect
            const r = 64;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(w - r, 0);
            ctx.quadraticCurveTo(w, 0, w, r);
            ctx.lineTo(w, h - r);
            ctx.quadraticCurveTo(w, h, w - r, h);
            ctx.lineTo(r, h);
            ctx.quadraticCurveTo(0, h, 0, h - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.fillStyle = DARK;
            ctx.fill();

            // dc text — 20% larger, dot as a circle
            ctx.textBaseline = 'middle';
            const cy = h / 2 + 10;
            const size = 240;
            const dotRadius = 11;
            const dotGap = 6;

            ctx.font = `normal ${size}px Georgia, serif`;
            const dW = ctx.measureText('d').width;
            ctx.font = `bold ${size}px Georgia, serif`;
            const cW = ctx.measureText('c').width;

            const total = dW + dotGap + dotRadius * 2 + dotGap + cW;
            let x = (w - total) / 2;

            ctx.textAlign = 'left';
            ctx.font = `normal ${size}px Georgia, serif`;
            ctx.fillStyle = '#fff';
            ctx.fillText('d', x, cy);
            x += dW + dotGap;

            // Red dot as a filled circle, vertically centered
            ctx.beginPath();
            ctx.arc(x + dotRadius, cy - size * 0.12, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = RED;
            ctx.fill();
            x += dotRadius * 2 + dotGap;

            ctx.font = `bold ${size}px Georgia, serif`;
            ctx.fillStyle = '#fff';
            ctx.fillText('c', x, cy);
          }}
        />
      </div>
    </div>
  );
}

function LogoCanvas({ name, label, width, height, draw }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    draw(ctx, width, height);
    setReady(true);
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>{label}</h3>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
      />
      <br />
      <button
        onClick={handleDownload}
        disabled={!ready}
        style={{
          marginTop: 12, padding: '10px 24px', borderRadius: 8,
          fontSize: 14, fontWeight: 600, color: '#fff', background: DARK,
          border: 'none', cursor: 'pointer',
        }}
      >
        Download {name}.png
      </button>
    </div>
  );
}

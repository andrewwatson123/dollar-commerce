/**
 * Generate logo PNGs using a headless approach.
 * Creates SVG files that can be opened in any browser and saved as PNG.
 *
 * Usage: node scripts/export-logos.mjs
 * Then open the generated HTML files in a browser and screenshot/save.
 */

import { writeFileSync } from 'fs';

const DARK = '#0F172A';
const RED = '#D2042D';
const BG = '#F4F1EA';
const SERIF = "Georgia, 'Times New Roman', serif";

// Logo 1: Full wordmark on cream
const logo1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="320" viewBox="0 0 1600 320">
  <rect width="1600" height="320" fill="${BG}"/>
  <text x="800" y="185" text-anchor="middle" font-family="${SERIF}" font-size="128" fill="${DARK}">
    <tspan font-weight="400">dollar</tspan><tspan fill="${RED}" font-size="140" dx="8" dy="-5">·</tspan><tspan font-weight="700" dx="8" dy="5">commerce</tspan>
  </text>
</svg>`;

// Logo 2: dc mark + wordmark on cream
const logo2 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="320" viewBox="0 0 1600 320">
  <rect width="1600" height="320" fill="${BG}"/>
  <!-- dc icon box -->
  <rect x="260" y="72" width="176" height="176" rx="24" fill="${DARK}"/>
  <text x="348" y="185" text-anchor="middle" font-family="${SERIF}" font-size="88" fill="#fff">
    <tspan font-weight="400">d</tspan><tspan fill="${RED}" font-size="44" dy="-8">·</tspan><tspan font-weight="700" dy="8">c</tspan>
  </text>
  <!-- wordmark -->
  <text x="500" y="185" font-family="${SERIF}" font-size="112" fill="${DARK}">
    <tspan font-weight="400">dollar</tspan><tspan fill="${RED}" font-size="123" dx="6" dy="-4">·</tspan><tspan font-weight="700" dx="6" dy="4">commerce</tspan>
  </text>
</svg>`;

// Logo 3: Navy dc square icon
const logo3 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="${DARK}"/>
  <text x="256" y="295" text-anchor="middle" font-family="${SERIF}" font-size="200" fill="#fff" letter-spacing="-8">
    <tspan font-weight="400">d</tspan><tspan fill="${RED}" font-size="100" dy="-20">·</tspan><tspan font-weight="700" dy="20">c</tspan>
  </text>
</svg>`;

writeFileSync('public/dc-logo-full-cream.svg', logo1);
writeFileSync('public/dc-logo-mark-wordmark.svg', logo2);
writeFileSync('public/dc-icon-navy.svg', logo3);

console.log('✅ SVG logos saved to /public/');
console.log('');
console.log('Files:');
console.log('  1. public/dc-logo-full-cream.svg     — Full wordmark on cream');
console.log('  2. public/dc-logo-mark-wordmark.svg   — dc mark + wordmark');
console.log('  3. public/dc-icon-navy.svg            — Navy dc square icon');
console.log('');
console.log('Open in browser to view, or convert to PNG with:');
console.log('  open public/dc-logo-full-cream.svg');

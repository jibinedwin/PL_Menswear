/* ==========================================================================
   PL MENS WEAR — EVERY Terrain image generator
   Generates the five occasion editorial scenes (1200x1200) used by the
   EVERY Terrain sticky section. Same deterministic art direction as
   tools/generate-images.js. Replace with real photography in production.
   Run:  node tools/generate-terrain-images.js
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ---------- deterministic PRNG ---------- */
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(seed) { return mulberry32(xmur3(seed)()); }
function between(r, a, b) { return a + r() * (b - a); }

/* ---------- palettes (brand tokens) ---------- */
const PALETTES = {
  sand:    { stops: ['#F3EDE0', '#E6DAC4', '#CDBB9C'], figure: '#2E2C28', dark: false },
  ivory:   { stops: ['#F6F1E6', '#EBE3D2', '#D8CCB4'], figure: '#33312C', dark: false },
  olive:   { stops: ['#E9E6D6', '#C7C9AD', '#8F9478'], figure: '#272B20', dark: false },
  stone:   { stops: ['#E8E6E0', '#D2CFC6', '#ABA79B'], figure: '#2E2C28', dark: false },
  dusk:    { stops: ['#4A4540', '#332F2B', '#201D1A'], figure: '#141210', dark: true },
  indigo:  { stops: ['#39424F', '#2A323D', '#1A2029'], figure: '#12161C', dark: true }
};

/* ---------- svg building blocks ---------- */
function grainFilter(id) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0"/>` +
    `</filter>`;
}

/* abstract standing-figure silhouette (approx 100 units tall, centred on cx) */
function figure(cx, groundY, h, fill, opacity) {
  const u = h / 100;
  const f = n => (cx + n * u).toFixed(1);
  const g = n => (groundY - n * u).toFixed(1);
  return `<g fill="${fill}" opacity="${opacity}">
    <circle cx="${cx}" cy="${g(93)}" r="${(7 * u).toFixed(1)}"/>
    <path d="M ${f(-7.5)} ${g(0)}
      L ${f(-9)} ${g(30)}
      C ${f(-10)} ${g(40)} ${f(-11)} ${g(44)} ${f(-11)} ${g(52)}
      C ${f(-11)} ${g(62)} ${f(-13)} ${g(66)} ${f(-14)} ${g(72)}
      C ${f(-15)} ${g(78)} ${f(-13)} ${g(82)} ${f(-9)} ${g(84)}
      C ${f(-5)} ${g(86)} ${f(5)} ${g(86)} ${f(9)} ${g(84)}
      C ${f(13)} ${g(82)} ${f(15)} ${g(78)} ${f(14)} ${g(72)}
      C ${f(13)} ${g(66)} ${f(11)} ${g(62)} ${f(11)} ${g(52)}
      C ${f(11)} ${g(44)} ${f(10)} ${g(40)} ${f(9)} ${g(30)}
      L ${f(7.5)} ${g(0)}
      L ${f(2.5)} ${g(0)}
      L ${f(2)} ${g(22)}
      L ${f(-2)} ${g(22)}
      L ${f(-2.5)} ${g(0)} Z"/>
    <ellipse cx="${cx}" cy="${groundY + 3 * u}" rx="${26 * u}" ry="${4 * u}" fill="#000" opacity="0.14"/>
  </g>`;
}

/* ---------- scene renderer (square editorial frame) ---------- */
function scene({ w, h, seed, pal, figures = 1, arch = true }) {
  const r = rngFor(seed);
  const id = seed.replace(/[^a-z0-9]/gi, '');
  const hy = h * between(r, 0.68, 0.74);
  const sunX = w * between(r, 0.5, 0.8), sunY = hy - h * between(r, 0.18, 0.34), sunR = Math.max(w, h) * between(r, 0.4, 0.55);
  let cols = '';
  if (arch) {
    const n = Math.floor(between(r, 2, 5));
    for (let i = 0; i < n; i++) {
      const cw = between(r, 0.02, 0.05) * w;
      const cx = w * between(r, 0.06, 0.94);
      const chh = hy - h * between(r, 0.12, 0.34);
      cols += `<rect x="${(cx - cw / 2).toFixed(0)}" y="${(hy - chh).toFixed(0)}" width="${cw.toFixed(0)}" height="${chh.toFixed(0)}" fill="${pal.figure}" opacity="${between(r, 0.06, 0.14).toFixed(2)}"/>\n  `;
    }
  }
  const fg = [];
  const slots = figures === 1 ? [0.5] : [0.36, 0.66];
  for (let i = 0; i < figures; i++) {
    const fx = w * (slots[i] + between(r, -0.04, 0.04));
    const fh = h * between(r, 0.52, 0.6) * (figures === 1 ? 1 : between(r, 0.9, 1));
    fg.push(figure(fx, hy + 2, fh, pal.figure, 0.92));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="${pal.stops[0]}"/><stop offset="0.55" stop-color="${pal.stops[1]}"/><stop offset="1" stop-color="${pal.stops[2]}"/>
    </linearGradient>
    <radialGradient id="sun${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="${pal.dark ? 0.28 : 0.6}"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    ${grainFilter('gr' + id)}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg${id})"/>
  <circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="${sunR.toFixed(0)}" fill="url(#sun${id})"/>
  <rect x="0" y="${hy.toFixed(0)}" width="${w}" height="${(h - hy).toFixed(0)}" fill="${pal.stops[2]}" opacity="0.5"/>
  ${cols}${fg.join('\n  ')}
  <rect width="${w}" height="${h}" filter="url(#gr${id})" opacity="0.9"/>
</svg>`;
}

/* ---------- write helper ---------- */
function writeImg(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log('✓', rel);
}

/* ---------- catalogue: one scene per occasion card ---------- */
const terrains = [
  ['work',    PALETTES.stone,  1],
  ['festive', PALETTES.dusk,   1],
  ['weekend', PALETTES.sand,   2],
  ['travel',  PALETTES.olive,  1],
  ['evening', PALETTES.indigo, 1]
];

terrains.forEach(([slug, pal, figures]) => {
  writeImg(`assets/images/terrain/terrain-${slug}.svg`,
    scene({ w: 1200, h: 1200, seed: 'terrain-' + slug, pal, figures, arch: true }));
});

console.log('\nEVERY Terrain images generated.');

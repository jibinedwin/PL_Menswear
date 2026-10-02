/* ==========================================================================
   PL Mens Wear — placeholder image generator
   Generates original editorial-style SVG artwork for every image slot.
   Run:  node tools/generate-images.js
   Replace generated SVGs with real photography in production.
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
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(seed) { return mulberry32(xmur3(seed)()); }
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
function between(r, a, b) { return a + r() * (b - a); }

/* ---------- colour helpers ---------- */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(rgb) { return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

/* ---------- palettes ---------- */
const INK = '#2E2C28';
const PALETTES = {
  sand:    { stops: ['#F3EDE0', '#E6DAC4', '#CDBB9C'], figure: '#2E2C28', caption: 'rgba(46,44,40,0.72)', dark: false },
  ivory:   { stops: ['#F6F1E6', '#EBE3D2', '#D8CCB4'], figure: '#33312C', caption: 'rgba(46,44,40,0.72)', dark: false },
  olive:   { stops: ['#E9E6D6', '#C7C9AD', '#8F9478'], figure: '#272B20', caption: 'rgba(42,44,34,0.75)', dark: false },
  clay:    { stops: ['#F0E3D2', '#DCB996', '#B08157'], figure: '#33271E', caption: 'rgba(51,39,30,0.72)', dark: false },
  stone:   { stops: ['#E8E6E0', '#D2CFC6', '#ABA79B'], figure: '#2E2C28', caption: 'rgba(46,44,40,0.7)', dark: false },
  dusk:    { stops: ['#4A4540', '#332F2B', '#201D1A'], figure: '#141210', caption: 'rgba(238,231,216,0.8)', dark: true },
  indigo:  { stops: ['#39424F', '#2A323D', '#1A2029'], figure: '#12161C', caption: 'rgba(233,228,216,0.8)', dark: true }
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

/* soft folded-garment pebble for product art */
function garment(cx, cy, w, h, fill) {
  const x = w / 2, y = h / 2;
  return `<g>
    <ellipse cx="${cx}" cy="${cy + h * 0.52}" rx="${w * 0.46}" ry="${h * 0.09}" fill="#000" opacity="0.10"/>
    <path d="M ${cx - x * 0.2} ${cy - y}
      C ${cx + x * 0.55} ${cy - y * 1.05} ${cx + x} ${cy - y * 0.45} ${cx + x * 0.92} ${cy + y * 0.12}
      C ${cx + x * 0.84} ${cy + y * 0.72} ${cx + x * 0.35} ${cy + y} ${cx - x * 0.1} ${cy + y * 0.96}
      C ${cx - x * 0.62} ${cy + y * 0.9} ${cx - x * 0.98} ${cy + y * 0.4} ${cx - x * 0.9} ${cy - y * 0.15}
      C ${cx - x * 0.82} ${cy - y * 0.68} ${cx - x * 0.6} ${cy - y * 0.95} ${cx - x * 0.2} ${cy - y} Z" fill="${fill}"/>
    <path d="M ${cx - x * 0.55} ${cy - y * 0.25} C ${cx - x * 0.1} ${cy - y * 0.05} ${cx + x * 0.3} ${cy + y * 0.12} ${cx + x * 0.6} ${cy + y * 0.5}" stroke="#000" stroke-opacity="0.10" stroke-width="${(h * 0.02).toFixed(1)}" fill="none"/>
    <path d="M ${cx - x * 0.62} ${cy + y * 0.18} C ${cx - x * 0.25} ${cy + y * 0.38} ${cx + x * 0.15} ${cy + y * 0.52} ${cx + x * 0.45} ${cy + y * 0.82}" stroke="#000" stroke-opacity="0.08" stroke-width="${(h * 0.018).toFixed(1)}" fill="none"/>
  </g>`;
}

function caption(x, y, lines, color, sizes, anchor) {
  const a = anchor || 'start';
  return lines.map((line, i) =>
    `<text x="${x}" y="${y + i * (sizes[i] * 1.9)}" text-anchor="${a}" fill="${color}" ` +
    `font-family="Helvetica, Arial, sans-serif" font-size="${sizes[i]}" letter-spacing="${(sizes[i] * 0.22).toFixed(1)}" ` +
    `style="text-transform:uppercase">${escapeXml(line)}</text>`
  ).join('\n  ');
}
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function svgOpen(w, h) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img">`; }

function bgDefs(id, pal, r, sunPos) {
  const [c1, c2, c3] = pal.stops;
  return `<defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="0.55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
    </linearGradient>
    <radialGradient id="sun${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="${pal.dark ? 0.28 : 0.6}"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    ${grainFilter('gr' + id)}
  </defs>
  <rect width="${sunPos.w}" height="${sunPos.h}" fill="url(#bg${id})"/>`;
}

/* ---------- scene renderer (editorial lifestyle) ---------- */
function scene({ w, h, seed, pal, label, sub, figures = 2, arch = true }) {
  const r = rngFor(seed);
  const id = seed.replace(/[^a-z0-9]/gi, '');
  const hy = h * between(r, 0.6, 0.72);
  const sunX = w * between(r, 0.55, 0.85), sunY = hy - h * between(r, 0.12, 0.3), sunR = Math.max(w, h) * between(r, 0.38, 0.55);
  let cols = '';
  if (arch) {
    const n = Math.floor(between(r, 2, 5));
    for (let i = 0; i < n; i++) {
      const cw = between(r, 0.018, 0.045) * w;
      const cx = w * between(r, 0.06, 0.94);
      const chh = hy - h * between(r, 0.12, 0.34);
      cols += `<rect x="${(cx - cw / 2).toFixed(0)}" y="${(hy - chh).toFixed(0)}" width="${cw.toFixed(0)}" height="${chh.toFixed(0)}" fill="${pal.figure}" opacity="${between(r, 0.06, 0.14).toFixed(2)}"/>\n  `;
    }
  }
  const fg = [];
  const n = figures;
  const slots = n === 1 ? [0.5] : [0.36, 0.66];
  for (let i = 0; i < n; i++) {
    const fx = w * (slots[i] + between(r, -0.05, 0.05));
    const fh = h * between(r, 0.5, 0.62) * (n === 1 ? 1 : between(r, 0.88, 1));
    fg.push(figure(fx, hy + 2, fh, pal.figure, 0.92));
  }
  const capSize = Math.max(16, Math.round(w * 0.022));
  const subSize = Math.max(12, Math.round(w * 0.013));
  const capColor = pal.caption;
  const lines = [];
  if (label) lines.push(label);
  return `${svgOpen(w, h)}
  ${bgDefs(id, pal, r, { w, h })}
  <circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="${sunR.toFixed(0)}" fill="url(#sun${id})"/>
  <rect x="0" y="${hy.toFixed(0)}" width="${w}" height="${(h - hy).toFixed(0)}" fill="${pal.stops[2]}" opacity="0.5"/>
  ${cols}${fg.join('\n  ')}
  <rect width="${w}" height="${h}" filter="url(#gr${id})" opacity="0.9"/>
  ${lines.length ? caption(w * 0.06, h - (sub ? h * 0.09 : h * 0.07), lines, capColor, [capSize]) : ''}
  ${sub ? `<text x="${w * 0.06}" y="${h - h * 0.035}" fill="${capColor}" font-family="Helvetica, Arial, sans-serif" font-size="${subSize}" letter-spacing="${(subSize * 0.18).toFixed(1)}">${escapeXml(sub)}</text>` : ''}
</svg>`;
}

/* ---------- product renderer ---------- */
function productArt({ w, h, seed, fabricColor, label, price }) {
  const r = rngFor(seed);
  const id = seed.replace(/[^a-z0-9]/gi, '');
  const pal = pick(r, [PALETTES.ivory, PALETTES.sand, PALETTES.stone]);
  const blob = mix(fabricColor, pal.dark ? '#111111' : INK, 0.22);
  const gw = w * between(r, 0.52, 0.62), gh = h * between(r, 0.36, 0.44);
  const gx = w / 2 + between(r, -w * 0.04, w * 0.04), gy = h * between(r, 0.4, 0.46);
  const nameSize = Math.max(18, Math.round(w * 0.028));
  const priceSize = Math.max(14, Math.round(w * 0.021));
  return `${svgOpen(w, h)}
  ${bgDefs(id, pal, r, { w, h })}
  <circle cx="${(w * between(r, 0.6, 0.8)).toFixed(0)}" cy="${(h * between(r, 0.12, 0.22)).toFixed(0)}" r="${(w * 0.4).toFixed(0)}" fill="url(#sun${id})"/>
  ${garment(gx.toFixed(0), gy.toFixed(0), gw.toFixed(0), gh.toFixed(0), blob)}
  <rect width="${w}" height="${h}" filter="url(#gr${id})" opacity="0.9"/>
  ${caption(w / 2, h * 0.86, [label], 'rgba(46,44,40,0.78)', [nameSize], 'middle')}
  ${price ? `<text x="${w / 2}" y="${h * 0.86 + nameSize * 1.7}" text-anchor="middle" fill="rgba(46,44,40,0.55)" font-family="Helvetica, Arial, sans-serif" font-size="${priceSize}" letter-spacing="${(priceSize * 0.2).toFixed(1)}">${escapeXml(price)}</text>` : ''}
</svg>`;
}

/* ---------- write helpers ---------- */
function writeImg(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log('✓', rel);
}

/* ---------- catalogue of images to produce ---------- */
const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8')).products;

products.forEach(p => {
  const price = '₹' + p.price.toLocaleString('en-IN');
  writeImg(`assets/images/products/${p.id}-a.svg`,
    productArt({ w: 1000, h: 1250, seed: p.id + '-a', fabricColor: p.colorValues[0], label: p.name, price }));
  writeImg(`assets/images/products/${p.id}-b.svg`,
    scene({ w: 1000, h: 1250, seed: p.id + '-b', pal: pick(rngFor(p.id + 'p'), [PALETTES.sand, PALETTES.olive, PALETTES.clay, PALETTES.stone, PALETTES.ivory]), label: p.name.toUpperCase(), sub: price, figures: 1, arch: true }));
});

writeImg('assets/images/hero/hero-main.svg',
  scene({ w: 1920, h: 1080, seed: 'hero-main', pal: PALETTES.dusk, label: 'THE NEW SEASON', sub: 'PL MENS WEAR — AUTUMN EDITORIAL', figures: 1, arch: true }));
writeImg('assets/images/hero/hero-alt.svg',
  scene({ w: 1920, h: 1080, seed: 'hero-alt', pal: PALETTES.indigo, label: 'MADE FOR EVERY MOMENT', sub: 'PL MENS WEAR — CAMPAIGN', figures: 2, arch: true }));

const occasions = [
  ['work', PALETTES.stone, 'WORK', 'TAILORING FOR THE NINE-TO-NINE'],
  ['weekend', PALETTES.sand, 'WEEKEND', 'EASY PIECES, CONSIDERED'],
  ['travel', PALETTES.olive, 'TRAVEL', 'BUILT FOR THE LONG WAY THERE'],
  ['festive', PALETTES.dusk, 'FESTIVE', 'TEXTURE FOR THE SEASON’S EVENINGS'],
  ['evening', PALETTES.indigo, 'EVENING', 'DRESSED FOR DINNER']
];
occasions.forEach(([slug, pal, label, sub]) => {
  writeImg(`assets/images/occasions/occasion-${slug}.svg`,
    scene({ w: 1200, h: 1500, seed: 'occ-' + slug, pal, label, sub, figures: 1, arch: true }));
});

const categories = [
  ['shirts', PALETTES.ivory], ['trousers', PALETTES.sand], ['polos', PALETTES.olive], ['jeans', PALETTES.stone]
];
categories.forEach(([slug, pal]) => {
  writeImg(`assets/images/categories/category-${slug}.svg`,
    scene({ w: 1100, h: 1400, seed: 'cat-' + slug, pal, label: slug.toUpperCase(), sub: 'THE ESSENTIAL WARDROBE', figures: 1, arch: false }));
});

const collections = [
  ['linen', PALETTES.sand, 'THE LINEN EDIT'], ['essentials', PALETTES.ivory, 'THE ESSENTIAL COLLECTION'],
  ['premium', PALETTES.dusk, 'THE PREMIUM COLLECTION'], ['weekend', PALETTES.olive, 'THE WEEKEND COLLECTION'],
  ['festive', PALETTES.clay, 'THE FESTIVE EDIT'], ['travel', PALETTES.stone, 'THE TRAVEL EDIT']
];
collections.forEach(([slug, pal, label]) => {
  writeImg(`assets/images/collections/collection-${slug}.svg`,
    scene({ w: 1600, h: 1100, seed: 'coll-' + slug, pal, label, sub: 'PL MENS WEAR — COLLECTION', figures: 2, arch: true }));
});

writeImg('assets/images/lifestyle/story-main.svg',
  scene({ w: 1600, h: 1000, seed: 'story-main', pal: PALETTES.clay, label: 'DESIGNED FOR THE WAY YOU LIVE', sub: 'PL MENS WEAR — BRAND CAMPAIGN', figures: 2, arch: true }));
writeImg('assets/images/lifestyle/story-side.svg',
  scene({ w: 1000, h: 1250, seed: 'story-side', pal: PALETTES.olive, label: 'FROM THE JOURNAL', sub: 'NOTES ON FABRIC AND FIT', figures: 1, arch: true }));
writeImg('assets/images/lifestyle/about-hero.svg',
  scene({ w: 1920, h: 900, seed: 'about-hero', pal: PALETTES.sand, label: 'PL MENS WEAR', sub: 'EST. FOR EVERYDAY LIFE', figures: 2, arch: true }));
writeImg('assets/images/lifestyle/contact-side.svg',
  scene({ w: 1000, h: 1250, seed: 'contact-side', pal: PALETTES.stone, label: 'SAY HELLO', sub: 'CLIENT CARE, MON–SAT', figures: 1, arch: false }));

const looks = [
  ['look-01', PALETTES.stone, 900, 1200, 'OFFICE LOOK'], ['look-02', PALETTES.sand, 1200, 900, 'CASUAL WEEKEND'],
  ['look-03', PALETTES.olive, 900, 1200, 'TRAVEL OUTFIT'], ['look-04', PALETTES.dusk, 1200, 900, 'EVENING LOOK'],
  ['look-05', PALETTES.clay, 900, 1200, 'FESTIVE LOOK'], ['look-06', PALETTES.ivory, 1200, 900, 'THE LINEN EDIT'],
  ['look-07', PALETTES.indigo, 900, 1200, 'AFTER HOURS'], ['look-08', PALETTES.sand, 1200, 900, 'DENIM DAYS']
];
looks.forEach(([slug, pal, w, h, label]) => {
  writeImg(`assets/images/lookbook/${slug}.svg`,
    scene({ w, h, seed: slug, pal, label, sub: 'THE SEASON’S LOOKBOOK', figures: slug === 'look-01' || slug === 'look-05' ? 2 : 1, arch: true }));
});

console.log('\nAll images generated.');

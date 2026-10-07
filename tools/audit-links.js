/* ==========================================================================
   PL MENS WEAR — link & asset integrity audit
   Verifies every local href/src resolves to a real file, for all pages.
   Run: node tools/audit-links.js
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const pages = ['index.html'];
const cssFiles = ['css/base.css', 'css/header.css', 'css/hero.css', 'css/products.css', 'css/sections.css', 'css/responsive.css', 'css/terrain.css'];
const jsFiles = ['js/utils.js', 'js/data.js', 'js/navigation.js', 'js/wishlist.js', 'js/cart.js', 'js/search.js', 'js/products.js', 'js/main.js', 'js/terrain.js'];

let issues = 0;

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

/* ---------- HTML href/src audit (resolve relative to the page location) ---------- */
function auditHtml(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const baseDir = path.posix.dirname(file === 'index.html' ? 'index.html' : file);
  const attrs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)];
  for (const [, ref] of attrs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('data:') || ref.startsWith('http')) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (!clean) continue;
    const resolved = path.posix.normalize(path.posix.join(baseDir, clean));
    if (!exists(resolved)) {
      console.log(`BROKEN HTML  ${file}: "${ref}" -> ${resolved}`);
      issues++;
    }
  }
  /* srcset-less lazy check: also catch <img loading=... src> variants already covered */
}

/* ---------- CSS url() audit ---------- */
function auditCss(file) {
  const css = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)];
  for (const [, ref] of urls) {
    if (ref.startsWith('data:') || ref.startsWith('http')) continue;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
    if (!exists(resolved)) {
      console.log(`BROKEN CSS   ${file}: url(${ref}) -> ${resolved}`);
      issues++;
    }
  }
}

/* ---------- JS root-relative literals audit ----------
   JS modules build root-relative paths (pages/..., assets/...) that are
   prefixed with PLMW.base at runtime. The literal itself must exist from root. */
function auditJs(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lits = [...src.matchAll(/['"]((?:pages|assets|data)\/[^'"]+)['"]/g)];
  for (const [, ref] of lits) {
    const clean = ref.split('?')[0];
    if (!exists(clean)) {
      console.log(`BROKEN JS    ${file}: "${ref}"`);
      issues++;
    }
  }
}

/* ---------- image slots referenced by data modules ---------- */
function auditProductImages() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));
  for (const p of data.products) {
    for (const suffix of ['a', 'b']) {
      const rel = `assets/images/products/${p.id}-${suffix}.svg`;
      if (!exists(rel)) { console.log(`MISSING IMG  ${rel} (product ${p.id})`); issues++; }
    }
  }
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site-config.json'), 'utf8'));
  for (const o of [...cfg.occasions, ...cfg.collections]) {
    if (!exists(o.image)) { console.log(`MISSING IMG  ${o.image} (config)`); issues++; }
  }
}

pages.forEach(auditHtml);
cssFiles.forEach(auditCss);
jsFiles.forEach(auditJs);
auditProductImages();

/* ---------- hardcoded hero/section images on index (spot check dir counts) ---------- */
const imgCount = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.svg')).length;
console.log(`\nimages: products=${imgCount('assets/images/products')} occasions=${imgCount('assets/images/occasions')} collections=${imgCount('assets/images/collections')} lookbook=${imgCount('assets/images/lookbook')} lifestyle=${imgCount('assets/images/lifestyle')} hero=${imgCount('assets/images/hero')} categories=${imgCount('assets/images/categories')}`);

if (issues === 0) {
  console.log('\nAUDIT PASSED — no broken local references.');
} else {
  console.log(`\nAUDIT FAILED — ${issues} broken reference(s).`);
  process.exitCode = 1;
}

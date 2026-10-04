/* ==========================================================================
   Terrain section visual/geometry verification (dev-only)
   Loads the REAL index.html (all CSS/JS), scrolls the EVERY Terrain section
   through its phases at each required viewport, asserts the reference
   geometry rules, and saves screenshots for side-by-side comparison.
   Run: node tools/screenshot-terrain.js
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
];
const CHROME = CHROME_PATHS.find((p) => fs.existsSync(p));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(__dirname, '..', 'terrain-shots');

/* width x height pairs — heights follow common desktop/laptop/tablet/phone frames */
const VIEWPORTS = [
  { w: 1920, h: 1080 },
  { w: 1440, h: 900 },
  { w: 1366, h: 768 },
  { w: 1024, h: 768 },
  { w: 768, h: 1024 },
  { w: 390, h: 844 },
  { w: 375, h: 812 }
];
const PHASES = [
  { p: 0, tag: 'intro' },
  { p: 0.45, tag: 'flight' },
  { p: 1, tag: 'assembled' }
];

(async () => {
  if (!CHROME) { console.error('Chrome not found'); process.exit(1); }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-first-run', '--disable-gpu']
  });

  let failures = 0;

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewport({ width: vp.w, height: vp.h });
    await page.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
    /* let fonts/layout settle, then force-measure; drop the preloader overlay so
       the captured frames show the section itself (dev harness only) */
    await new Promise((r) => setTimeout(r, 900));
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const pre = document.getElementById('preloader');
      if (pre) pre.remove();
      document.body.style.overflow = '';
      const el = document.querySelector('plmw-terrain');
      if (el && el.requestMeasure) el.requestMeasure();
    });
    await new Promise((r) => setTimeout(r, 300));

    const problems = [];

    for (const phase of PHASES) {
      const geo = await page.evaluate((p) => {
        const el = document.querySelector('plmw-terrain');
        if (!el) return null;
        const runLen = el.getBoundingClientRect().height - window.innerHeight * 2;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, Math.round(top + p * runLen));
        return new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();
            const pin = el.querySelector('[data-terrain-pin]').getBoundingClientRect();
            const rail = el.querySelector('.terrain__rail');
            const cards = Array.prototype.slice.call(el.querySelectorAll('[data-terrain-card]'));
            const cardRects = cards.map((c) => { const r = c.getBoundingClientRect(); return { top: Math.round(r.top), w: Math.round(r.width), vis: getComputedStyle(c).visibility }; });
            const ruler = el.querySelector('[data-terrain-ruler]');
            const introFirst = el.querySelector('[data-terrain-first]').getBoundingClientRect();
            resolve({
              state: el.dataset.motionState,
              ready: el.hasAttribute('data-motion-ready'),
              done: el.hasAttribute('data-done'),
              sectionH: Math.round(rect.height),
              innerH: window.innerHeight,
              pinTop: Math.round(pin.top),
              pinH: Math.round(pin.height),
              railDisplay: getComputedStyle(rail).display,
              railGridCols: getComputedStyle(rail).gridTemplateColumns,
              cards: cardRects,
              rulerOpacity: ruler ? getComputedStyle(ruler).opacity : null,
              rulerVisible: ruler ? getComputedStyle(ruler).visibility : null,
              introFirstCenterX: Math.round(introFirst.left + introFirst.width / 2),
              innerW: window.innerWidth
            });
          }));
        });
      }, phase.p);

      if (!geo) { problems.push(phase.tag + ': element missing'); continue; }
      const tag = vp.w + 'p-' + phase.tag;

      /* universal: pinned stage fills the viewport */
      if (geo.ready && geo.pinH !== geo.innerH) problems.push(tag + ': pin height ' + geo.pinH + ' != viewport ' + geo.innerH);

      if (phase.p === 0) {
        if (!geo.ready) problems.push(tag + ': motion not ready');
        const c = geo.introFirstCenterX;
        if (Math.abs(c - geo.innerW / 2) > 60) problems.push(tag + ': intro wordmark not centred (x=' + c + ', centre=' + geo.innerW / 2 + ')');
      }
      if (phase.p === 1) {
        if (!geo.done) problems.push(tag + ': not done at end');
        const vis = geo.cards.map((c) => c.vis);
        if (!vis.every((v) => v === 'visible')) problems.push(tag + ': cards hidden: ' + vis.join('|'));
        const desktop = vp.w >= 1200;
        if (desktop) {
          /* reference: one flex row, tops aligned, featured (idx 2) widest */
          const tops = new Set(geo.cards.map((c) => c.top));
          if (tops.size !== 1) problems.push(tag + ': desktop card tops not aligned: ' + JSON.stringify(geo.cards.map((c) => c.top)));
          if (geo.cards[2].w <= Math.max(geo.cards[0].w, geo.cards[1].w, geo.cards[3].w, geo.cards[4].w)) problems.push(tag + ': featured card not widest');
          if (geo.railDisplay !== 'flex') problems.push(tag + ': desktop rail display ' + geo.railDisplay);
        } else {
          /* reference: 2-col grid, featured spans both columns */
          if (geo.railDisplay !== 'grid' || geo.railGridCols.split(' ').length !== 2) problems.push(tag + ': mobile/tablet rail not 2-col grid: ' + geo.railDisplay + ' / ' + geo.railGridCols);
          const featured = geo.cards[2];
          const sibling = geo.cards[0];
          if (!(featured.w > sibling.w * 1.6)) problems.push(tag + ': featured does not span both columns (fw=' + featured.w + ' sw=' + sibling.w + ')');
        }
        if (geo.rulerVisible === 'visible' && Number(geo.rulerOpacity) > 0.2) problems.push(tag + ': ruler too prominent');
      }

      await page.screenshot({ path: path.join(OUT_DIR, tag + '.png') });
    }

    errors.forEach((e) => problems.push('page error: ' + e));
    console.log((problems.length ? 'FAIL ' : 'PASS ') + vp.w + 'x' + vp.h + (problems.length ? '\n  ' + problems.join('\n  ') : ''));
    failures += problems.length;
    await page.close();
  }

  await browser.close();
  console.log('\nScreenshots in terrain-shots/. ' + (failures ? failures + ' problem(s)' : 'ALL GEOMETRY CHECKS PASSED'));
  process.exitCode = failures ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });

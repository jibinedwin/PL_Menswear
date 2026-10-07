/* ==========================================================================
   Terrain section verification harness (dev-only, not shipped to the site)
   Builds a minimal test page around the shipped section markup, then drives
   the <plmw-terrain> choreography through scroll phases in headless Chrome
   at each required viewport and asserts the state machine end-to-end.
   Run: node tools/verify-terrain.js
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

const VIEWPORTS = [1920, 1440, 1366, 1024, 768, 390, 375];

/* ---------- build the test page from the real index.html markup ---------- */
function buildTestPage() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const a = html.indexOf('    <!-- ======= EVERY TERRAIN');
  const b = html.indexOf('    <!-- ======= COLLECTIONS =======');
  if (a < 0 || b < 0) throw new Error('EVERY TERRAIN section not found in index.html');
  const section = html.slice(a, b);

  const driver = [
    '<script src="js/terrain.js"><\/script>',
    '<script>',
    'window.addEventListener("load", function () {',
    '  document.documentElement.style.scrollBehavior = "auto";',
    '  var el = document.querySelector("plmw-terrain");',
    '  var out = [];',
    '  function runLen() { return el.getBoundingClientRect().height - window.innerHeight * 2; }',
    '  function snap(p) {',
    '    var media = el.querySelector("[data-terrain-intro-media]");',
    '    var cards = Array.prototype.slice.call(el.querySelectorAll("[data-terrain-card]"));',
    '    var featured = el.querySelector(\'[data-featured="true"]\');',
    '    var w1 = el.querySelector("[data-terrain-first]");',
    '    var labels = el.querySelectorAll(".terrain__label");',
    '    return JSON.stringify({',
    '      p: p,',
    '      state: el.dataset.motionState,',
    '      ready: el.hasAttribute("data-motion-ready"),',
    '      done: el.hasAttribute("data-done"),',
    '      interactive: el.hasAttribute("data-cards-interactive"),',
    '      wedgeW: media.style.width,',
    '      w1Transformed: (w1.style.transform || "") !== "",',
    '      featuredIdx: cards.indexOf(featured),',
    '      cardVis: cards.map(function (c) { return c.style.visibility || "?"; }).join("|"),',
    '      labelOp: Array.prototype.slice.call(labels).map(function (l) { return l.style.opacity; }).join(","),',
    '      railInert: el.querySelector(".terrain__rail").hasAttribute("inert")',
    '    });',
    '  }',
    '  var pts = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];',
    '  var i = 0;',
    '  function step() {',
    '    if (i >= pts.length) { report(); return; }',
    '    var p = pts[i++];',
    '    var top = el.getBoundingClientRect().top + window.scrollY;',
    '    window.scrollTo(0, Math.round(top + p * runLen()));',
    '    requestAnimationFrame(function () { requestAnimationFrame(function () {',
    '      out.push(snap(p));',
    '      setTimeout(step, 30);',
    '    }); });',
    '  }',
    '  function report() {',
    '    var M = "TERRAIN-TEST-";',
    '    document.getElementById("results").textContent = M + "START\\n" + out.join("\\n") + "\\n" + M + "END";',
    '    document.title = "TEST-DONE";',
    '  }',
    '  setTimeout(step, 400);',
    '});',
    '<\/script>'
  ].join('\n');

  const page = '<!DOCTYPE html>\n<html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Terrain Test</title>' +
    '<link rel="stylesheet" href="css/base.css">' +
    '<link rel="stylesheet" href="css/terrain.css">' +
    '<style>body{margin:0}.spacer-before{height:120px;background:#ddd}.spacer-after{height:400px;background:#eee}</style>' +
    '</head><body>' +
    '<div class="spacer-before"></div>' +
    section +
    '<div class="spacer-after"></div>' +
    '<pre id="results"></pre>' +
    driver +
    '</body></html>';

  fs.writeFileSync(path.join(ROOT, 'terrain-test.html'), page);
}

(async () => {
  if (!CHROME) { console.error('Chrome not found'); process.exit(1); }
  buildTestPage();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-first-run', '--disable-gpu']
  });

  let failures = 0;

  for (const width of VIEWPORTS) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewport({ width: width, height: Math.max(400, Math.round(width * 0.56)) });
    await page.goto('file:///' + path.join(ROOT, 'terrain-test.html').replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.waitForFunction(() => document.title === 'TEST-DONE', { timeout: 15000 })
      .catch(() => errors.push('driver did not finish (timeout)'));

    const raw = await page.evaluate(() => document.getElementById('results').textContent);
    const m = raw.match(/TERRAIN-TEST-START([\s\S]*?)TERRAIN-TEST-END/);
    const rows = m ? m[1].trim().split('\n') : [];
    const problems = [];

    if (!rows.length) {
      problems.push('no phase snapshots captured');
    } else {
      const parse = (r) => JSON.parse(r.slice(r.indexOf('{')));
      const first = parse(rows[0]);
      const last = parse(rows[rows.length - 1]);
      const mid = parse(rows[Math.floor(rows.length / 2)]);

      if (first.state !== 'ready') problems.push('motion not ready: ' + first.state);
      if (!first.ready) problems.push('data-motion-ready missing');
      if (!first.w1Transformed) problems.push('wordmark not driven at p=0');
      if (Number(parseFloat(first.wedgeW)) > 0) problems.push('wedge should be closed at p=0, got ' + first.wedgeW);
      if (parseFloat(mid.wedgeW) <= 0 && parseFloat(last.wedgeW) <= 0) problems.push('wedge never opened');
      if (!last.done) problems.push('data-done never set at p=1');
      if (!last.interactive) problems.push('cards never became interactive');
      if (last.railInert !== false) problems.push('rail still inert at end');
      if (first.featuredIdx !== 2) problems.push('featured card is not the middle card: ' + first.featuredIdx);
      const lastLabelOps = last.labelOp.split(',').map(Number);
      if (!lastLabelOps.every((o) => o > 0.95)) problems.push('labels not fully revealed: ' + last.labelOp);
      const lastVis = last.cardVis.split('|');
      if (!lastVis.every((v) => v === 'visible')) problems.push('cards not visible at end: ' + last.cardVis);
    }
    errors.forEach((e) => problems.push('page error: ' + e));

    console.log('\n=== ' + width + 'px ' + (problems.length ? 'FAIL' : 'PASS') + ' ===');
    rows.forEach((r) => console.log('  ' + r));
    problems.forEach((p) => { console.log('  !! ' + p); failures += 1; });

    await page.close();
  }

  await browser.close();
  console.log('\n' + (failures ? 'VERIFY FAILED: ' + failures + ' problem(s)' : 'VERIFY PASSED — all viewports OK'));
  process.exitCode = failures ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });

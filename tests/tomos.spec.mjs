/*
 * tomOS interaction proof. Serves ./dist on an ephemeral loopback port and
 * drives chromium through the W1-W8 acceptance interactions.
 *
 * Run (F43):  NODE_PATH=/home/sofia/.npm/_npx/e41f203b7505f1fb/node_modules \
 *             node tests/tomos.spec.mjs
 * Run (F44):  npx playwright -e ... (see run wrapper); needs `playwright` resolvable.
 *
 * NOT part of the site build. `playwright` is a dev-only tool, intentionally
 * not a project dependency.
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Resolve playwright (a dev-only tool, not a project dep). PW_DIR can point at a
// node_modules dir that contains it (e.g. an npx cache) for portability across boxes.
const require = createRequire(import.meta.url);
const extraPaths = (process.env.PW_DIR ? process.env.PW_DIR.split(':') : []).filter(Boolean);
const pwEntry = require.resolve('playwright', extraPaths.length ? { paths: extraPaths } : undefined);
const { chromium } = require(pwEntry);

const ROOT = process.env.DIST_DIR || join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml',
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    p = normalize(p).replace(/^(\.\.[/\\])+/, '');
    let fp = join(ROOT, p);
    try {
      const s = await stat(fp);
      if (s.isDirectory()) fp = join(fp, 'index.html');
    } catch { if (!extname(fp)) fp = join(fp, 'index.html'); }
    const body = await readFile(fp);
    res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

const results = [];
let failed = 0;
function check(name, cond, detail = '') {
  const ok = !!cond;
  if (!ok) failed++;
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ::  ' + detail : ''}`);
  console.log(results[results.length - 1]);
}
const approx = (a, b, tol = 3) => Math.abs(a - b) <= tol;

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}/`;
console.log(`serving dist on ${base}`);

const browser = await chromium.launch({ headless: true });
let exitCode = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

  await page.goto(base, { waitUntil: 'networkidle' });
  // Wait until the engine booted (a default window switched to display:flex).
  await page.waitForFunction(() => {
    const w = document.querySelector('.os-win[data-app="work"]');
    return w && getComputedStyle(w).display === 'flex';
  }, null, { timeout: 8000 });

  const rect = (sel) => page.evaluate((s) => {
    const el = document.querySelector(s); if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
  }, sel);
  const disp = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'MISSING'; }, sel);
  const hasClass = (sel, c) => page.evaluate(([s, cls]) => { const e = document.querySelector(s); return e ? e.classList.contains(cls) : false; }, [sel, c]);

  async function dragHandle(sel, dx, dy) {
    const b = await page.locator(sel).boundingBox();
    const sx = b.x + Math.min(b.width - 8, b.width / 2);
    const sy = b.y + b.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + dx / 2, sy + dy / 2, { steps: 4 });
    await page.mouse.move(sx + dx, sy + dy, { steps: 4 });
    await page.mouse.up();
  }

  // ---- A. layer split at desktop ----
  check('A1 desktop layer visible @1440', (await disp('.os-desktop')) === 'block', `display=${await disp('.os-desktop')}`);
  check('A2 editorial hidden @1440', (await disp('.editorial')) === 'none');
  check('A3 default window "work" visible', (await disp('.os-win[data-app="work"]')) === 'flex');

  // ---- B. drag ----
  const before = await rect('.os-win[data-app="work"]');
  await dragHandle('.os-win[data-app="work"] .os-titlebar', 160, 90);
  const after = await rect('.os-win[data-app="work"]');
  check('B drag moves window', approx(after.x - before.x, 160, 12) && approx(after.y - before.y, 90, 12),
    `dx=${(after.x - before.x).toFixed(0)} dy=${(after.y - before.y).toFixed(0)}`);

  // ---- C. minimize -> dock -> reopen ----
  await page.click('.os-win[data-app="work"] .os-light.os-min');
  check('C1 minimize hides window', (await disp('.os-win[data-app="work"]')) === 'none');
  check('C2 dock item not open while minimized', !(await hasClass('.os-dock-item[data-open="work"]', 'open')));
  await page.click('.os-dock-item[data-open="work"]');
  check('C3 dock click reopens', (await disp('.os-win[data-app="work"]')) === 'flex');
  check('C4 dock item open after reopen', await hasClass('.os-dock-item[data-open="work"]', 'open'));

  // ---- D. maximize fills canvas, restore exact prior geometry ----
  const pre = await rect('.os-win[data-app="work"]');
  const canvas = await rect('[data-os-canvas]');
  await page.click('.os-win[data-app="work"] .os-light.os-max');
  const maxed = await rect('.os-win[data-app="work"]');
  check('D1 maximize fills canvas width', approx(maxed.w, canvas.w, 4), `win=${maxed.w.toFixed(0)} canvas=${canvas.w.toFixed(0)}`);
  check('D2 maximize top below menubar (44)', approx(maxed.y, 44, 4), `top=${maxed.y.toFixed(0)}`);
  check('D3 maximize height = vh-44-72', approx(maxed.h, 900 - 44 - 72, 6), `h=${maxed.h.toFixed(0)}`);
  await page.click('.os-win[data-app="work"] .os-light.os-max');
  const restored = await rect('.os-win[data-app="work"]');
  check('D4 restore exact left', restored.left === pre.left, `${restored.left} vs ${pre.left}`);
  check('D5 restore exact top', restored.top === pre.top, `${restored.top} vs ${pre.top}`);
  check('D6 restore exact width', restored.width === pre.width, `${restored.width} vs ${pre.width}`);
  check('D7 restore exact height', restored.height === pre.height || approx(restored.h, pre.h, 3), `${restored.height} vs ${pre.height}`);
  // double-click titlebar toggles maximize (W2)
  const preDbl = await rect('.os-win[data-app="work"]');
  await page.dblclick('.os-win[data-app="work"] .os-titlebar', { position: { x: 200, y: 18 } });
  const dblMax = await rect('.os-win[data-app="work"]');
  check('D8 dblclick titlebar maximizes', approx(dblMax.w, canvas.w, 4), `w=${dblMax.w.toFixed(0)}`);
  await page.dblclick('.os-win[data-app="work"] .os-titlebar', { position: { x: 200, y: 18 } });
  const dblRestore = await rect('.os-win[data-app="work"]');
  check('D9 dblclick titlebar restores prior geometry', dblRestore.width === preDbl.width && dblRestore.left === preDbl.left, `${dblRestore.width}/${dblRestore.left} vs ${preDbl.width}/${preDbl.left}`);

  // ---- E. resize from SE corner + min clamp ----
  const rs0 = await rect('.os-win[data-app="work"]');
  await dragHandle('.os-win[data-app="work"] .os-resize-se', 120, 90);
  const rs1 = await rect('.os-win[data-app="work"]');
  check('E1 SE resize grows width', approx(rs1.w - rs0.w, 120, 14), `dw=${(rs1.w - rs0.w).toFixed(0)}`);
  check('E2 SE resize grows height', approx(rs1.h - rs0.h, 90, 14), `dh=${(rs1.h - rs0.h).toFixed(0)}`);
  await dragHandle('.os-win[data-app="work"] .os-resize-se', -3000, -3000);
  const rs2 = await rect('.os-win[data-app="work"]');
  check('E3 min-width clamp (>=280)', approx(rs2.w, 280, 2), `w=${rs2.w.toFixed(0)}`);
  check('E4 min-height clamp (>=160)', approx(rs2.h, 160, 2), `h=${rs2.h.toFixed(0)}`);

  // ---- F. close + reopen ----
  await page.click('.os-win[data-app="work"] .os-light.os-close');
  check('F1 close hides window', (await disp('.os-win[data-app="work"]')) === 'none');
  await page.click('.os-dock-item[data-open="work"]');
  check('F2 reopen after close', (await disp('.os-win[data-app="work"]')) === 'flex');

  // ---- G. Notes drill-down + Back ----
  await page.click('.os-dock-item[data-open="notes"]');
  check('G1 notes window opens', (await disp('.os-win[data-app="notes"]')) === 'flex');
  check('G2 root view visible at start', !(await page.locator('.os-win[data-app="notes"] [data-os-view="root"]').isHidden()));
  check('G3 back disabled at root', await page.locator('.os-win[data-app="notes"] [data-os-back]').isDisabled());
  await page.click('.os-win[data-app="notes"] .os-list-item');
  const childVisible = await page.evaluate(() => {
    const nav = document.querySelector('.os-win[data-app="notes"] [data-os-nav]');
    const views = [...nav.querySelectorAll('[data-os-view]')];
    const shown = views.filter((v) => !v.hidden);
    return { rootHidden: nav.querySelector('[data-os-view="root"]').hidden, shownCount: shown.length, shownName: shown[0]?.dataset.osView || '' };
  });
  check('G4 drill-in hides root, shows one child', childVisible.rootHidden && childVisible.shownCount === 1, JSON.stringify(childVisible));
  check('G5 back enabled in child', !(await page.locator('.os-win[data-app="notes"] [data-os-back]').isDisabled()));
  check('G6 crumb reflects depth', (await page.locator('.os-win[data-app="notes"] [data-os-crumb]').textContent()).trim().length > 0);
  await page.click('.os-win[data-app="notes"] [data-os-back]');
  check('G7 back returns to root list', !(await page.locator('.os-win[data-app="notes"] [data-os-view="root"]').isHidden()));
  check('G8 back disabled again at root', await page.locator('.os-win[data-app="notes"] [data-os-back]').isDisabled());

  // ---- J. keyboard operability + Esc (W8) ----
  await page.locator('.os-dock-item[data-open="cv"]').press('Enter');
  check('J1 keyboard Enter on dock opens window', (await disp('.os-win[data-app="cv"]')) === 'flex');
  check('J2 opened window is focused', await hasClass('.os-win[data-app="cv"]', 'focused'));
  await page.keyboard.press('Escape');
  check('J3 Esc closes focused window', (await disp('.os-win[data-app="cv"]')) === 'none');

  // ---- H. no console errors so far ----
  check('H console error-free during desktop run', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  // ---- I. mobile (480x880): editorial shows, tomOS hidden ----
  await page.setViewportSize({ width: 480, height: 880 });
  await page.waitForTimeout(120);
  check('I1 tomOS hidden @480', (await disp('.os-desktop')) === 'none', `display=${await disp('.os-desktop')}`);
  const edDisp = await disp('.editorial');
  const edBox = await rect('.editorial');
  check('I2 editorial visible @480', edDisp !== 'none' && edBox && edBox.h > 100, `display=${edDisp} h=${edBox?.h?.toFixed(0)}`);
  await ctx.close();

  // ---- K. reduced-motion gates all OS transitions (W8) ----
  const rmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rmPage = await rmCtx.newPage();
  await rmPage.goto(base, { waitUntil: 'networkidle' });
  await rmPage.waitForFunction(() => {
    const w = document.querySelector('.os-win[data-app="work"]');
    return w && getComputedStyle(w).display === 'flex';
  }, null, { timeout: 8000 });
  const rmDur = await rmPage.evaluate(() => getComputedStyle(document.querySelector('.os-win[data-app="work"]')).transitionDuration);
  check('K reduced-motion -> no window transition', rmDur === '0s' || /^0s(,\s*0s)*$/.test(rmDur), `transition-duration=${rmDur}`);
  await rmCtx.close();
} catch (err) {
  console.error('SUITE ERROR:', err);
  exitCode = 2;
} finally {
  await browser.close();
  server.close();
}

console.log('\n--- SUMMARY ---');
console.log(`${results.filter((r) => r.startsWith('PASS')).length} passed, ${failed} failed`);
process.exit(exitCode || (failed > 0 ? 1 : 0));

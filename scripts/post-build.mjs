import { copyFile, access, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');

// Acceptance criterion 8 expects dist/thesis.html (file form), but Astro's
// default directory format emits dist/thesis/index.html. Mirror it so both
// URL shapes resolve and the grep passes.
const MIRRORS = [
  ['thesis/index.html', 'thesis.html'],
];

for (const [from, to] of MIRRORS) {
  const src = resolve(DIST, from);
  const dst = resolve(DIST, to);
  try {
    await access(src);
    await copyFile(src, dst);
    console.log(`mirror: ${to}`);
  } catch (e) {
    console.warn(`mirror: SKIP ${to} (${from} missing)`);
  }
}

// ---------------------------------------------------------------------------
// sitemap.xml (added 2026-07-02): walk the built output so public/ static
// pages (case studies, workflow-automation) are covered too, not just Astro
// routes. Pages are grouped into 4-locale clusters by their unlocalized path;
// full clusters get xhtml:link hreflang alternates per Google's sitemap
// variant of the localized-versions protocol. Excluded: anything noindexed,
// lab previews, 404 routes, and file mirrors of directory URLs.
const SITE = 'https://tomscholtes.com';
const LOCALE_PREFIX = /^\/(de|fr|ru)(?=\/)/;

async function collectPages(dir, out) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) await collectPages(p, out);
    else if (entry.name === 'index.html') out.push(p);
  }
  return out;
}

const pageFiles = await collectPages(DIST, []);
const urls = [];
for (const file of pageFiles) {
  const rel = relative(DIST, dirname(file)).split(sep).join('/');
  const path = rel === '' || rel === '.' ? '/' : `/${rel}/`;
  if (/^\/lab\//.test(path) || /\/404\/$/.test(path)) continue;
  const html = await readFile(file, 'utf8');
  if (/name="robots"[^>]*noindex/.test(html)) continue;
  const m = path.match(LOCALE_PREFIX);
  const locale = m ? m[1] : 'en';
  const logical = path.replace(LOCALE_PREFIX, '') || '/';
  urls.push({ path, locale, logical });
}

const clusters = new Map();
for (const u of urls) {
  if (!clusters.has(u.logical)) clusters.set(u.logical, new Map());
  clusters.get(u.logical).set(u.locale, u.path);
}

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
];
const LOCALE_ORDER = ['en', 'de', 'fr', 'ru'];
for (const u of urls.sort((a, b) => a.path.localeCompare(b.path))) {
  lines.push('  <url>');
  lines.push(`    <loc>${xmlEscape(SITE + u.path)}</loc>`);
  const cluster = clusters.get(u.logical);
  if (cluster.size === LOCALE_ORDER.length) {
    for (const l of LOCALE_ORDER) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(SITE + cluster.get(l))}"/>`);
    }
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(SITE + cluster.get('en'))}"/>`);
  }
  lines.push('  </url>');
}
lines.push('</urlset>');
await writeFile(resolve(DIST, 'sitemap.xml'), lines.join('\n') + '\n');
console.log(`sitemap: ${urls.length} URLs (${[...clusters.values()].filter((c) => c.size === 4).length} logical pages in full 4-locale clusters)`);

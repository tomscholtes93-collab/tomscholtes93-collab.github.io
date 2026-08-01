#!/usr/bin/env node
// Pre-build hard gate for src/content/notes/**/*.md.
// Fails the build (exit 1) on:
//   - em-dash (U+2014) anywhere in any note
//   - any "leakage" name (Tom's personal blacklist)
//   - inline <script>, on*= handlers, or javascript: URLs (defense in depth)
//
// Runs as part of `npm run build`. Walks one level deep into locale
// subdirectories so post-subpage-i18n notes under en/ de/ fr/ ru/ are covered.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NOTES_DIR = 'src/content/notes';
const LOCALES = ['en', 'de', 'fr', 'ru'];
const EM_DASH = '—';
// Denylist stored base64-encoded so the plaintext names do not sit in the
// public repo source. Decoded at runtime; matching behavior is unchanged.
const LEAKAGE_NAMES = [
  'U29maWE=', 'QmVrem9kYQ==', 'VHJpdG9u', 'Y29tcG9zaXRlLWtleXM=',
  'SW52ZXN0cmFu', 'RGVhbHNwbHVz', 'THVrZQ==', 'Sm9ha2lt', 'QW5uYQ==', 'Q29ucmFk', 'QWRhbQ==',
].map((s) => Buffer.from(s, 'base64').toString('utf8'));
const HTML_RISK = /<\s*script|on\w+\s*=\s*["']|javascript:/i;

const errors = [];

function checkFile(path) {
  const content = readFileSync(path, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes(EM_DASH)) {
      errors.push({ path, line: idx + 1, kind: 'em-dash', snippet: line.trim().slice(0, 100) });
    }
    for (const name of LEAKAGE_NAMES) {
      const re = new RegExp(`\\b${name}\\b`, 'i');
      if (re.test(line)) {
        errors.push({ path, line: idx + 1, kind: `leakage:${name}`, snippet: line.trim().slice(0, 100) });
      }
    }
    if (HTML_RISK.test(line)) {
      errors.push({ path, line: idx + 1, kind: 'html-risk', snippet: line.trim().slice(0, 100) });
    }
  });
}

let files = [];
try {
  for (const top of readdirSync(NOTES_DIR)) {
    const topPath = join(NOTES_DIR, top);
    const topStat = statSync(topPath);
    if (topStat.isFile() && top.endsWith('.md')) {
      files.push(topPath);
    } else if (topStat.isDirectory() && LOCALES.includes(top)) {
      for (const f of readdirSync(topPath)) {
        const fPath = join(topPath, f);
        if (f.endsWith('.md') && statSync(fPath).isFile()) {
          files.push(fPath);
        }
      }
    }
  }
} catch (err) {
  console.error(`✗ check-notes: cannot read ${NOTES_DIR}: ${err.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.log('✓ check-notes: no .md files in src/content/notes/, nothing to check');
  process.exit(0);
}

files.forEach(checkFile);

/* TAG ALIGNMENT, added 2026-08-01 with the tag routes.
   =========================================================================
   /tags/<tag>/ keys every tag page by the ENGLISH tag and renders the local
   one as its label, because the tags in this corpus are translated per locale
   (`memory` / `gedächtnis` / `mémoire` / `память`). See src/lib/notes.ts for
   why the alternative, a non-ASCII URL segment per locale, was rejected.

   That mapping resolves a locale's tag to its English key BY ARRAY INDEX, so
   it is only correct while each essay's `tags` array is positionally parallel
   across the four locales. The Zod schema cannot express that: it validates
   each file alone. A translator adding a fourth tag to the German copy would
   silently mis-key every German tag page, on a host with no redirects to
   repair it with.

   So the invariant is a gate rather than a comment. Only PUBLISHED essays are
   checked, because a draft emits no route and therefore no tag page. */
function frontmatter(path) {
  const parts = readFileSync(path, 'utf8').split('---');
  return parts.length > 1 ? parts[1] : '';
}
function parseTags(fm) {
  const m = fm.match(/tags:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1].split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}

const enDir = join(NOTES_DIR, 'en');
let enSlugs = [];
try {
  enSlugs = readdirSync(enDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
} catch { /* no en/ directory: nothing to align */ }

let aligned = 0;
for (const slug of enSlugs) {
  const enPath = join(enDir, `${slug}.md`);
  const enFm = frontmatter(enPath);
  if (/status:\s*draft/.test(enFm)) continue;
  const enTags = parseTags(enFm);
  for (const locale of LOCALES.filter((l) => l !== 'en')) {
    const p = join(NOTES_DIR, locale, `${slug}.md`);
    let fm;
    try {
      fm = frontmatter(p);
    } catch {
      // A published essay with no translation is a separate concern; the
      // locale route simply will not emit it. Not this gate's business.
      continue;
    }
    if (/status:\s*draft/.test(fm)) continue;
    const tags = parseTags(fm);
    if (tags.length !== enTags.length) {
      errors.push({
        path: p,
        line: 1,
        kind: 'tag-misalignment',
        snippet: `${tags.length} tags [${tags.join(', ')}] against en's ${enTags.length} [${enTags.join(', ')}]. Tag pages are keyed by the English tag at the same index, so the arrays must be positionally parallel. See src/lib/notes.ts.`,
      });
    } else {
      aligned += 1;
    }
  }
}

if (errors.length > 0) {
  console.error(`\n✗ check-notes FAILED: ${errors.length} issue${errors.length === 1 ? '' : 's'} across ${files.length} note${files.length === 1 ? '' : 's'}\n`);
  errors.forEach((e) => {
    console.error(`  ${e.path}:${e.line}  [${e.kind}]`);
    console.error(`    ${e.snippet}`);
  });
  console.error(`\nFix the issues above, then re-run the build. See V5/NOTES_GUIDE.md for rule rationale.\n`);
  process.exit(1);
}

console.log(`✓ check-notes passed: ${files.length} notes checked, ${aligned} translation tag-arrays aligned, 0 issues`);

#!/usr/bin/env node
/* Guard published addresses against silent disappearance.
   ==========================================================================

   WHY THIS EXISTS. GitHub Pages serves no per-path 301. When a path stops
   being built here it does not redirect, it 404s, and every inbound link,
   bookmark, search result and citation pointing at it dies with no signal to
   anyone. `npm run build` already fails loudly on a missing translation key
   (check-i18n) and a malformed note (check-notes). Losing a published URL was
   the one failure of that class with no gate on it.

   WHAT IT FAILS ON, AND ONLY THIS: a path that `urls.lock` records as
   published is absent from the current build, and no declared successor for it
   is present either. That is the whole rule.

   WHAT IT DELIBERATELY DOES NOT DO:

     - It does not fire on ADDITIVE change. Publishing an essay adds four paths
       and removes none, so it passes silently and the lock does not need
       touching. A routine essay push is taxed by one file read and some set
       arithmetic. This matters more than the gate itself: a gate that makes
       ordinary work annoying gets deleted, and then it guards nothing.
     - It does not enforce that the lock is COMPLETE. New paths are reported as
       an informational line, never an error. Refreshing the lock is a
       deliberate act (`--update`), because a gate that rewrites its own
       expectations is a gate that agrees with whatever just happened.
     - It does not know about /lab/*, because the lock was seeded from the live
       sitemap and post-build.mjs already excludes /lab/ and anything carrying
       a noindex robots meta. The gate cannot enshrine a preview or a
       deliberately unindexed page, because it never learned about one.

   THE SUCCESSOR ESCAPE HATCH is honest about its own limits. On a host that
   could redirect, `"/old/": "/new/"` in `successors` would be a redirect rule.
   Here it cannot be: nothing makes /old/ serve /new/. It records that a
   removal was deliberate and says where the content went, so the gate stops
   failing and the reason survives in the file rather than in a commit message.
   A reader of the old URL still gets a 404. Removing an entry from `paths`
   outright is the other way, and it is equally deliberate; the difference is
   that a successor leaves a trail.

   Runs last in the build chain, after post-build.mjs writes dist/sitemap.xml. */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK = resolve(ROOT, 'urls.lock');
const DIST = resolve(ROOT, 'dist');
const SITEMAP = resolve(DIST, 'sitemap.xml');
const UPDATE = process.argv.includes('--update');

function fail(msg, detail = []) {
  console.error(`\n[ERROR] check-urls FAILED: ${msg}\n`);
  detail.forEach((d) => console.error(`  ${d}`));
  if (detail.length) {
    console.error('\n  If a removal was intentional, record it in urls.lock:');
    console.error('    - delete the path from "paths", or');
    console.error('    - add "<old>": "<new>" to "successors" and keep the trail.');
    console.error('  To accept the current build wholesale: node scripts/check-urls.mjs --update\n');
  }
  process.exit(1);
}

if (!existsSync(SITEMAP)) {
  fail('dist/sitemap.xml is missing. This runs after post-build.mjs; check the build chain order.');
}

/* The built path set. The sitemap is the right source rather than a directory
   walk: it is the same artifact search engines read, and post-build.mjs has
   already applied the /lab/ and noindex exclusions to it, so the two can never
   disagree about what "published" means. */
const sitemap = readFileSync(SITEMAP, 'utf8');
const built = new Set(
  [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter(Boolean),
);

/* Addresses the sitemap structurally cannot carry: it is built by walking for
   index.html, so a bare .html file is invisible to it. These are checked as
   files on disk instead. /projects/cv-onepager-artifact.html is one of them and
   is named explicitly in the constraint this gate implements. */
function extraPresent(p) {
  return existsSync(resolve(DIST, p.replace(/^\//, '')));
}

if (UPDATE) {
  const prev = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, 'utf8')) : {};
  const next = {
    _comment: prev._comment,
    updated: new Date().toISOString().slice(0, 10),
    paths: [...built].sort(),
    extra: (prev.extra ?? []).filter(extraPresent).sort(),
    successors: prev.successors ?? {},
  };
  writeFileSync(LOCK, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`urls.lock updated: ${next.paths.length} paths, ${next.extra.length} extra`);
  process.exit(0);
}

if (!existsSync(LOCK)) {
  fail('urls.lock is missing. Seed it with: node scripts/check-urls.mjs --update');
}

const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
const locked = lock.paths ?? [];
const extra = lock.extra ?? [];
const successors = lock.successors ?? {};

const lost = [];
for (const p of locked) {
  if (built.has(p)) continue;
  const s = successors[p];
  if (s && (built.has(s) || extraPresent(s))) continue;
  lost.push(s ? `${p} is gone and its declared successor ${s} is not built either` : `${p} was published and is no longer built`);
}
for (const p of extra) {
  if (extraPresent(p)) continue;
  const s = successors[p];
  if (s && (built.has(s) || extraPresent(s))) continue;
  lost.push(s ? `${p} is gone and its declared successor ${s} is not built either` : `${p} was published and is no longer built`);
}

if (lost.length) {
  fail(`${lost.length} published address(es) would stop serving`, lost);
}

/* Additive change is reported, never an error. The count is the useful part:
   it says "the lock is behind by N" without deciding what to do about it. */
const added = [...built].filter((p) => !locked.includes(p));
const suffix = added.length
  ? `, ${added.length} new path(s) not yet locked (${added.slice(0, 4).join(', ')}${added.length > 4 ? ', ...' : ''})`
  : '';
console.log(`✓ check-urls: ${locked.length} locked + ${extra.length} extra address(es) all still serving${suffix}`);

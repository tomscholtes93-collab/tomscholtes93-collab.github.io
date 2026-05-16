#!/usr/bin/env node
// Pre-build hard gate for src/content/notes/*.md.
// Fails the build (exit 1) on:
//   - em-dash (U+2014) anywhere in any note
//   - any "leakage" name (Tom's personal blacklist)
//
// Runs first in `npm run build`. Catches what NOTES_GUIDE.md asks for
// before astro build, before deploy, before regret.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NOTES_DIR = 'src/content/notes';
const EM_DASH = '—';
const LEAKAGE_NAMES = [
  'Sofia', 'Bekzoda', 'Triton', 'composite-keys',
  'Investran', 'Dealsplus', 'Luke', 'Joakim',
  'Anna', 'Conrad', 'Adam',
];

const errors = [];

function checkFile(path) {
  const content = readFileSync(path, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes(EM_DASH)) {
      errors.push({
        path,
        line: idx + 1,
        kind: 'em-dash',
        snippet: line.trim().slice(0, 100),
      });
    }
    for (const name of LEAKAGE_NAMES) {
      const re = new RegExp(`\\b${name}\\b`, 'i');
      if (re.test(line)) {
        errors.push({
          path,
          line: idx + 1,
          kind: `leakage:${name}`,
          snippet: line.trim().slice(0, 100),
        });
      }
    }
  });
}

let files;
try {
  files = readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(NOTES_DIR, f))
    .filter((p) => statSync(p).isFile());
} catch (err) {
  console.error(`✗ check-notes: cannot read ${NOTES_DIR}: ${err.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.log('✓ check-notes: no .md files in src/content/notes/, nothing to check');
  process.exit(0);
}

files.forEach(checkFile);

if (errors.length > 0) {
  console.error(`\n✗ check-notes FAILED: ${errors.length} issue${errors.length === 1 ? '' : 's'} across ${files.length} note${files.length === 1 ? '' : 's'}\n`);
  errors.forEach((e) => {
    console.error(`  ${e.path}:${e.line}  [${e.kind}]`);
    console.error(`    ${e.snippet}`);
  });
  console.error(`\nFix the issues above, then re-run the build. See V5/NOTES_GUIDE.md for rule rationale.\n`);
  process.exit(1);
}

console.log(`✓ check-notes passed: ${files.length} note${files.length === 1 ? '' : 's'} checked, 0 issues`);

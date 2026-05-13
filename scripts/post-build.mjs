import { copyFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
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

import { copyFile, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/fonts');
const NM = resolve(ROOT, 'node_modules');

const COPIES = [
  ['@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2', 'instrument-serif-regular.woff2'],
  ['@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2', 'instrument-serif-italic.woff2'],
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-400.woff2'],
  ['@fontsource/inter/files/inter-latin-500-normal.woff2', 'inter-500.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-600.woff2'],
  ['@fontsource/inter/files/inter-latin-700-normal.woff2', 'inter-700.woff2'],
  ['@fontsource/inter/files/inter-cyrillic-400-normal.woff2', 'inter-400-cyrl.woff2'],
  ['@fontsource/inter/files/inter-cyrillic-500-normal.woff2', 'inter-500-cyrl.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', 'jetbrains-mono-400.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', 'jetbrains-mono-500.woff2'],

  // Added 2026-08-01. All from @fontsource, which is already a dependency:
  // no network, no CDN, SIL OFL 1.1. NONE of these is preloaded, and a
  // browser fetches a @font-face file only when text actually matches it, so
  // an English reader downloads none of them except the italic, and only on a
  // page containing an <em>. The LCP budget is untouched.
  ['@fontsource/inter/files/inter-latin-400-italic.woff2', 'inter-400-italic.woff2'],       // real italics, not synthetic obliques
  ['@fontsource/inter/files/inter-cyrillic-400-italic.woff2', 'inter-400-italic-cyrl.woff2'],
  ['@fontsource/inter/files/inter-cyrillic-600-normal.woff2', 'inter-600-cyrl.woff2'],      // ru had no 600, so bold was synthetic
  ['@fontsource/inter/files/inter-cyrillic-700-normal.woff2', 'inter-700-cyrl.woff2'],
  ['@fontsource/inter/files/inter-latin-300-normal.woff2', 'inter-300.woff2'],              // the ru display voice
  ['@fontsource/inter/files/inter-cyrillic-300-normal.woff2', 'inter-300-cyrl.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-cyrillic-400-normal.woff2', 'jetbrains-mono-400-cyrl.woff2'],
];

await mkdir(OUT, { recursive: true });
for (const [src, dst] of COPIES) {
  const from = resolve(NM, src);
  const to = resolve(OUT, dst);
  try {
    await access(from);
    await copyFile(from, to);
    console.log(`fonts: ${dst}`);
  } catch (e) {
    console.warn(`fonts: SKIP ${dst} (${from} missing)`);
  }
}

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

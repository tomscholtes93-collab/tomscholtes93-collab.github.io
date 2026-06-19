// Bundles the Knuth-Plass justification client (src/lib/justify-client.js) into
// self-hosted ESM at public/js/justify.js, with per-language hyphenation pattern
// chunks code-split so each page only fetches the dictionary it needs.
// Runs as part of `npm run build`, before `astro build` copies public/ into dist/.
import { build } from 'esbuild';
import { rm, mkdir } from 'node:fs/promises';

const OUTDIR = 'public/js';

await rm(OUTDIR, { recursive: true, force: true }); // drop stale chunks
await mkdir(OUTDIR, { recursive: true });

await build({
  entryPoints: { justify: 'src/lib/justify-client.js' },
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  outdir: OUTDIR,
  entryNames: '[name]',        // -> public/js/justify.js (stable URL)
  chunkNames: 'jx-[hash]',     // -> public/js/jx-<hash>.js (language chunks)
  legalComments: 'none',
});

console.log('build-justify: wrote public/js/justify.js (+ language chunks)');

import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'public/og');
const OUT = resolve(OUT_DIR, 'default.png');

await mkdir(OUT_DIR, { recursive: true });

// The two accent marks below are hand-mirrored from tokens.css: an SVG built in
// node cannot read a custom property. The card is dark (#0E0E0C), so the row to
// mirror is [data-theme="dark"][data-accent="terracotta"], which is #E37B4F.
// The rule said #C4623A until 2026-08-01 and so disagreed with the italic line
// three rows down inside this same card. Resync by hand if that row moves.
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0E0E0C"/>
  <rect x="60" y="60" width="80" height="3" fill="#E37B4F"/>
  <text x="60" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="#F4EFE6">Tom Scholtes</text>
  <text x="60" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="#E37B4F" font-style="italic">Six years, quietly automated.</text>
  <text x="60" y="380" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#D6D1C7">Personal site, live CV, and a portfolio of automation work</text>
  <text x="60" y="416" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#D6D1C7">I've built inside my role.</text>
  <text x="60" y="560" font-family="Menlo, monospace" font-size="20" fill="#8E8B82">tomscholtes.com · Luxembourg fund services</text>
</svg>`);

await sharp(svg).png().toFile(OUT);
console.log('og: default.png');

// PNG fallbacks for the SVG favicon: Google wants a crawlable icon at a
// multiple of 48px, Safari wants apple-touch-icon. Same mark as favicon.svg.
const iconSvg = (size) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0E0E0C"/>
  <text x="32" y="46" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="42" font-weight="400" text-anchor="middle" fill="#F6F2EC">T</text>
</svg>`);

for (const [name, size] of [['favicon-48.png', 48], ['apple-touch-icon.png', 180]]) {
  await sharp(iconSvg(size)).png().toFile(resolve(ROOT, 'public', name));
  console.log(`og: ${name}`);
}

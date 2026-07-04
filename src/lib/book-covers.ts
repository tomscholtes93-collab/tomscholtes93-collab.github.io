import fs from 'node:fs';
import path from 'node:path';

// Build-time guard for self-hosted book covers. A cover may only render as
// an <img> if its file exists under public/ and is non-empty; otherwise the
// caller gets null and renders the spine placeholder, so a dead image can
// never ship in the built HTML.
export function resolveCover(cover: string | null): string | null {
  if (!cover) return null;
  try {
    const stat = fs.statSync(path.join(process.cwd(), 'public', cover));
    if (stat.size > 0) return cover;
  } catch {
    // fall through to the warning below
  }
  console.warn(`[reading] cover missing or empty, rendering spine fallback: ${cover}`);
  return null;
}

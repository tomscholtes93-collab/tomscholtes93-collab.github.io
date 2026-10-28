import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync } from 'node:fs';
import { extname, resolve } from 'node:path';

export const BASELINE = 'e635f7b4cbe195e6dcfc42a3b517cfcdd3ba9917';
const roots = ['src/', 'scripts/', 'test/', 'docs/', 'public/'];
const generated = ['public/js/', 'public/fonts/', 'public/og/'];
const configuration = new Set([
  'package.json',
  'package-lock.json',
  'astro.config.mjs',
  'tsconfig.json',
  'prettier.config.mjs',
  'eslint.config.mjs',
  'playwright.config.mjs',
]);
const formatted = new Set([
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.html',
  '.md',
  '.svg',
]);
const linted = new Set(['.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(`Quality scope could not enumerate Git paths (${args[0]}).`);
  }
  return result.stdout.split('\0').filter(Boolean);
}

function supported(path, kind) {
  return (
    (configuration.has(path) || roots.some((root) => path.startsWith(root))) &&
    !generated.some((root) => path.startsWith(root)) &&
    (kind === 'lint' ? linted : formatted).has(extname(path))
  );
}

export function qualityScope(kind, cwd = process.cwd()) {
  if (!['format', 'lint'].includes(kind)) throw new Error('Unknown quality scope.');
  git(['rev-parse', '--verify', `${BASELINE}^{commit}`], cwd);
  const changed = git(['diff', '--name-only', '-z', '--find-renames', BASELINE, '--'], cwd);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'], cwd);
  const ignored = git(
    [
      'ls-files',
      '--others',
      '--ignored',
      '--exclude-standard',
      '-z',
      '--',
      'src',
      'scripts',
      'test',
      'docs',
      'public',
    ],
    cwd,
  );
  const bypasses = ignored.filter((path) => supported(path, kind));
  if (bypasses.length)
    throw new Error(
      `Ignored first-party files bypass the quality scope: ${JSON.stringify(bypasses)}`,
    );
  const files = [];
  const deleted = [];
  for (const path of [...new Set([...changed, ...untracked])].sort()) {
    if (!supported(path, kind)) continue;
    const absolute = resolve(cwd, path);
    if (!existsSync(absolute)) {
      deleted.push(path);
      continue;
    }
    const stat = lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink())
      throw new Error(`Unsupported quality input: ${JSON.stringify(path)}`);
    files.push(path);
  }
  return { baseline: BASELINE, files, deleted };
}

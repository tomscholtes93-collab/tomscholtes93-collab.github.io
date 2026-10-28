import { spawnSync } from 'node:child_process';
import { lstatSync, realpathSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

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
const linted = new Set(['.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(`Quality scope could not enumerate Git paths (${args[0]}).`);
  }
  return result.stdout.split('\0').filter(Boolean);
}

export async function qualityScope(kind, cwd = process.cwd()) {
  if (!['format', 'lint'].includes(kind)) throw new Error('Unknown quality scope.');
  git(['rev-parse', '--verify', `${BASELINE}^{commit}`], cwd);
  const extensions = new Set(linted);
  const filenames = new Set();
  if (kind === 'format') {
    const prettier = await import('prettier');
    const support = await prettier.getSupportInfo({ plugins: ['prettier-plugin-astro'] });
    for (const language of support.languages) {
      for (const extension of language.extensions ?? []) extensions.add(extension);
      for (const filename of language.filenames ?? []) filenames.add(filename);
    }
    extensions.add('.svg'); // The locked config assigns the HTML parser.
  }
  const supported = (path) =>
    (configuration.has(path) || roots.some((root) => path.startsWith(root))) &&
    !generated.some((root) => path.startsWith(root)) &&
    (extensions.has(extname(path)) || filenames.has(basename(path)));

  // These are separate inventories: index/worktree changes can cancel a
  // committed change without making the path safe to omit from checking.
  const committed = git(['diff', '--name-only', '-z', '--no-renames', BASELINE, 'HEAD', '--'], cwd);
  const staged = git(['diff', '--cached', '--name-only', '-z', '--no-renames', '--'], cwd);
  const unstaged = git(['diff', '--name-only', '-z', '--no-renames', '--'], cwd);
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
  const bypasses = ignored.filter(supported);
  if (bypasses.length)
    throw new Error(
      `Ignored first-party files bypass the quality scope: ${JSON.stringify(bypasses)}`,
    );
  const files = [];
  const deleted = [];
  for (const path of [...new Set([...committed, ...staged, ...unstaged, ...untracked])].sort()) {
    if (!supported(path)) continue;
    const absolute = resolve(cwd, path);
    let stat;
    try {
      stat = lstatSync(absolute, { throwIfNoEntry: false });
    } catch (error) {
      throw new Error(
        `Cannot inspect quality input ${JSON.stringify(path)} (${error.code ?? 'filesystem error'}).`,
        { cause: error },
      );
    }
    if (stat === undefined) {
      deleted.push(path);
      continue;
    }
    if (stat.isSymbolicLink() || !stat.isFile() || realpathSync(absolute) !== absolute) {
      throw new Error(`Unsupported quality input: ${JSON.stringify(path)}`);
    }
    files.push(path);
  }
  return { baseline: BASELINE, files, deleted };
}

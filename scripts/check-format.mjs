import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { qualityScope } from './quality-scope.mjs';

try {
  const prettier = await import('prettier');
  const scope = await qualityScope('format');
  console.log(`format scope: ${JSON.stringify(scope)}`);
  const ignorePath = ['.gitignore', '.prettierignore'].filter(existsSync);
  for (const path of scope.files) {
    const info = await prettier.getFileInfo(path, {
      ignorePath,
      plugins: ['prettier-plugin-astro'],
    });
    if (info.ignored || (!info.inferredParser && !path.endsWith('.svg'))) {
      throw new Error(`Formatter would ignore an assigned file: ${JSON.stringify(path)}`);
    }
  }
  if (scope.files.length) {
    const cli = resolve('node_modules/prettier/bin/prettier.cjs');
    if (!existsSync(cli)) throw new Error('Install the locked Prettier tool before checking.');
    const result = spawnSync(
      process.execPath,
      [cli, '--check', '--plugin', 'prettier-plugin-astro', '--', ...scope.files],
      { stdio: 'inherit' },
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
} catch (error) {
  console.error(`format failed: ${error.message}`);
  process.exitCode = 1;
}

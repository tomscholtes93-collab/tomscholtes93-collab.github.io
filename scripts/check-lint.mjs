import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { qualityScope } from './quality-scope.mjs';

try {
  const { ESLint } = await import('eslint');
  const scope = await qualityScope('lint');
  console.log(`lint scope: ${JSON.stringify(scope)}`);
  const eslint = new ESLint();
  for (const path of scope.files) {
    if (await eslint.isPathIgnored(path))
      throw new Error(`Linter would ignore an assigned file: ${JSON.stringify(path)}`);
    if (!(await eslint.calculateConfigForFile(path)))
      throw new Error(`No lint configuration for ${JSON.stringify(path)}.`);
  }
  if (scope.files.length) {
    const cli = resolve('node_modules/eslint/bin/eslint.js');
    if (!existsSync(cli)) throw new Error('Install the locked ESLint tool before checking.');
    const result = spawnSync(process.execPath, [cli, '--max-warnings=0', '--', ...scope.files], {
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
} catch (error) {
  console.error(`lint failed: ${error.message}`);
  process.exitCode = 1;
}

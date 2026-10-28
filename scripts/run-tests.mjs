import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const suites = ['quality', 'smoke', 'site', 'live-content', 'publication', 'report'];
try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--suite' || !suites.includes(args[1]))) {
    throw new Error('Use --suite with a documented suite name.');
  }
  const requested = args.length ? [args[1]] : suites.filter((name) => existsSync(`test/${name}`));
  const files = [];
  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error('Test discovery does not follow symlinks.');
      if (entry.isDirectory()) collect(path);
      else if (entry.isFile() && /\.(test|spec)\.mjs$/.test(path)) files.push(path);
    }
  }
  for (const name of requested) {
    const before = files.length;
    collect(`test/${name}`);
    if (files.length === before) throw new Error(`Test suite ${name} is empty.`);
  }
  if (!files.length) throw new Error('No test suites are installed.');
  for (const file of files) {
    const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', file], {
      encoding: 'utf8',
    });
    if (tracked.error || tracked.status !== 0)
      throw new Error(`Acceptance test must be tracked: ${file}`);
  }
  const groups = [
    [
      'Node',
      [
        process.execPath,
        [
          '--test',
          ...files.filter((file) => file.endsWith('.test.mjs')).map((file) => resolve(file)),
        ],
      ],
    ],
    [
      'Playwright',
      [
        process.execPath,
        [
          resolve('node_modules/@playwright/test/cli.js'),
          'test',
          ...files.filter((file) => file.endsWith('.spec.mjs')),
        ],
      ],
    ],
  ];
  for (const [name, [command, argv]] of groups) {
    const count = files.filter((file) =>
      file.endsWith(name === 'Node' ? '.test.mjs' : '.spec.mjs'),
    ).length;
    if (!count) continue;
    if (name === 'Playwright' && !existsSync(argv[0]))
      throw new Error('Install the locked Playwright tool before testing.');
    console.log(`${name}: ${count} tracked test files`);
    const result = spawnSync(command, argv, { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1;
      break;
    }
  }
} catch (error) {
  console.error(`tests failed: ${error.message}`);
  process.exitCode = 1;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  rmSync,
  renameSync,
  symlinkSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { BASELINE, qualityScope } from '../../scripts/quality-scope.mjs';

const source = resolve('.');
function git(directory, args) {
  const result = spawnSync('git', ['-C', directory, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
function fixture(action) {
  const directory = mkdtempSync(join(tmpdir(), 'tomscholtes-scope-'));
  try {
    git(directory, ['clone', '--quiet', '--shared', '--no-checkout', source, '.']);
    git(directory, ['checkout', '--quiet', '--detach', BASELINE]);
    return action(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('scope covers committed, staged, unstaged and untracked application changes safely', () =>
  fixture((directory) => {
    mkdirSync(join(directory, 'src/quality-fixture'));
    const committed = 'src/quality-fixture/committed.js';
    writeFileSync(join(directory, committed), 'export const committed = 1;\n');
    git(directory, ['add', '--', committed]);
    git(directory, [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    ]);
    const staged = 'src/quality-fixture/staged.js';
    writeFileSync(join(directory, staged), 'export const staged = 1;\n');
    git(directory, ['add', '--', staged]);
    appendFileSync(join(directory, 'src/lib/notes.ts'), '\n// fixture change\n');
    const unusual = 'src/quality-fixture/--safe;$(touch SHOULD_NOT_EXIST)\n.js';
    writeFileSync(join(directory, unusual), 'export const untracked = 1;\n');
    const result = qualityScope('lint', directory);
    for (const path of [committed, staged, 'src/lib/notes.ts', unusual])
      assert.ok(result.files.includes(path), path);
    assert.ok(!result.files.includes('src/components/Nav.astro'), 'untouched legacy file excluded');
  }));

test('scope retains rename destinations and reports deletions', () =>
  fixture((directory) => {
    renameSync(
      join(directory, 'src/content/headlines.ts'),
      join(directory, 'src/content/headline-copy.ts'),
    );
    rmSync(join(directory, 'src/content/now.ts'));
    git(directory, ['add', '-A', '--', 'src/content']);
    const result = qualityScope('format', directory);
    assert.ok(result.files.includes('src/content/headline-copy.ts'));
    assert.ok(result.deleted.includes('src/content/now.ts'));
  }));

test('ignored first-party additions cannot bypass checking', () =>
  fixture((directory) => {
    appendFileSync(join(directory, '.gitignore'), '\nsrc/ignored-probe.js\n');
    writeFileSync(join(directory, 'src/ignored-probe.js'), 'invalid fixture\n');
    assert.throws(() => qualityScope('format', directory), /bypass/);
  }));

test('enumeration errors fail closed', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tomscholtes-not-git-'));
  try {
    assert.throws(() => qualityScope('format', directory), /enumerate/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('formatter rejects a changed file hidden by its own ignore rules', () =>
  fixture((directory) => {
    symlinkSync(join(source, 'node_modules'), join(directory, 'node_modules'), 'dir');
    writeFileSync(join(directory, '.prettierignore'), 'src/format-probe.js\n');
    writeFileSync(join(directory, 'src/format-probe.js'), 'export const probe=1;\n');
    const result = spawnSync(process.execPath, [join(source, 'scripts/check-format.mjs')], {
      cwd: directory,
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Formatter would ignore/);
  }));

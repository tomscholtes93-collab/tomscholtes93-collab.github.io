import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  rmSync,
  chmodSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

test('quality gate preserves order and stops on the actual failing exit code', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tomscholtes-gate-'));
  try {
    mkdirSync(join(directory, 'scripts'));
    mkdirSync(join(directory, 'bin'));
    copyFileSync(resolve('scripts/quality-gate.sh'), join(directory, 'scripts/quality-gate.sh'));
    for (const name of ['format', 'lint']) {
      writeFileSync(
        join(directory, `scripts/check-${name}.mjs`),
        `import {appendFileSync} from 'node:fs';appendFileSync('steps',${JSON.stringify(name + '\n')});\n`,
      );
    }
    writeFileSync(join(directory, 'bin/npx'), '#!/bin/sh\necho types >> steps\nexit 7\n');
    writeFileSync(join(directory, 'bin/npm'), '#!/bin/sh\necho unexpected >> steps\nexit 0\n');
    chmodSync(join(directory, 'bin/npx'), 0o700);
    chmodSync(join(directory, 'bin/npm'), 0o700);
    const result = spawnSync('bash', ['scripts/quality-gate.sh'], {
      cwd: directory,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${directory}/bin:${process.env.PATH}` },
    });
    assert.equal(result.status, 7, result.stderr);
    assert.equal(readFileSync(join(directory, 'steps'), 'utf8'), 'format\nlint\ntypes\n');
    writeFileSync(join(directory, 'steps'), '');
    writeFileSync(join(directory, 'bin/npx'), '#!/bin/sh\necho types >> steps\nexit 0\n');
    writeFileSync(join(directory, 'bin/npm'), '#!/bin/sh\necho "npm $*" >> steps\nexit 0\n');
    const success = spawnSync('bash', ['scripts/quality-gate.sh'], {
      cwd: directory,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${directory}/bin:${process.env.PATH}` },
    });
    assert.equal(success.status, 0, success.stderr);
    assert.equal(
      readFileSync(join(directory, 'steps'), 'utf8'),
      'format\nlint\ntypes\nnpm run build\nnpm test --silent\nnpm audit --audit-level=high --include=dev --include=optional --include=peer\n',
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('test command refuses missing and empty requested suites', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tomscholtes-tests-'));
  try {
    mkdirSync(join(directory, 'test/smoke'), { recursive: true });
    const result = spawnSync(
      process.execPath,
      [resolve('scripts/run-tests.mjs'), '--suite', 'smoke'],
      { cwd: directory, encoding: 'utf8' },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /empty/);
    const missing = spawnSync(
      process.execPath,
      [resolve('scripts/run-tests.mjs'), '--suite', 'report'],
      { cwd: directory, encoding: 'utf8' },
    );
    assert.notEqual(missing.status, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('quality adapters fail when locked tools are absent', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tomscholtes-missing-tools-'));
  try {
    mkdirSync(join(directory, 'scripts'));
    writeFileSync(join(directory, 'package.json'), '{"type":"module"}');
    for (const name of ['quality-scope', 'check-format', 'check-lint']) {
      copyFileSync(resolve(`scripts/${name}.mjs`), join(directory, `scripts/${name}.mjs`));
    }
    for (const name of ['format', 'lint']) {
      const result = spawnSync(process.execPath, [`scripts/check-${name}.mjs`], {
        cwd: directory,
        encoding: 'utf8',
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Cannot find package|Install the locked/);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

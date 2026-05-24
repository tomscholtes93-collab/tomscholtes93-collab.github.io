#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const I18N_DIR = 'src/i18n';
const LOCALES = ['en', 'de', 'fr', 'ru'];
const NON_DEFAULT = ['de', 'fr', 'ru'];
const EM_DASH = '—';
const LEAKAGE = [
  'U29maWE=', 'QmVrem9kYQ==', 'VHJpdG9u', 'Y29tcG9zaXRlLWtleXM=',
  'SW52ZXN0cmFu', 'RGVhbHNwbHVz', 'THVrZQ==', 'Sm9ha2lt', 'QW5uYQ==', 'Q29ucmFk', 'QWRhbQ==',
];

function loadDict(locale) {
  const raw = readFileSync(`${I18N_DIR}/${locale}.json`, 'utf8');
  const head = raw.charCodeAt(0);
  if (head === 0xFEFF) throw new Error(`BOM at start of ${locale}.json`);
  const obj = JSON.parse(raw);
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== 'string') {
      throw new Error(`Non-string value at ${locale}: ${k}`);
    }
  }
  return obj;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function placeholdersOf(value) {
  return value.match(/\{[a-zA-Z0-9_]+\}/g) ?? [];
}

const errors = [];
const dicts = {};
for (const l of LOCALES) dicts[l] = loadDict(l);

const en = dicts.en;
const enKeys = Object.keys(en).sort();
const enKeySet = new Set(enKeys);

for (const locale of NON_DEFAULT) {
  const dict = dicts[locale];
  const dictKeys = new Set(Object.keys(dict));
  for (const k of enKeys) {
    if (!dictKeys.has(k)) errors.push(`missing ${locale}: ${k}`);
  }
  for (const k of dictKeys) {
    if (!enKeySet.has(k)) errors.push(`extra ${locale}: ${k}`);
  }
  for (const k of enKeys) {
    if (!dictKeys.has(k)) continue;
    const enVal = String(en[k]);
    const val = String(dict[k]);
    for (const ph of placeholdersOf(enVal)) {
      if (!val.includes(ph)) {
        errors.push(`placeholder drift ${locale}: ${k} missing ${ph}`);
      }
    }
    if (val.includes(EM_DASH)) errors.push(`em-dash ${locale}: ${k}`);
    for (const name of LEAKAGE) {
      const re = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
      if (re.test(val)) errors.push(`leakage ${locale}: ${k} contains "${name}"`);
    }
    if (/<\s*script|on\w+\s*=\s*["']|javascript:/i.test(val)) {
      errors.push(`html risk ${locale}: ${k}`);
    }
  }
}

for (const k of enKeys) {
  const val = String(en[k]);
  if (val.includes(EM_DASH)) errors.push(`em-dash en: ${k}`);
  for (const name of LEAKAGE) {
    const re = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
    if (re.test(val)) errors.push(`leakage en: ${k} contains "${name}"`);
  }
  if (/<\s*script|on\w+\s*=\s*["']|javascript:/i.test(val)) {
    errors.push(`html risk en: ${k}`);
  }
}

if (errors.length) {
  console.error(`\n[ERROR] check-i18n FAILED: ${errors.length} issue(s)\n`);
  errors.slice(0, 100).forEach((e) => console.error(`  ${e}`));
  if (errors.length > 100) console.error(`  ... and ${errors.length - 100} more`);
  process.exit(1);
}
console.log(`✓ check-i18n: ${enKeys.length} keys × ${LOCALES.length} locales, key-parity + placeholders + em-dash + leakage all clean`);

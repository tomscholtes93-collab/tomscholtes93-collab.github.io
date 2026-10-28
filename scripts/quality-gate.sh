#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
echo 'quality: format'
node scripts/check-format.mjs
echo 'quality: lint'
node scripts/check-lint.mjs
echo 'quality: types'
npx --no-install astro check
echo 'quality: test'
npm run build
npm test --silent
echo 'quality: audit'
npm audit --audit-level=high --include=dev --include=optional --include=peer

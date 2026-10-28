import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.mjs',
  outputDir: process.env.G183_BROWSER_OUTPUT || mkdtempSync(join(tmpdir(), 'tomscholtes-browser-')),
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4327',
    headless: true,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --host 127.0.0.1 --port 4327',
    url: 'http://127.0.0.1:4327',
    reuseExistingServer: false,
    timeout: 60000,
  },
});

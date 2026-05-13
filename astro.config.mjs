import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://tomscholtes.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  integrations: [react()],
  vite: {
    build: { cssCodeSplit: true, target: 'es2022' },
  },
});

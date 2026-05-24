import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://tomscholtes.com',
  output: 'static',
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  integrations: [react()],
  vite: {
    build: { cssCodeSplit: true, target: 'es2022' },
  },
});

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { rehypeNoteParagraphAnchors } from './src/lib/rehype-note-paragraph-anchors.mjs';

export default defineConfig({
  // Per-paragraph addresses on the essays, so a reader replying can cite an
  // exact passage. Build time rather than runtime so a shared #p12 link
  // resolves with JavaScript off. See the plugin for why it appends rather
  // than prepends. No-op on any file outside src/content/notes/<locale>/.
  markdown: {
    rehypePlugins: [rehypeNoteParagraphAnchors],
  },
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

/* /rss.xml : the English feed.
   Created 2026-08-01 (amendment 1). No feed existed anywhere on this site
   before; /rss.xml, /feed.xml, /atom.xml, /rss and /feed all returned 404
   (verified live). Amendment 1 said "if the previous series did not actually
   ship a feed, ship one now" and it did not.

   Four files, one per locale, because a static endpoint has no locale to
   derive: unlike a page there is no Astro.currentLocale to read, so the locale
   is a literal here. Everything else lives in src/lib/rss.ts. */
import type { APIRoute } from 'astro';
import { buildRssFeed } from '../lib/rss';
import { publishedNotes } from '../lib/notes';
import { t } from '../i18n';

export const GET: APIRoute = async ({ site }) => {
  const locale = 'en' as const;
  const body = buildRssFeed({
    locale,
    site: site ?? new URL('https://tomscholtes.com'),
    title: t('meta.notes.index.title', locale),
    description: t('meta.notes.index.description', locale),
    entries: await publishedNotes(locale),
  });
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};

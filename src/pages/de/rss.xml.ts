/* /de/rss.xml : the de feed. See src/pages/rss.xml.ts for why the locale is a
   literal rather than derived. */
import type { APIRoute } from 'astro';
import { buildRssFeed } from '../../lib/rss';
import { publishedNotes } from '../../lib/notes';
import { t } from '../../i18n';

export const GET: APIRoute = async ({ site }) => {
  const locale = 'de' as const;
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

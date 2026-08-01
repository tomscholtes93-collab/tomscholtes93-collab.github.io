/* RSS 2.0, hand-built.
   ==========================================================================

   NO NEW DEPENDENCY, deliberately. @astrojs/rss would do this, and it is one
   more package on a build that deploys straight to production with no human
   review step. RSS 2.0 is a frozen 2003 format, the feed needs six elements per
   item, and the only thing that can go subtly wrong is escaping, which is
   forty lines away and testable. The same series that had to add `sharp`
   because an undeclared dependency was load-bearing is not the place to add a
   declared one it does not need.

   lastBuildDate is the NEWEST ESSAY'S publishDate, not `new Date()`. A build
   clock would make the file differ on every build, so a reader's aggregator
   would see the feed change when nothing had been published, and every commit
   would carry a spurious diff. The newest publication date is both
   deterministic and the true answer to what the channel is asking.

   Summaries only, no full content. The summary is already the essay's own
   abstract, it is already translated, and a full-text feed would put 6000-word
   essays into every poll.

   ESCAPING IS THE ONE REAL RISK, so it is one function used on every value.
   Ampersand first, or it would double-escape the entities the later
   replacements introduce. */

import type { Note } from './notes';
import { noteSlug } from './notes';
import { localizePath, type Locale } from '../i18n';

const RSS_LANG: Record<Locale, string> = {
  en: 'en-GB', de: 'de-DE', fr: 'fr-FR', ru: 'ru-RU',
};

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 822, which is what RSS 2.0 pubDate requires. toUTCString emits
    "Fri, 16 May 2026 00:00:00 GMT", a valid RFC 822 date-time. */
function rfc822(d: Date): string {
  return d.toUTCString();
}

export interface FeedOptions {
  locale: Locale;
  /** Absolute site origin, from Astro.site. */
  site: URL;
  title: string;
  description: string;
  /** Published essays for this locale, newest first. */
  entries: Note[];
}

export function buildRssFeed({ locale, site, title, description, entries }: FeedOptions): string {
  const abs = (path: string) => new URL(localizePath(path, locale), site).toString();
  const selfHref = abs('/rss.xml');
  const channelLink = abs('/notes/');
  const newest = entries[0]?.data.publishDate;

  const items = entries.map((entry) => {
    const url = abs(`/notes/${noteSlug(entry)}/`);
    const cats = entry.data.tags
      .map((tag) => `      <category>${xmlEscape(tag)}</category>`)
      .join('\n');
    return [
      '    <item>',
      `      <title>${xmlEscape(entry.data.title)}</title>`,
      `      <link>${xmlEscape(url)}</link>`,
      // isPermaLink="true" because the link IS the identity here: essays do not
      // change address, which is the constraint the whole site is built under.
      `      <guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      `      <pubDate>${rfc822(entry.data.publishDate)}</pubDate>`,
      `      <description>${xmlEscape(entry.data.summary)}</description>`,
      cats,
      '    </item>',
    ].filter(Boolean).join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xmlEscape(title)}</title>`,
    `    <link>${xmlEscape(channelLink)}</link>`,
    `    <description>${xmlEscape(description)}</description>`,
    `    <language>${RSS_LANG[locale]}</language>`,
    `    <atom:link href="${xmlEscape(selfHref)}" rel="self" type="application/rss+xml"/>`,
    ...(newest ? [`    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

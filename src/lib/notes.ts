/* Shared queries over the notes collection.
   ==========================================================================

   Every route added by amendment 1 goes through here, so "published" means one
   thing in one place for the tag pages, the archive and the feeds. It is NOT
   yet the site's single status filter: `data.status === 'published' && slug
   .startsWith('<locale>/')` is still written out longhand in 13 places under
   src/pages (`index.astro`, the four `notes/index.astro`, and two each in the
   four `notes/[slug].astro`). Migrating those is open work. Until it is done,
   changing the definition of "published" here changes half the site, so change
   both or neither.

   TAG IDENTITY IS THE ENGLISH TAG. Display is the local one.

   The tags in this corpus are TRANSLATED per locale: the essay tagged `memory`
   in English is `gedächtnis` in German, `mémoire` in French and `память` in
   Russian. Amendment 1 assumed they were a single lowercase-kebab ASCII set and
   they are not, so a naive `/tags/<tag>/` would have produced four disjoint tag
   namespaces and, worse, non-ASCII URL path segments: percent-encoding in the
   sitemap (post-build.mjs XML-escapes but does not URL-escape), NFC against NFD
   normalization of `ä`, and case folding of Cyrillic, all on a host with no
   redirects to repair a mistake with.

   So the tag URL is keyed by the ENGLISH tag at the same array index, and the
   label rendered is the locale's own string. `/de/tags/memory/` displays
   "Gedächtnis". One tag, one address per locale, four localized presentations,
   zero non-ASCII paths. Same shape as the giscus thread key, for the same
   reason: one identity, localized presentation.

   THIS DEPENDS ON A DATA INVARIANT: each essay's `tags` array is positionally
   parallel across the four locales. Verified true for all 7 published essays
   (3 tags each, 4 locales) on 2026-08-01. Nothing in the Zod schema enforces
   it, since Zod validates each file alone.

   HOW MUCH OF THAT IS ACTUALLY ENFORCED, precisely: scripts/check-notes.mjs
   fails the build when a locale's tag COUNT differs from English. Arity only.
   A translator who adds or drops a tag is caught. A translator who REORDERS
   two tags without changing the count is NOT caught, and silently re-keys that
   locale's tag pages: the address stays valid and returns 200, the label on it
   is simply wrong. Reordering for natural reading order is a normal thing for
   a translator to do, so treat the ordering half as a CONVENTION that a human
   has to respect, not as a guarantee the build gives you.

   Closing it properly needs a canonical en-tag to locale-label dictionary for
   the gate to compare against. That is a design change, deliberately not made
   inside amendment 1. Recorded in docs/DECISIONS.md. */

import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

export type Note = CollectionEntry<'notes'>;

/** The unlocalized slug: the collection id with its locale directory removed. */
export function noteSlug(entry: Note): string {
  return entry.slug.replace(/^(en|de|fr|ru)\//, '');
}

/** Published essays for one locale, newest first. THE status filter. A draft
    must never reach a feed, a tag page, an archive or a count. */
export async function publishedNotes(locale: Locale): Promise<Note[]> {
  const entries = await getCollection(
    'notes',
    ({ data, slug }) => data.status === 'published' && slug.startsWith(`${locale}/`),
  );
  return entries.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export interface TagGroup {
  /** The English tag. This is the URL segment and the stable identity. */
  key: string;
  /** The tag as written in THIS locale. Equals key in the en locale. */
  label: string;
  /** Published essays of this locale carrying the tag, newest first. */
  entries: Note[];
}

/** Tag groups for one locale, keyed by English tag, sorted by descending count
    then by key so the order is stable across builds. */
export async function tagGroups(locale: Locale): Promise<TagGroup[]> {
  const [notes, en] = await Promise.all([publishedNotes(locale), publishedNotes('en')]);
  // English tags by slug, so a locale entry can resolve its own tag's key by
  // the index it sits at.
  const enTagsBySlug = new Map(en.map((e) => [noteSlug(e), e.data.tags]));

  const groups = new Map<string, TagGroup>();
  for (const entry of notes) {
    const enTags = enTagsBySlug.get(noteSlug(entry)) ?? entry.data.tags;
    entry.data.tags.forEach((label, i) => {
      const key = enTags[i] ?? label;
      const g = groups.get(key) ?? { key, label, entries: [] };
      g.entries.push(entry);
      groups.set(key, g);
    });
  }
  return [...groups.values()].sort(
    (a, b) => b.entries.length - a.entries.length || a.key.localeCompare(b.key),
  );
}

/** One tag group, or undefined when the key is not used in this locale. */
export async function tagGroup(locale: Locale, key: string): Promise<TagGroup | undefined> {
  return (await tagGroups(locale)).find((g) => g.key === key);
}

/** Every English tag key used by any published essay. The route set is
    identical across locales because the tag arrays are positionally parallel,
    which is what check-notes.mjs enforces. */
export async function allTagKeys(): Promise<string[]> {
  return (await tagGroups('en')).map((g) => g.key).sort();
}

export interface ArchiveMonth {
  /** Sortable key, YYYY-MM. */
  key: string;
  year: number;
  /** 1-indexed, for Intl month formatting. */
  month: number;
  entries: Note[];
}

/** Published essays grouped by calendar month, newest month first, newest
    essay first inside each month. */
export async function archiveMonths(locale: Locale): Promise<ArchiveMonth[]> {
  const notes = await publishedNotes(locale);
  const months = new Map<string, ArchiveMonth>();
  for (const entry of notes) {
    const d = entry.data.publishDate;
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const m = months.get(key) ?? { key, year, month, entries: [] };
    m.entries.push(entry);
    months.set(key, m);
  }
  return [...months.values()].sort((a, b) => b.key.localeCompare(a.key));
}

/** Russian needs three plural forms and the other three locales need two. The
    rules are the standard ones for ru; kept here rather than reaching for
    Intl.PluralRules so the caller gets a dictionary KEY it can pass to t(). */
export function pluralKey(base: string, n: number, locale: Locale): string {
  if (locale === 'ru') {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return `${base}.one`;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${base}.few`;
    return `${base}.many`;
  }
  return n === 1 ? `${base}.one` : `${base}.many`;
}

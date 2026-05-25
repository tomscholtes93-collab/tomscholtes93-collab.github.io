# PLAN.md — tomscholtes-subpage-i18n-2026-05-25

Surgical follow-up to PR #8. Three deliverables: (1) translate the 4 note bodies and (2) the 3 project subpage bodies into DE / FR / RU; (3) fix the LangSwitcher routing bug. Strictly additive. No theme / typography / layout / animation changes.

## Existing site on disk

Workspace clone of `tomscholtes93-collab.github.io` at `/home/sofia/Projects/Personal_Website/V2/`. Architect could not capture the current `main` SHA (no bash/git access per CLAUDE.md). **Frontend pre-flight task FE-T1 below MUST execute `git -C $WORKSPACE/.target_repo rev-parse origin/main` and `git fetch origin main && git diff origin/main..HEAD --stat`, then verify against this PLAN.md's file-touch list.** If `src/styles/components.css`, `src/styles/tokens.css`, `src/i18n/*.json`, `src/components/Nav.astro`, `src/components/LangSwitcher.astro`, `src/content/notes/config.ts`, or `scripts/check-notes.mjs` have changed on `main` since the workspace was cloned, Frontend refreshes those tracked files from `main` BEFORE editing. Per the V4 + PR #8 lesson on workspace drift.

The deployed-state read from disk during planning confirms:
- `package.json:8` build chain is `check-i18n.mjs && check-notes.mjs && copy-fonts.mjs && make-og.mjs && astro build && post-build.mjs` (PR #8 + Reviewer restoration both present).
- `astro.config.mjs:8–14` has the i18n block exactly as PR #8 shipped.
- `src/i18n/index.ts` exports `t / getLocale / localizePath / localeDateFmt / LOCALES / NON_DEFAULT_LOCALES / DEFAULT_LOCALE` (no changes needed).
- `src/components/LangSwitcher.astro:6` strips `^/(de|fr|ru)(\/|$)` prefix and builds hrefs via `localizePath`. The hrefs LOOK correct in source.
- `src/components/Nav.astro:18` has `transition:persist transition:name="site-nav"`. **This is the LangSwitcher bug root cause; see §"LangSwitcher routing diagnosis".**
- `src/pages/de/notes/[slug].astro` and `src/pages/de/projects/{devswarm,exocortex,devswarm-cv}/index.astro` are thin re-imports of their EN siblings. These files become **full per-locale files** in this batch (Option B for projects; Option 1 for notes).
- `src/content/notes/config.ts` has a `type: 'content'` Zod schema with no `locale` field. The schema needs no change for Option 1 (subdirectory-keyed locale).
- 4 EN notes present at `src/content/notes/{mcp-workstream,self-hosted-rag-claude-max,the-remembering-assistant,token-economy-principle}.md`. Body sizes: 17–43 markdown lines each; total ~2500 words across all four.
- `scripts/check-notes.mjs:13` reads `src/content/notes` (non-recursive). **Will need a 2-line edit** to walk one level of subdirectory once notes are moved into `src/content/notes/{en,de,fr,ru}/`.

## Design choices

**Notes → Option 1 (per-locale subdirectory).** Move existing 4 EN notes into `src/content/notes/en/` and add sibling files under `src/content/notes/{de,fr,ru}/`. Clean separation, easy QA per locale, aligns with Astro 5 content-collection idioms, Zod schema unchanged. Cost: 4 file moves + 12 new files + small `getStaticPaths` filter change. Rejected: Option 2 (frontmatter-stuffed translations) does not handle long bodies cleanly; Option 3 (i18n content collection plugin) adds complexity for no gain at this scale.

**Project subpages → Option B (per-locale .astro files).** Promote the 9 thin re-import wrappers at `src/pages/{de,fr,ru}/projects/{devswarm,exocortex,devswarm-cv}/index.astro` into self-contained files with inline translated prose. The English bodies embed `<NoteLink slug="…">…</NoteLink>`, `<ArchitectureDevSwarm />`, `<ArchitectureExocortex />`, `<dl>`, `<iframe>`, `<pre>`, `<code>` — JSX-shaped components and rich HTML that cannot live cleanly inside JSON dictionary values. Option A (extend `src/i18n/<locale>.json` with ~300 long-prose keys) was considered and rejected: JSON dicts cannot host Astro components without a string-templating sub-language, and the 200-key dictionary balloons to ~500 keys with strings ~1500 characters long. Per-locale .astro keeps prose, formatting, and inline components in the same file the translator edits.

## LangSwitcher routing diagnosis

**Root cause: `transition:persist` on `<header class="nav">` at `src/components/Nav.astro:18`.**

The Nav header carries `transition:persist transition:name="site-nav"`. With Astro 5 View Transitions enabled (via `<ClientRouter />` in `Base.astro:6`), `transition:persist` reuses the EXACT same DOM element across navigations. The element is rendered ONCE on the first page the user visits, then carried forward unchanged. Inside that persisted element is the LangSwitcher, whose hrefs were computed at first-render time using `Astro.url.pathname` of the FIRST page.

Reproducer:
1. User loads `/de/notes/` → Nav renders with LangSwitcher hrefs `{en:'/', de:'/de/', fr:'/fr/', ru:'/ru/'}`.
2. User clicks `Projects` in nav, navigating via View Transition to `/de/projects/devswarm/`. The persisted Nav element is reused unchanged; its LangSwitcher still has the `/de/`-vintage hrefs.
3. User clicks `FR` in LangSwitcher → href is `/fr/`, NOT `/fr/projects/devswarm/`. User lands on the FR notes/home page, exactly matching the bug report.

`Astro.url` is request-scoped and correct on first render; the bug is purely that the LangSwitcher is never re-rendered after View Transition navigations.

**Primary fix:** Remove `transition:persist transition:name="site-nav"` from `Nav.astro:18`. The Nav becomes a normal element that re-renders on every navigation. LangSwitcher hrefs always reflect the actual current URL. Cost: the small Nav HTML repaints once per navigation; perceptually invisible on a static site. The `<ClientRouter />` still handles cross-page View Transitions for the main content; only the Nav loses its identity persistence.

**Belt-and-braces secondary fix (required, not optional):** Even with the primary fix in place, add a tiny `is:inline` script inside `LangSwitcher.astro` that listens for the `astro:after-swap` lifecycle event and rewrites the four `<a href>` values using `window.location.pathname`. This is defensive: any future re-introduction of `transition:persist` on the Nav (or its parent) would silently re-break the LangSwitcher; the script makes the LangSwitcher self-healing.

```html
<script is:inline>
  (function () {
    function fix() {
      var here = window.location.pathname.replace(/^\/(de|fr|ru)(\/|$)/, '/');
      if (!here.startsWith('/')) here = '/' + here;
      document.querySelectorAll('.lang-switcher a.lang-switch').forEach(function (a) {
        var code = (a.getAttribute('hreflang') || '').toLowerCase();
        a.setAttribute('href', code === 'en' ? here : '/' + code + (here === '/' ? '/' : here));
        if (code === currentLocale()) {
          a.classList.add('is-active'); a.setAttribute('aria-current', 'true');
        } else {
          a.classList.remove('is-active'); a.removeAttribute('aria-current');
        }
      });
    }
    function currentLocale() {
      var m = window.location.pathname.match(/^\/(de|fr|ru)(\/|$)/);
      return m ? m[1] : 'en';
    }
    document.addEventListener('astro:after-swap', fix);
    document.addEventListener('astro:page-load', fix);
  })();
</script>
```

This script is < 700 bytes minified, gates on document events only, has no external deps, and respects `prefers-reduced-motion` trivially (it does not animate). It is allowed under the LangSwitcher hard rule ("CSS-only active state, no React island, no client:* directives") because `is:inline` scripts are NOT client-directive islands; they are plain inline `<script>` tags. The hard rule was about not hydrating a framework component; an inline 700-byte vanilla script is consistent with the rest of the site (Nav.astro already uses `<script is:inline>` for the hamburger toggle at line 44).

## Stack

- Astro 5.x (existing). No new deps. No build-config changes.
- Astro 5 built-in i18n (already configured PR #8). `i18n.fallback` left UNSET so missing locale variants 404 cleanly rather than silently rendering English.
- Translation surfaces:
  - Note bodies: per-locale `.md` files in subdirectories `src/content/notes/{en,de,fr,ru}/`.
  - Project subpage bodies: per-locale `.astro` files at `src/pages/{de,fr,ru}/projects/{devswarm,exocortex,devswarm-cv}/index.astro`.
  - Chrome translation surfaces (`src/i18n/<locale>.json`) unchanged.
- `scripts/check-notes.mjs` extended to recurse one level into `src/content/notes/<locale>/` so the em-dash + leakage gate covers all 16 note files (4 slugs × 4 locales).
- `scripts/check-i18n.mjs` unchanged (operates on `src/i18n/<locale>.json`; not affected by this batch).
- LangSwitcher: `transition:persist` removed from `Nav.astro`; self-healing `is:inline` script added to `LangSwitcher.astro`.

## File layout

```
V2/
  package.json                                            # READ-ONLY (build chain unchanged)
  astro.config.mjs                                        # READ-ONLY (i18n block already correct)
  scripts/
    check-notes.mjs                                       # MODIFY — recurse one level for {en,de,fr,ru}/
    check-i18n.mjs                                        # READ-ONLY
    copy-fonts.mjs                                        # READ-ONLY
    make-og.mjs                                           # READ-ONLY
    post-build.mjs                                        # READ-ONLY
  src/
    i18n/
      index.ts                                            # READ-ONLY (helper unchanged)
      en.json                                             # MODIFY — add ~10 new chrome keys (see FE-T9)
      de.json                                             # MODIFY — same keys, German values
      fr.json                                             # MODIFY — same keys, French values
      ru.json                                             # MODIFY — same keys, Russian values
    components/
      Nav.astro                                           # MODIFY — REMOVE `transition:persist` +
                                                          #          `transition:name="site-nav"` from
                                                          #          line 18 header element
      LangSwitcher.astro                                  # MODIFY — append <script is:inline> belt-and-
                                                          #          braces handler for astro:after-swap
      NoteCard.astro                                      # MODIFY — slug-display strip (`/notes/<slug>/`
                                                          #          NOT `/notes/en/<slug>/`); see FE-T7
      Footer.astro                                        # READ-ONLY
      Hero.astro / Now.astro / CV.astro / Reading.astro / Languages.astro
      Colophon.astro / Contact.astro / CaseStudies.astro  # READ-ONLY
      ArchitectureDevSwarm.astro / ArchitectureExocortex.astro
      RevealObserver.astro / NoteLink.astro / Arr.astro
      FlowRow.astro / HeroCard*.astro / HeroComposition.astro
      JsonLdPerson.astro / CaseStudyCard.astro            # READ-ONLY (no translation surface here)
    layouts/
      Base.astro                                          # READ-ONLY
    content/
      notes/
        config.ts                                         # READ-ONLY (schema sufficient; locale derived
                                                          #            from filename path)
        mcp-workstream.md                                 # MOVE -> notes/en/mcp-workstream.md
        self-hosted-rag-claude-max.md                     # MOVE -> notes/en/self-hosted-rag-claude-max.md
        the-remembering-assistant.md                      # MOVE -> notes/en/the-remembering-assistant.md
        token-economy-principle.md                        # MOVE -> notes/en/token-economy-principle.md
        en/                                               # CREATE (dir) + 4 moved files inside
          mcp-workstream.md                               # MOVE TARGET (content unchanged)
          self-hosted-rag-claude-max.md                   # MOVE TARGET
          the-remembering-assistant.md                    # MOVE TARGET
          token-economy-principle.md                      # MOVE TARGET
        de/                                               # CREATE (dir) + 4 new files
          mcp-workstream.md                               # CREATE — German translation
          self-hosted-rag-claude-max.md                   # CREATE — German translation
          the-remembering-assistant.md                    # CREATE — German translation
          token-economy-principle.md                      # CREATE — German translation
        fr/                                               # CREATE (dir) + 4 new files
          mcp-workstream.md                               # CREATE — French translation
          self-hosted-rag-claude-max.md                   # CREATE — French translation
          the-remembering-assistant.md                    # CREATE — French translation
          token-economy-principle.md                      # CREATE — French translation
        ru/                                               # CREATE (dir) + 4 new files
          mcp-workstream.md                               # CREATE — Russian translation
          self-hosted-rag-claude-max.md                   # CREATE — Russian translation
          the-remembering-assistant.md                    # CREATE — Russian translation
          token-economy-principle.md                      # CREATE — Russian translation
      caseStudies.ts / headlines.ts / now.ts              # READ-ONLY
      config.ts                                           # READ-ONLY (collections export only)
    pages/
      index.astro                                         # READ-ONLY
      thesis.astro / 404.astro                            # READ-ONLY
      projects/
        index.astro                                       # READ-ONLY
        devswarm/index.astro                              # READ-ONLY (canonical EN body, unchanged)
        exocortex/index.astro                             # READ-ONLY (canonical EN body, unchanged)
        devswarm-cv/index.astro                           # READ-ONLY (canonical EN body, unchanged)
      notes/
        index.astro                                       # MODIFY — filter getCollection by slug prefix
                                                          #          'en/'; strip prefix for display slug
        [slug].astro                                      # MODIFY — getStaticPaths filters 'en/' slugs;
                                                          #          params.slug = entry.slug.replace(/^en\//, '')
      de/
        index.astro                                       # READ-ONLY (existing thin re-import; still valid)
        thesis.astro                                      # READ-ONLY
        404.astro                                         # READ-ONLY
        projects/
          index.astro                                     # READ-ONLY (existing thin re-import; still valid)
          devswarm/index.astro                            # MODIFY — promote to full file with DE prose
          exocortex/index.astro                           # MODIFY — promote to full file with DE prose
          devswarm-cv/index.astro                         # MODIFY — promote to full file with DE prose
        notes/
          index.astro                                     # MODIFY — replace thin re-import with own
                                                          #          getCollection filter on 'de/' prefix
          [slug].astro                                    # MODIFY — own getStaticPaths over 'de/' slugs
      fr/
        index.astro                                       # READ-ONLY
        thesis.astro                                      # READ-ONLY
        404.astro                                         # READ-ONLY
        projects/
          index.astro                                     # READ-ONLY
          devswarm/index.astro                            # MODIFY — promote to full file with FR prose
          exocortex/index.astro                           # MODIFY — promote to full file with FR prose
          devswarm-cv/index.astro                         # MODIFY — promote to full file with FR prose
        notes/
          index.astro                                     # MODIFY — own filter on 'fr/' prefix
          [slug].astro                                    # MODIFY — own getStaticPaths over 'fr/' slugs
      ru/
        index.astro                                       # READ-ONLY
        thesis.astro                                      # READ-ONLY
        404.astro                                         # READ-ONLY
        projects/
          index.astro                                     # READ-ONLY
          devswarm/index.astro                            # MODIFY — promote to full file with RU prose
          exocortex/index.astro                           # MODIFY — promote to full file with RU prose
          devswarm-cv/index.astro                         # MODIFY — promote to full file with RU prose
        notes/
          index.astro                                     # MODIFY — own filter on 'ru/' prefix
          [slug].astro                                    # MODIFY — own getStaticPaths over 'ru/' slugs
    styles/
      components.css / tokens.css / global.css / pages.css  # READ-ONLY (no style changes)
```

**Counts.**
- **CREATE:** 12 new note files (4 slugs × 3 non-default locales) + 4 directories = **12 files** (directories implicit).
- **MOVE:** 4 (EN notes into `notes/en/`).
- **MODIFY:** 4 JSON dicts + `scripts/check-notes.mjs` + `Nav.astro` + `LangSwitcher.astro` + `NoteCard.astro` + 2 EN notes pages (`notes/index.astro`, `notes/[slug].astro`) + 6 non-EN notes pages (3 locales × 2 each) + 9 project subpages (3 locales × 3 each) = **27 files**.
- **READ-ONLY:** everything else.

## API contracts

NOT_REQUIRED at runtime (static site, no server).

**Build-time TS contract changes:** none. `src/i18n/index.ts` helpers (`t / getLocale / localizePath / localeDateFmt`) are unchanged. The `src/content/notes/config.ts` Zod schema is unchanged.

**Slug semantics change (internal contract):**
- Astro 5 derives a `CollectionEntry.slug` from filename relative to the collection root. After moving notes to subdirectories:
  - `src/content/notes/en/mcp-workstream.md` → `entry.slug === 'en/mcp-workstream'`
  - `src/content/notes/de/mcp-workstream.md` → `entry.slug === 'de/mcp-workstream'`
- The DISPLAY slug used in URLs (`/notes/mcp-workstream/`, `/de/notes/mcp-workstream/`) strips the leading locale prefix.
- `[slug].astro` `getStaticPaths` MUST set `params.slug = entry.slug.replace(/^(en|de|fr|ru)\//, '')` so the URL slug stays clean.
- `NoteCard.astro` MUST render its display path the same way (strip the locale prefix before composing `/notes/<slug>/`).

**Frontmatter contract per locale file:** identical to the existing Zod schema (`title`, `summary`, `publishDate`, `tags ≤ 3`, `related`, `sources`, `status`). Translated values inside `title` / `summary` / `tags` are LOCALE-NATIVE; the `related` array stays slug-only (no locale prefix). `publishDate` mirrors the EN source date (translations are not chronologically distinct works).

## DB schema

NOT_REQUIRED.

## Frontend tasks

### FE-T1. Pre-flight reads + workspace SHA capture

Read in this order: `personas/frontend/LESSONS.md` (especially the 2026-05-24 build-chain-must-be-additive lesson and refresh-tracked-files lesson), the three rules files (`NOTES_GUIDE.md`, `astro-site.md`, `i18n.md`), this PLAN.md, the PR #8 PLAN/RESEARCH/REVIEW, then this batch's RESEARCH.md.

Then execute (bash, read-only git):
```bash
cd $WORKSPACE/.target_repo
git fetch origin main --no-tags
git rev-parse origin/main          # capture as MAIN_SHA
git rev-parse HEAD                 # capture as WORKSPACE_SHA
git diff --stat origin/main..HEAD  # capture as DRIFT_REPORT
```
Paste MAIN_SHA, WORKSPACE_SHA, and the drift report into a file at `$WORKSPACE/SHA.txt`. If DRIFT_REPORT shows changes to any of {`src/styles/components.css`, `src/styles/tokens.css`, `src/i18n/*.json`, `src/components/Nav.astro`, `src/components/LangSwitcher.astro`, `src/content/notes/config.ts`, `scripts/check-notes.mjs`, `scripts/check-i18n.mjs`, `package.json`, `astro.config.mjs`}, refresh those files from `origin/main` BEFORE editing: `git checkout origin/main -- <file>`. Then proceed.

### FE-T2. Notes — move EN files into `src/content/notes/en/`

```bash
cd $WORKSPACE/.target_repo
mkdir -p src/content/notes/en src/content/notes/de src/content/notes/fr src/content/notes/ru
git mv src/content/notes/mcp-workstream.md           src/content/notes/en/mcp-workstream.md
git mv src/content/notes/self-hosted-rag-claude-max.md src/content/notes/en/self-hosted-rag-claude-max.md
git mv src/content/notes/the-remembering-assistant.md  src/content/notes/en/the-remembering-assistant.md
git mv src/content/notes/token-economy-principle.md    src/content/notes/en/token-economy-principle.md
```
No file content changes during the move. Verify with `ls src/content/notes/en/ | wc -l` → `4`.

### FE-T3. Notes — patch `getStaticPaths` and `getCollection` filters

**`src/pages/notes/[slug].astro`:** rewrite the top frontmatter `getStaticPaths` to filter by locale prefix and strip it from `params.slug`:

```ts
export async function getStaticPaths() {
  const entries = await getCollection('notes', ({ data, slug }) =>
    data.status === 'published' && slug.startsWith('en/'));
  return entries.map((entry) => ({
    params: { slug: entry.slug.replace(/^en\//, '') },
    props: { entry },
  }));
}
```

**`src/pages/notes/index.astro`:** filter `getCollection` the same way (`slug.startsWith('en/')`).

**`src/pages/de/notes/[slug].astro`:** REPLACE the thin re-import with a full file mirroring `src/pages/notes/[slug].astro`, with the filter changed to `slug.startsWith('de/')` and the strip to `replace(/^de\//, '')`. Same for `fr/` and `ru/`.

**`src/pages/de/notes/index.astro`:** REPLACE the thin re-import with a full file mirroring `src/pages/notes/index.astro`, with the filter changed to `slug.startsWith('de/')` and the strip to `replace(/^de\//, '')`. Same for `fr/` and `ru/`.

Each non-EN notes page mirrors the EN page structure 1:1 EXCEPT the locale prefix filter and the strip. Wrapper template (`src/pages/de/notes/[slug].astro`):

```astro
---
import Base from '../../../layouts/Base.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import RevealObserver from '../../../components/RevealObserver.astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { t as translate, getLocale, localizePath, localeDateFmt, type Locale } from '../../../i18n';

export async function getStaticPaths() {
  const entries = await getCollection('notes', ({ data, slug }) =>
    data.status === 'published' && slug.startsWith('de/'));
  return entries.map((entry) => ({
    params: { slug: entry.slug.replace(/^de\//, '') },
    props: { entry },
  }));
}

interface Props { entry: CollectionEntry<'notes'>; }
const { entry } = Astro.props;
const { Content } = await entry.render();
const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const t = (k: string) => translate(k, locale);
const fmt = localeDateFmt(locale);
const displaySlug = entry.slug.replace(/^de\//, '');
const eyebrowParts = [t('notes.detail.eyebrow.prefix'), fmt.format(entry.data.publishDate), ...entry.data.tags];
const eyebrow = eyebrowParts.join(' · ');
const relatedEntries = entry.data.related.length
  ? (await getCollection('notes', ({ data, slug }) =>
      data.status === 'published' && entry.data.related.map((r) => `de/${r}`).includes(slug)))
  : [];
const notesHref = localizePath('/notes/', locale);
---
<Base
  title={`${entry.data.title} · Tom Scholtes`}
  description={entry.data.summary}
  path={`/de/notes/${displaySlug}/`}
>
  <Nav active="notes" />
  <main>
    <section>
      <div class="container">
        <article class="prose note-article">
          <p class="eyebrow mono">{eyebrow}</p>
          <h1 class="serif note-title" transition:name={`note-title-${displaySlug}`}>{entry.data.title}</h1>
          <p class="lead note-summary" transition:name={`note-summary-${displaySlug}`}>{entry.data.summary}</p>
          <Content />
          {entry.data.sources.length > 0 && (
            <section class="note-sources">
              <h2 class="eyebrow">{t('notes.detail.sources.heading')}</h2>
              <ul>{entry.data.sources.map((s) => (<li>{s.label} <span class="mono">· {s.kind}</span></li>))}</ul>
            </section>
          )}
          {relatedEntries.length > 0 && (
            <section class="note-related">
              <h2 class="eyebrow">{t('notes.detail.related.heading')}</h2>
              <ul>
                {relatedEntries.map((r) => (
                  <li><a class="note-link" href={localizePath(`/notes/${r.slug.replace(/^de\//, '')}/`, locale)} data-astro-prefetch>{r.data.title}</a></li>
                ))}
              </ul>
            </section>
          )}
          <p class="back mono"><a href={notesHref}>{t('notes.detail.back')}</a></p>
        </article>
      </div>
    </section>
  </main>
  <Footer />
  <RevealObserver />
</Base>
```

Apply the same shape to `fr/` and `ru/` variants (substitute the 2 locale tokens).

### FE-T4. Notes — author DE / FR / RU bodies

For each (locale, slug) pair, create `src/content/notes/<locale>/<slug>.md` with:
- Frontmatter: copy from EN; translate `title` and `summary` (LOCALE-NATIVE; tags optionally translated, keeping ≤ 3); preserve `publishDate` (EN date); preserve `related` (slug-only, no locale prefix); preserve `sources[].label` (translated) and `sources[].kind` (untranslated discriminator); preserve `status: published`.
- Body: faithful translation of the EN body. Voice register per locale (DE Sie / FR vouvoiement / RU «вы»), but first-person reflective (`ich/mir`, `je/moi`, `я/мне`) preserved because the source is first-person reflective Naval-notes register.
- Markdown formatting (headings, lists, inline `**bold**` / `*italic*`, `<code>` if any) preserved verbatim.
- Em-dash forbidden (U+2014). Use period, semicolon, or rewrite.
- Leakage list forbidden (Sofia, Bekzoda, Triton, composite-keys, Investran, Dealsplus, Luke, Joakim, Anna, Conrad, Adam). Source notes don't contain these tokens; translations must not introduce them.

Order to author (smallest first, to validate the build pipeline early):
1. `token-economy-principle.md` (~520 words, all 3 locales)
2. `mcp-workstream.md` (~400 words estimated, all 3 locales)
3. `self-hosted-rag-claude-max.md` (~500 words estimated, all 3 locales)
4. `the-remembering-assistant.md` (~800 words estimated; longest)

### FE-T5. NoteCard slug strip

`src/components/NoteCard.astro:11–19` currently composes `/notes/${entry.slug}/`. After the move, `entry.slug` includes the locale prefix (`en/mcp-workstream`). Patch the href and the displayed `<span class="note-card-path mono">/notes/{entry.slug}/</span>` to strip the leading `(en|de|fr|ru)/` segment:

```astro
const displaySlug = entry.slug.replace(/^(en|de|fr|ru)\//, '');
// use displaySlug in href and in the displayed path
```

`transition:name={`note-title-${displaySlug}`}` for clean cross-page morphs.

### FE-T6. `scripts/check-notes.mjs` — recurse one level

Patch line 13 from non-recursive readdir to one-level recursion:

```diff
- files = readdirSync(NOTES_DIR)
-   .filter((f) => f.endsWith('.md'))
-   .map((f) => join(NOTES_DIR, f))
-   .filter((p) => statSync(p).isFile());
+ files = [];
+ for (const top of readdirSync(NOTES_DIR)) {
+   const topPath = join(NOTES_DIR, top);
+   const topStat = statSync(topPath);
+   if (topStat.isFile() && top.endsWith('.md')) {
+     files.push(topPath);                                  // legacy top-level (none expected post-batch)
+   } else if (topStat.isDirectory() && ['en','de','fr','ru'].includes(top)) {
+     for (const f of readdirSync(topPath)) {
+       const fPath = join(topPath, f);
+       if (f.endsWith('.md') && statSync(fPath).isFile()) {
+         files.push(fPath);
+       }
+     }
+   }
+ }
```

Result: the em-dash + leakage gate covers all 16 note files (4 slugs × 4 locales) per build. Surface message on success: `✓ check-notes passed: 16 notes checked, 0 issues`.

### FE-T7. Project subpages — promote 9 wrappers to full files

For each of `{devswarm, exocortex, devswarm-cv}` × `{de, fr, ru}`:
1. Open the EN canonical file at `src/pages/projects/<slug>/index.astro` (READ-ONLY).
2. Open the existing thin wrapper at `src/pages/<locale>/projects/<slug>/index.astro`.
3. REPLACE the wrapper's entire contents with a self-contained file that mirrors the EN structure 1:1 (same imports, same `<Base>` props, same component structure, same classnames) BUT with prose translated to the locale.

Constraints during translation:
- Preserve every `<NoteLink slug="…">…</NoteLink>` block; only translate the visible link label (the children), not the slug.
- Preserve `<ArchitectureDevSwarm />` / `<ArchitectureExocortex />` component invocations verbatim.
- Preserve `<dl>` / `<dt>` / `<dd>` / `<pre>` / `<code>` / `<iframe>` / `<table>` / `<div class="…">` / `<span>` markup verbatim. Translate text nodes inside them.
- Preserve `<Base title="…" description="…" path="…">` props: translate `title` and `description`; `path` becomes `/<locale>/projects/<slug>` (NOT `/projects/<slug>`).
- Preserve every `class="…"` and `data-*` attribute. CSS layout invariance is mandatory.
- Em-dash forbidden. Leakage list forbidden.
- Voice register per locale.
- Brand names literal: `DevSwarm`, `Astro`, `FastMCP`, `Claude`, `Claude Code`, `Opus 4.7`, `MCP`, `Fedora`, `Even Realities G2`, `Tailscale`, `OpenKB`, `Meridian`, `Notion`, `Asana`, `Outlook`, `Monday.com`, `Pixel`, `LangSwitcher`, `Cloudflare`, `GitHub`, `gh`, `git`, `python`, `bash`, `pip`, `npm`, `Vite`, `Sonnet`.
- Persona names (Architect, Researcher, Frontend, Backend, Reviewer-Deployer) translated to the locale's natural rendering (DE: Architekt, Recherche, Frontend, Backend, Reviewer-Deployer or natural rendering; FR: Architecte, Chercheur, Frontend, Backend, Reviewer-Deployer; RU: Архитектор, Исследователь, Frontend, Backend, Reviewer-Deployer). Translator's judgment, applied consistently within each locale.

### FE-T8. Project subpages — translate the 3 bodies × 3 locales

Word-count budget (approximate, EN source):
- `devswarm/index.astro` — ~900 words of prose (sections: premise, architecture, five personas, capstone test, stack & status).
- `exocortex/index.astro` — ~700 words.
- `devswarm-cv/index.astro` — ~300 words.

Per locale: ~1900 words. × 3 locales = ~5700 words total of translated prose for projects.

### FE-T9. Dictionary additions — chrome leak from project subpages

The promoted project subpages may need a small number of NEW chrome keys not present in `en.json` today (e.g., per-subpage `<Base>` `meta.projects.devswarm.title` / `description` are already in PR #8; verify by `grep -l 'meta.projects' src/i18n/en.json`). For any new chrome strings discovered while promoting wrappers (e.g., section eyebrows that the translator decides should be unified across locales rather than inline-translated), add keys to all 4 `<locale>.json` dicts together so `check-i18n.mjs` key-parity stays green.

Expected new keys: ≤ 10 across all 4 dicts. If more than 30 keys are needed, stop and re-consult Architect — that signals Option A creep and the design choice should be revisited.

### FE-T10. Nav.astro — REMOVE `transition:persist`

In `src/components/Nav.astro:18`, change:

```diff
- <header class="nav" id="site-nav" data-open="false" transition:persist transition:name="site-nav">
+ <header class="nav" id="site-nav" data-open="false">
```

This is the primary LangSwitcher routing fix. Keep `id="site-nav"`, `class="nav"`, `data-open="false"`. The inline hamburger script at lines 44–65 keeps working unchanged because it queries `document.getElementById('site-nav')` at the top of every `astro:page-load` event (which fires on View Transition swaps too).

### FE-T11. LangSwitcher.astro — append self-healing inline script

Append the `<script is:inline>…</script>` block from the §"LangSwitcher routing diagnosis" section to `src/components/LangSwitcher.astro` (after the closing `</div>`). This is the belt-and-braces secondary fix. Verify the script is < 1 KB raw, has no external imports, is plain vanilla JS (no JSX, no client:* directive).

### FE-T12. First green build

```bash
cd $WORKSPACE/.target_repo
npm ci
npm run build
```

Must exit 0 with:
- `✓ check-i18n: <N> keys × 4 locales, ...`
- `✓ check-notes passed: 16 notes checked, 0 issues`
- `<M> page(s) built in <T>s` (M ≥ 64 = previous 48 + 16 note locale variants).

Save tail of output to `$WORKSPACE/build_output.txt` for Reviewer-Deployer PR description.

### FE-T13. Spot-check routes locally

Verify these built files all exist and are non-empty:
- 4 EN note slugs × 4 locales = 16 note detail pages: `dist/{,de/,fr/,ru/}notes/{mcp-workstream,self-hosted-rag-claude-max,the-remembering-assistant,token-economy-principle}/index.html`.
- 4 locale variants of notes index: `dist/{,de/,fr/,ru/}notes/index.html`.
- 3 project subpage slugs × 4 locales = 12 project detail pages: `dist/{,de/,fr/,ru/}projects/{devswarm,exocortex,devswarm-cv}/index.html`.

Verify LangSwitcher fix by browsing locally (`npm run preview`):
1. Load `/de/projects/devswarm/`.
2. Click `Projects` in nav → land on `/de/projects/` (or wherever; doesn't matter for this test).
3. Browser-back to `/de/projects/devswarm/`.
4. Click `FR` in LangSwitcher → must land on `/fr/projects/devswarm/` (NOT `/fr/projects/`, NOT `/fr/notes/`, NOT `/fr/`).
5. Repeat starting from `/ru/notes/mcp-workstream/`: clicking `EN` must land on `/notes/mcp-workstream/`.

## Backend tasks

NOT_REQUIRED. Static Astro site on GitHub Pages. No server runtime. No build-time endpoint added. Backend persona reads its LESSONS.md, the three rules files, confirms the static-site nature, emits NOT_REQUIRED, exits.

## Acceptance criteria

Reviewer-Deployer executes in order. Evidence into PR description. Does NOT auto-merge.

1. **Build green.** `cd workspace/.target_repo && npm ci && npm run build` exits 0. Output contains:
   - `✓ check-i18n: <N> keys × 4 locales, key-parity + placeholders + em-dash + leakage all clean`
   - `✓ check-notes passed: 16 notes checked, 0 issues`
   - No `[ERROR]` lines from Astro.
   Tail (last 40 lines) attached to PR.

2. **check-notes recursion landed.** `grep -E "(en|de|fr|ru)" scripts/check-notes.mjs` shows the locale-aware directory walk. The success message in the build output reports `16 notes` (not `4`).

3. **Note files present in all four locales.** `for L in en de fr ru; do test -d src/content/notes/$L && ls src/content/notes/$L/*.md | wc -l | grep -qx 4 || { echo "FAIL $L"; exit 1; }; done; echo OK`. Output `OK` attached.

4. **Note routes built for all four locales.** Bash:
   ```bash
   for L in '' de/ fr/ ru/; do
     for S in mcp-workstream self-hosted-rag-claude-max the-remembering-assistant token-economy-principle; do
       test -s "dist/${L}notes/${S}/index.html" || { echo "MISSING dist/${L}notes/${S}/index.html"; exit 1; };
     done;
   done; echo OK
   ```
   Output `OK` attached. 16 paths verified.

5. **Project subpage routes built for all four locales.** Bash:
   ```bash
   for L in '' de/ fr/ ru/; do
     for P in devswarm exocortex devswarm-cv; do
       test -s "dist/${L}projects/${P}/index.html" || { echo "MISSING dist/${L}projects/${P}/index.html"; exit 1; };
     done;
   done; echo OK
   ```
   Output `OK` attached. 12 paths verified.

6. **Note body translated, not English fallback.** For each of `mcp-workstream`, `self-hosted-rag-claude-max`, `the-remembering-assistant`, `token-economy-principle` and each locale `de`, `fr`, `ru`: extract the first paragraph of the body from the built HTML and verify it does NOT exactly match the EN first paragraph. Bash:
   ```bash
   for L in de fr ru; do
     for S in mcp-workstream self-hosted-rag-claude-max the-remembering-assistant token-economy-principle; do
       EN=$(grep -A 0 -m 1 -E "^<p>" "dist/notes/$S/index.html" | head -c 200);
       LO=$(grep -A 0 -m 1 -E "^<p>" "dist/$L/notes/$S/index.html" | head -c 200);
       [ "$EN" = "$LO" ] && { echo "FAIL untranslated $L/$S"; exit 1; };
     done;
   done; echo OK
   ```
   Output `OK` attached.

7. **Project subpage body translated, not English fallback.** Same idea as criterion 6 but for `dist/<locale>/projects/<slug>/index.html`. The `<p class="sub">` first paragraph in DE/FR/RU must NOT byte-equal the EN one.

8. **Em-dash ban.** `grep -rP $'\xe2\x80\x94' src/i18n/ src/content/notes/ src/components/ src/pages/` returns ZERO matches. Command and count attached. (Defense-in-depth grep over `dist/` also returns 0.)

9. **Leakage word-boundary check.** `grep -riE '\b(Sofia|Bekzoda|Triton|composite-keys|Investran|Dealsplus|Luke|Joakim|Anna|Conrad|Adam)\b' src/i18n/ src/content/notes/ src/pages/{de,fr,ru}/ src/components/LangSwitcher.astro` returns ZERO matches. Command and count attached. (Pre-existing leakage tokens in `src/components/CV.astro` and `src/content/caseStudies.ts` are NOT in this batch's grep scope per PR #8 conflict resolution; unchanged exposure status.)

10. **LangSwitcher routing — per-page hrefs are correct.** Bash test:
    ```bash
    set -e
    fail=0
    for L in '' de/ fr/ ru/; do
      LOC="${L%/}"; LOC="${LOC:-en}"
      for P in "" "projects/" "projects/devswarm/" "projects/exocortex/" "projects/devswarm-cv/" "notes/" "notes/mcp-workstream/" "notes/the-remembering-assistant/" "thesis/"; do
        FILE="dist/${L}${P}index.html"
        [ -s "$FILE" ] || continue
        # extract LangSwitcher hrefs in document order: EN, DE, FR, RU
        HREFS=$(grep -oE 'class="lang-switch[^"]*" hreflang="[a-z]{2}"' "$FILE" \
          | head -n 0; grep -oE 'href="[^"]*"[^>]*class="lang-switch' "$FILE" \
          | sed -E 's/href="([^"]*)".*/\1/')
        EXP_EN="/${P}"
        EXP_DE="/de/${P}"
        EXP_FR="/fr/${P}"
        EXP_RU="/ru/${P}"
        [ "/" = "$EXP_EN" ] || true
        if [ -z "$P" ]; then EXP_EN="/"; EXP_DE="/de/"; EXP_FR="/fr/"; EXP_RU="/ru/"; fi
        GOT=$(echo "$HREFS" | tr '\n' ' ')
        EXP="$EXP_EN $EXP_DE $EXP_FR $EXP_RU"
        if ! echo "$GOT" | grep -qF -- "$EXP_EN" || ! echo "$GOT" | grep -qF -- "$EXP_DE" \
           || ! echo "$GOT" | grep -qF -- "$EXP_FR" || ! echo "$GOT" | grep -qF -- "$EXP_RU"; then
          echo "FAIL ${LOC} ${P}: got [$GOT] expected [$EXP]"; fail=1;
        fi
      done
    done
    [ "$fail" -eq 0 ] && echo "OK"
    ```
    Output `OK` attached. ZERO mismatches across all (locale, page) pairs.

11. **`transition:persist` removed from Nav.** `grep -n 'transition:persist' src/components/Nav.astro` returns ZERO matches. `grep -n 'transition:name="site-nav"' src/components/Nav.astro` returns ZERO matches.

12. **LangSwitcher belt-and-braces script present.** `grep -q 'astro:after-swap' src/components/LangSwitcher.astro` succeeds. `grep -q 'is:inline' src/components/LangSwitcher.astro` succeeds. `grep -E "client:(load|idle|visible|media|only)" src/components/LangSwitcher.astro` returns ZERO matches (still not a React island).

13. **No new runtime deps.** `git diff origin/main -- package.json package-lock.json` shows ZERO added entries under `dependencies` or `devDependencies`.

14. **No theme / layout / motion changes.** `git diff origin/main -- src/styles/tokens.css src/styles/global.css src/styles/pages.css` is empty. `git diff origin/main -- src/styles/components.css` is empty OR contains only purely-additive lines.

15. **i18n config block untouched.** `git diff origin/main -- astro.config.mjs` is empty.

16. **Key-parity holds (regression check).** `node -e 'const a=Object.keys(require("./src/i18n/en.json"));for(const l of ["de","fr","ru"]){const b=Object.keys(require("./src/i18n/"+l+".json"));if(a.length!==b.length||a.some((k,i)=>k!==b.sort()[i])) {console.error("FAIL "+l);process.exit(1);}};console.log("OK")'` prints `OK`. (Astro's JSON imports use `assert { type: 'json' }`; if Node ESM imports balk, fall back to `cat src/i18n/en.json | jq -r 'keys[]' | sort > /tmp/en.keys && cat src/i18n/de.json | jq -r 'keys[]' | sort > /tmp/de.keys && diff /tmp/en.keys /tmp/de.keys` and verify zero diff per locale.)

17. **PR opened (not merged).** Branch pushed (orchestrator-supplied, e.g. `devswarm/<project_id>`). `gh pr create` against `main` succeeds. PR URL captured to `workspace/.pr_url`. PR description includes: (a) MAIN_SHA + WORKSPACE_SHA + DRIFT_REPORT from FE-T1, (b) file inventory (12 CREATE + 4 MOVE + 27 MODIFY), (c) build output tail from criterion 1, (d) grep evidence from criteria 8 + 9 + 11 + 12 + 13 verbatim, (e) bash output from criteria 4, 5, 6, 7, 10, 16 verbatim, (f) the 17 criteria as pass/fail checklist with explicit OK marks. Reviewer-Deployer STOPS at PR open per dispatch.

[opus + 11 tool calls]

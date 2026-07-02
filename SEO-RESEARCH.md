# SEO research: tomscholtes.com (audit of build 2026-07-02, v3.5.0)

Audit performed 2026-07-02 against a fresh green `npm run build` (83 pages), the live site
(curl header checks), and Lighthouse 12.x via headless Chrome against `astro preview`.
Every claim below is either measured from `dist/`, observed live over HTTP, or cited by URL.

## Executive summary

The site's head-tag plumbing looks complete at first glance (titles, descriptions, canonical,
hreflang, Open Graph, Twitter cards, Person JSON-LD) but a path-localization bug makes a large
slice of it actively harmful: **33 pages canonicalize to URLs that do not exist (HTTP 404) and
105 hreflang alternate links point at 404s**. Every remaining extensionless canonical points at
a 301 redirect because GitHub Pages forces trailing slashes and the site emits slashless URLs.
There is **no sitemap.xml and no robots.txt** (confirmed 404 in production). The nine `case/*`
pages and the workflow-automation page (the strongest commercial content on the site) carry no
Open Graph, no Twitter card, and (workflow-automation) no canonical at all. Fixing the URL layer
plus adding sitemap/robots is high impact and low effort; everything else is incremental.

Performance is already strong (Lighthouse: performance 95, accessibility 98, SEO 100 on the
homepage; CLS 0.001, TBT 0 ms) so Core Web Vitals are not the battleground; indexability is.

Note on Lighthouse SEO = 100: Lighthouse only checks surface features (title, description,
crawlable links). It does not validate canonical targets or hreflang clusters, which is exactly
where this site is broken. Do not read 100 as "SEO is done."

## Method

- `npm run build` (green, 83 pages), then automated extraction over every `dist/**/*.html`:
  title/description lengths, canonical, hreflang count, OG/Twitter/JSON-LD presence, h1 count,
  noindex, img alt coverage.
- Canonical + hreflang target validation: every URL mapped back to a file in `dist/`;
  misses counted (script run 2026-07-02, results below).
- Live checks: `curl -I` on trailing slash behavior, robots.txt, sitemap.xml, www/http redirects.
- Lighthouse (performance, accessibility, SEO) on `/` via `astro preview` + headless Chrome.
- Source reading: `src/layouts/Base.astro`, `src/i18n/index.ts`, all `path=` props under
  `src/pages/`, `scripts/post-build.mjs`, `scripts/make-og.mjs`, `public/case/*`,
  `public/workflow-automation/index.html`.

## Verified environment facts (GitHub Pages)

- `https://tomscholtes.com/notes` returns **301 -> `/notes/`**; same for every directory URL
  without trailing slash (verified live for /notes, /projects, /de, /de/notes,
  /notes/mcp-workstream). GitHub Pages always redirects directory URLs to the slash form.
- `/thesis` is 200 without slash only because `scripts/post-build.mjs` mirrors
  `thesis/index.html` to `thesis.html`.
- `robots.txt` and `sitemap.xml` are **404 in production** (checked 2026-07-02).
- `www.tomscholtes.com` and `http://` both 301 to `https://tomscholtes.com/`: correct, no action.
- Custom 404 works via root `404.html` (GitHub Pages serves it with status 404). The localized
  404 routes (`/de/404/`, `/fr/404/`, `/ru/404/`) are ordinary 200 pages, currently indexable.

## Findings, ranked by impact x effort

### F1. CRITICAL: localized pages canonicalize to non-existent URLs (double locale prefix)

Measured: 33 canonicals point to 404 targets; 105 hreflang links point to 404 targets.

Cause: `src/layouts/Base.astro:33` builds the canonical as
`localizePath(path, locale)`, i.e. it prefixes the locale itself. But the localized pages pass
an **already-localized** `path` prop (`src/pages/de/notes/[slug].astro:41` passes
`/de/notes/${displaySlug}/`), so the URL comes out as `/de/de/notes/...`. The hreflang loop at
`Base.astro:51-54` re-localizes the same pre-localized path, producing garbage like
`/fr/de/notes/mcp-workstream/` for every alternate.

Affected (every de/fr/ru variant): `notes/index`, all 7 `notes/[slug]`, `projects/devswarm`,
`projects/devswarm-cv`, `projects/exocortex` (their `path=` props include the locale prefix).
Unaffected: home pages, `thesis` and `projects/index` variants (they pass unlocalized paths),
so the convention is inconsistent across pages, which is how the bug survived.

Consequence: Google treats a canonical pointing at a 404 as a broken signal and falls back to
its own guessing; hreflang clusters with 404 members are discarded (Google requires
bidirectional, resolvable alternates: see
https://developers.google.com/search/docs/specialty/international/localized-versions). The
non-EN half of the site is effectively cut off from clean indexing.

Impact: very high. Effort: low (one convention fix in Base.astro plus normalizing ~12 `path=`
props).
Files: `src/layouts/Base.astro`, `src/pages/{de,fr,ru}/notes/index.astro`,
`src/pages/{de,fr,ru}/notes/[slug].astro`, `src/pages/{de,fr,ru}/projects/{devswarm,devswarm-cv,exocortex}/index.astro`.
Recommended fix shape: Base.astro should require the **unlocalized** logical path and derive
everything from it (defensively strip a leading locale segment so a stray localized prop can
never double-prefix again).

### F2. CRITICAL: canonicals, hreflang, og:url point at 301 redirects (trailing slash)

All extensionless canonicals (e.g. `https://tomscholtes.com/projects`,
`/thesis`, `/de/thesis`, all localized project pages) point at URLs that 301 to the slash form
on GitHub Pages (verified live). The notes pages already use the slash form (correct); the rest
do not, again an inconsistent convention. Canonicals should point at the URL that answers 200:
https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

Internal links are also mixed on the homepage: both `href="/projects"` and `href="/projects/"`
occur, so crawlers burn a redirect hop on half the internal edges.

Impact: high. Effort: low (normalize to trailing-slash URLs in Base.astro canonical/hreflang/
og:url and in internal links; `astro.config.mjs` `trailingSlash` can stay as is since GitHub
Pages, not Astro, serves production).
Files: `src/layouts/Base.astro`, `src/i18n/index.ts` (`localizePath`), all `path=` props,
`src/components/Nav.astro`, `src/components/Footer.astro`, other components emitting internal hrefs.

### F3. CRITICAL: no sitemap.xml

83 pages, 4 locales, zero sitemap; live URL returns 404. For a small site Google will still
crawl, but the locale alternates and the case pages have almost no inbound links, and a sitemap
with hreflang annotations is the sanctioned way to declare the locale clusters
(https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap,
https://developers.google.com/search/docs/specialty/international/localized-versions).

Impact: high. Effort: low.
Recommended: generate `dist/sitemap.xml` in `scripts/post-build.mjs` (it already walks/patches
dist) by walking the built HTML. Include xhtml:link alternates for the 4-locale clusters.
Exclude: `lab/**` (noindex), `404` pages, `thesis.html` mirror (duplicate of `/thesis/`),
`projects/cv-onepager-artifact.html` (embed artifact). Skip `lastmod` unless it is accurate.
Files: `scripts/post-build.mjs`.

### F4. CRITICAL: no robots.txt

404 in production. Not blocking (absence means allow-all) but it is the discovery point for the
sitemap and the cheap way to keep noise out. Add a static `public/robots.txt` with a
`Sitemap: https://tomscholtes.com/sitemap.xml` line
(https://developers.google.com/search/docs/crawling-indexing/robots/intro).
Impact: medium-high. Effort: trivial.
Files: `public/robots.txt` (new).

### F5. HIGH: case pages (9) have no Open Graph, no Twitter card, no structured data

`public/case/*/index.html` are hand-built static pages. They do have good titles, meta
descriptions, and correct trailing-slash canonicals, but zero OG/Twitter tags (they render as
bare links when shared; these are exactly the pages a recruiter or hiring manager would share)
and no JSON-LD. They are EN-only, so hreflang is correctly absent; nothing to add there.
Impact: high (these are the strongest commercial pages). Effort: low (repeatable head block).
Files: all 9 `public/case/*/index.html`.

### F6. HIGH: workflow-automation page missing canonical; render-blocking Google Fonts

`public/workflow-automation/index.html` has title + description but **no canonical**, no
OG/Twitter, and it pulls Space Grotesk/Inter/JetBrains Mono from fonts.googleapis.com as
render-blocking CSS while the rest of the site self-hosts fonts. Third-party font CSS is a
performance and consistency regression on the page that runs the live demo.
Impact: high. Effort: low-medium (canonical + OG are trivial; self-hosting fonts there is a
bigger diff and can be deferred).
Files: `public/workflow-automation/index.html`.

### F7. HIGH: localized 404 routes are indexable 200 pages

`/de/404/`, `/fr/404/`, `/ru/404/` are served 200 by GitHub Pages, carry canonicals to
redirecting URLs, and are not noindexed (the root `404.html` is fine because GitHub Pages
serves it with a 404 status). The `noindex` prop already exists in Base.astro; the 404 pages
just do not set it.
Impact: medium. Effort: trivial.
Files: `src/pages/404.astro` (the three locale variants re-export it).

### F8. HIGH: notes have publishDate/tags/summary but no Article JSON-LD, no BreadcrumbList

7 notes x 4 locales = 28 content pages with frontmatter that maps 1:1 onto `Article`
(headline, description, datePublished, inLanguage, author -> the existing Person). Breadcrumbs
(Home > Notes > Title) are also cheap wins for SERP display
(https://developers.google.com/search/docs/appearance/structured-data/article,
https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).
Impact: medium-high. Effort: low (one component, wired into 4 slug pages).
Files: new `src/components/JsonLdArticle.astro`, `src/pages/{,de/,fr/,ru/}notes/[slug].astro`.

### F9. MEDIUM: JSON-LD coverage and depth

Person JSON-LD exists only on the 4 home pages (fine placement) but is thin: no `knowsAbout`,
no `alumniOf` (the thesis page already publishes Erasmus University Rotterdam, so it is
grounded), no `image`. No `WebSite` node at all; adding one with `inLanguage` and `publisher`
tightens the entity graph for a personal-brand site whose #1 query is the person's own name.
Impact: medium. Effort: low.
Files: `src/components/JsonLdPerson.astro`, `src/layouts/Base.astro`.

### F10. MEDIUM: meta description lengths out of range on key pages

Measured (chars): DE home 285, FR home 240, workflow-automation 224 (truncated in SERPs,
~150-160 char budget); notes index EN 78, 404s 22-27 (wasted space). Google rewrites snippets
freely but a well-sized description still wins the default
(https://developers.google.com/search/docs/appearance/snippet). DE home title is 79 chars and
will truncate (~600 px budget: https://developers.google.com/search/docs/appearance/title-link).
Impact: medium. Effort: low.
Files: `src/i18n/{de,fr,ru,en}.json` (`meta.*` keys), `public/workflow-automation/index.html`.

### F11. MEDIUM: OG image and favicon gaps

- One shared `og/default.png` for all 83 pages; acceptable baseline, but `og:image:alt` and
  `twitter:image:alt` are missing everywhere (accessibility of shares; https://ogp.me/).
- Favicon is SVG-only. Google's favicon documentation wants a crawlable icon at a multiple of
  48px and broad-format support; an ICO/PNG fallback plus `apple-touch-icon` covers Safari and
  older crawlers (https://developers.google.com/search/docs/appearance/favicon-in-search).
Impact: medium. Effort: low (make-og.mjs already renders PNG via sharp; reuse it to emit a
180x180 apple-touch-icon and a 48x48/512x512 PNG icon set).
Files: `src/layouts/Base.astro`, `scripts/make-og.mjs`, `public/`.

### F12. MEDIUM: stray/duplicate indexables

- `projects/cv-onepager-artifact.html`: bare artifact page, no canonical, thin; it is an embed
  target, should be `noindex` (https://developers.google.com/search/docs/crawling-indexing/special-tags).
- `thesis.html` mirror duplicates `/thesis/`; after F2 its canonical will point at `/thesis/`,
  which resolves the duplication; keep it out of the sitemap.
- `lab/**` is correctly noindexed, but `lab/index` and `lab/interactive` emit hreflang links to
  locale variants that do not exist; suppress hreflang on noindex pages.
Impact: low-medium. Effort: trivial.
Files: `public/projects/cv-onepager-artifact.html`, `src/layouts/Base.astro`,
`scripts/post-build.mjs` (sitemap exclusions).

### F13. LOW: heading order

Lighthouse flags `heading-order` on the homepage (h1 -> h2 -> h3 jumps inside sections).
Impact: low (a11y polish, marginal SEO). Effort: low but touches visual components; defer to a
design pass rather than this SEO branch.

### F14. Performance status (no blocking work needed)

Lighthouse lab (local preview, headless Chrome): performance 95, accessibility 98, SEO 100.
FCP 1.5 s, LCP 2.8 s, CLS 0.001, TBT 0 ms, Speed Index 1.5 s.
- LCP driver is the hero video poster (88 KB jpg); videos are click-to-play with
  `preload="metadata"` and posters, aspect-ratio is set (CLS is clean). Optional micro-win:
  `fetchpriority="high"` preload for the hero poster (https://web.dev/articles/optimize-lcp).
- Fonts: 3 woff2 files preloaded, self-hosted, `font-display: swap`: correct per
  https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload.
- One render-blocking stylesheet from Astro (small, inlineStylesheets auto): fine.
- The only real perf offender is the Google Fonts CSS on workflow-automation (F6).
- Core Web Vitals thresholds for reference: https://web.dev/articles/vitals.

### F15. Content and keyword assessment (grounded in what the site already publishes)

Realistic ranking targets, in order of winnability:
1. **"Tom Scholtes"** (navigational, the money query for a job-search site). Needs: clean
   indexing of the EN cluster (F1/F2), WebSite + richer Person JSON-LD (F9), stable OG. The
   name also appears in every title suffix: good.
2. **Long-tail AI-agent queries the notes already own textually**: "MCP workstream",
   "token economy principle" (agents), "self-hosted RAG on Claude Max", "personal AI
   exocortex", "when the assistant sleeps" (memory consolidation). These are low-competition,
   high-specificity phrases; Article JSON-LD (F8) plus fixed canonicals are the unlock.
   "Model Context Protocol" is already spelled out in the MCP note and in `en.json`, so meta
   copy may use the expanded term without inventing anything.
3. **"finance ops engineer Luxembourg" / "workflow automation regulated finance / fund
   services"**: the homepage and workflow-automation page carry exactly this language; the
   case pages reinforce it. F5/F6 make these pages shareable and canonical.
4. **"Augmented Gravity Model"** (thesis): unique term, effectively ownable as-is once
   canonicals stop pointing at redirects.

Per-locale: all 4 locales have translated titles/descriptions with sensible localized keyword
use (DE "Finance-Ops-Engineer", RU "автоматизирующий работу", FR "automatise le travail").
No keyword gaps worth new copy beyond the length trims in F10. No fabricated facts required or
permitted; all copy edits must reuse published claims only.

### F16. Crawlability/indexability on GitHub Pages, summary of specifics

- No server-side control (no redirects, no headers): all fixes must be build-output level.
  That is why F2 (align to the host's forced trailing slash) is the only viable direction.
- CNAME present, https + www redirects correct, custom 404 correct at root.
- robots.txt and sitemap.xml are plain static files; F3/F4 are fully compatible.
- The `dist/` output is deployed to the `tomscholtes93-collab.github.io` repo; nothing in this
  branch pushes or deploys (out of scope by order).

## Implementation order for Phase 2 (impact x effort)

1. F1 + F2 together (one URL-layer fix in Base.astro + path props + internal links).
2. F3 sitemap generator in post-build.mjs, then F4 robots.txt.
3. F7 noindex 404s; F12 noindex artifact + hreflang suppression on noindex.
4. F5 case pages OG/Twitter; F6 workflow-automation canonical + OG (fonts optional).
5. F8 Article + BreadcrumbList JSON-LD on notes (all 4 locales).
6. F9 WebSite + enriched Person JSON-LD.
7. F10 meta length trims per locale; F11 og:image:alt/twitter:image:alt + PNG/apple-touch icons.
Deferred (needs Tom's decision or a design pass): F13 heading order, per-page OG images,
self-hosting fonts on workflow-automation, `lastmod` in sitemap.

## Sources

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/crawling-indexing/special-tags
- https://web.dev/articles/vitals
- https://web.dev/articles/optimize-lcp
- https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload
- https://ogp.me/

All URLs verified reachable (HTTP 200) on 2026-07-02.

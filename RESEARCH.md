# RESEARCH.md — tomscholtes-subpage-i18n-2026-05-25

## Libraries

Zero new dependencies (acceptance criterion 13). Every capability is either already in V3+PR #8 or a built-in browser / Astro 5 / Node API.

| Name | Version | Purpose | Link |
|---|---|---|---|
| Astro | ^5.0.0 (existing) | Static build, file-based routing, content collections | https://docs.astro.build/en/getting-started/ |
| Astro 5 content collections (legacy `type: 'content'`) | Astro 5 builtin | Per-locale subdirectory routing of note `.md` files | https://docs.astro.build/en/guides/content-collections/ |
| Astro 5 built-in i18n | Astro 5 builtin | Locale-prefixed routes (config from PR #8) | https://docs.astro.build/en/guides/internationalization/ |
| `astro:transitions` lifecycle events | Astro 5 builtin | `astro:after-swap`, `astro:page-load` for self-healing LangSwitcher | https://docs.astro.build/en/guides/view-transitions/#lifecycle-events |
| `astro:transitions` `ClientRouter` | Astro 5 builtin | SPA-style cross-page nav (existing in `Base.astro:6`) | https://docs.astro.build/en/guides/view-transitions/#full-site-view-transitions-spa-mode |
| Astro `is:inline` directive | Astro 5 builtin | Non-bundled `<script>` for the self-healing handler | https://docs.astro.build/en/reference/directives-reference/#isinline |
| `CollectionEntry<'notes'>` typing | `astro:content` builtin | Strongly typed entries in `getStaticPaths` props | https://docs.astro.build/en/reference/modules/astro-content/#collectionentry |
| `Intl.DateTimeFormat` | ECMA-402 (platform) | Locale-aware `publishDate` (already wired via `localeDateFmt`) | https://tc39.es/ecma402/#datetimeformat-objects |
| Node `node:fs` `readdirSync` / `statSync` | Node 20+ stdlib | `check-notes.mjs` one-level recursion | https://nodejs.org/api/fs.html#fsreaddirsyncpath-options |
| `git mv` | git ≥ 2.x | Preserve file history through locale subdirectory move | https://git-scm.com/docs/git-mv |
| GNU grep / ripgrep `-P` | host tool | Em-dash `\xe2\x80\x94` and leakage audits | https://www.gnu.org/software/grep/manual/grep.html |
| `URL.pathname` (DOM) | Living Standard | Self-healing href computation from `window.location.pathname` | https://url.spec.whatwg.org/#dom-url-pathname |
| WHATWG HTML `lang=` attribute | Living Standard | Per-locale root-element `lang` (already wired) | https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes |

Explicitly **not used**:

| Library | Reason rejected |
|---|---|
| Astro 5 Content Layer (`loader: glob({...})`) | PLAN keeps the legacy `type: 'content'` API (`entry.slug`). The Content Layer API uses `entry.id` and would change slug semantics mid-batch. |
| `astro-i18next` / `@astrolicious/i18n` / community i18n integrations | Hard rule: zero new runtime deps. Astro 5 built-in covers the routing. |
| `remark-directive`, `remark-frontmatter` extensions | Astro's default markdown pipeline already covers frontmatter; no inline directive syntax in scope. |
| `rehype-sanitize` | Notes are authored by Tom + translators — trusted source. Adding sanitisation would be a new runtime dep. |

## Reference patterns

### 1. Per-locale subdirectory in a `type: 'content'` collection

Source: Astro docs, "Querying collections" + slug derivation rules — https://docs.astro.build/en/guides/content-collections/#querying-collections

```
src/content/notes/
  config.ts                 # Zod schema (unchanged)
  en/
    mcp-workstream.md       # entry.slug === 'en/mcp-workstream'
    self-hosted-rag-claude-max.md
    the-remembering-assistant.md
    token-economy-principle.md
  de/                       # entry.slug === 'de/<name>'
    mcp-workstream.md
    …
  fr/  …
  ru/  …
```

Astro derives `entry.slug` from the path of the markdown file **relative to the collection root**, with the `.md` extension stripped. Subdirectories become slash-separated slug segments. There is no special "locale" frontmatter field needed — the locale prefix lives in the slug itself, which is exactly what the per-locale `getStaticPaths` filter exploits.

### 2. `getStaticPaths` filtering by locale-prefixed slug

Source: Astro docs, "Generating routes from data" — https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content

```ts
// src/pages/notes/[slug].astro (EN canonical)
export async function getStaticPaths() {
  const entries = await getCollection('notes', ({ data, slug }) =>
    data.status === 'published' && slug.startsWith('en/'));
  return entries.map((entry) => ({
    params: { slug: entry.slug.replace(/^en\//, '') },
    props: { entry },
  }));
}
```

```ts
// src/pages/de/notes/[slug].astro
export async function getStaticPaths() {
  const entries = await getCollection('notes', ({ data, slug }) =>
    data.status === 'published' && slug.startsWith('de/'));
  return entries.map((entry) => ({
    params: { slug: entry.slug.replace(/^de\//, '') },
    props: { entry },
  }));
}
```

`params.slug` is the URL-visible slug (`mcp-workstream`), so URLs stay clean: `/notes/mcp-workstream/` and `/de/notes/mcp-workstream/`. The full `entry.slug` (`en/mcp-workstream`) lives only on the entry object passed via `props`.

### 3. Self-healing `is:inline` LangSwitcher script

Source: Astro docs, "View Transitions lifecycle events" — https://docs.astro.build/en/guides/view-transitions/#lifecycle-events and WHATWG URL spec — https://url.spec.whatwg.org/

```html
<!-- Append to src/components/LangSwitcher.astro -->
<script is:inline>
  (function () {
    function currentLocale() {
      var m = window.location.pathname.match(/^\/(de|fr|ru)(\/|$)/);
      return m ? m[1] : 'en';
    }
    function fix() {
      var here = window.location.pathname.replace(/^\/(de|fr|ru)(\/|$)/, '/');
      if (!here.startsWith('/')) here = '/' + here;
      var loc = currentLocale();
      document.querySelectorAll('.lang-switcher a.lang-switch').forEach(function (a) {
        var code = (a.getAttribute('hreflang') || '').toLowerCase();
        a.setAttribute('href', code === 'en' ? here : '/' + code + (here === '/' ? '/' : here));
        if (code === loc) {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'true');
        } else {
          a.classList.remove('is-active');
          a.removeAttribute('aria-current');
        }
      });
    }
    document.addEventListener('astro:after-swap', fix);
    document.addEventListener('astro:page-load', fix);
  })();
</script>
```

The `astro:page-load` event fires on every page including the initial document load. The `astro:after-swap` event fires after a View Transition swap completes but before scripts on the new page re-execute. Listening to both events covers all entry paths — first navigation, View Transition swap, full-page reload, and back/forward cache restore. The IIFE binds listeners only once (the listeners survive swaps because `document` itself is not swapped).

### 4. Full per-locale notes detail page (Option 1, Option B-style structure)

Source: PLAN.md FE-T3 (lines 280–351). Critical detail — `getCollection` is called twice (once for the slug filter in `getStaticPaths`, once for the `related` filter at render time):

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

const relatedEntries = entry.data.related.length
  ? await getCollection('notes', ({ data, slug }) =>
      data.status === 'published' &&
      entry.data.related.map((r) => `de/${r}`).includes(slug))
  : [];
---
```

**Key detail:** `entry.data.related` stores **bare slugs** (`['mcp-workstream']`), not locale-prefixed (`['de/mcp-workstream']`). The page-side filter prepends the locale prefix when matching against the full `slug` field of related entries. This keeps frontmatter portable across locales: the same `related: ['mcp-workstream']` line works in EN, DE, FR, RU frontmatter.

### 5. Removing `transition:persist` from Nav

Source: Astro docs, "transition:persist" — https://docs.astro.build/en/guides/view-transitions/#transitionpersist

```diff
- <header class="nav" id="site-nav" data-open="false" transition:persist transition:name="site-nav">
+ <header class="nav" id="site-nav" data-open="false">
```

After removal, the Nav re-renders on every navigation. The LangSwitcher (mounted inside Nav) is rebuilt with hrefs computed against `Astro.url.pathname` of the destination page — fixing the routing bug at the source. The hamburger toggle script at `Nav.astro:44–65` continues to function because it re-binds on `astro:page-load`. Reference: https://docs.astro.build/en/guides/view-transitions/#script-behavior.

### 6. `check-notes.mjs` one-level recursion

Source: Node `fs.readdirSync` + `fs.statSync` API — https://nodejs.org/api/fs.html

```js
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NOTES_DIR = 'src/content/notes';
const LOCALES = ['en', 'de', 'fr', 'ru'];
const files = [];

for (const top of readdirSync(NOTES_DIR)) {
  const topPath = join(NOTES_DIR, top);
  const topStat = statSync(topPath);
  if (topStat.isFile() && top.endsWith('.md')) {
    files.push(topPath);
  } else if (topStat.isDirectory() && LOCALES.includes(top)) {
    for (const f of readdirSync(topPath)) {
      const fPath = join(topPath, f);
      if (f.endsWith('.md') && statSync(fPath).isFile()) {
        files.push(fPath);
      }
    }
  }
}
```

Allowlist-based directory walk: only descends into `{en,de,fr,ru}/`, skips `config.ts` (not a `.md`), skips any future stray directories. Backward-compatible with any legacy top-level `.md` (none expected after FE-T2 completes, but defensive).

### 7. `git mv` for file moves with history preservation

Source: git docs — https://git-scm.com/docs/git-mv

```bash
mkdir -p src/content/notes/{en,de,fr,ru}
git mv src/content/notes/mcp-workstream.md           src/content/notes/en/mcp-workstream.md
git mv src/content/notes/self-hosted-rag-claude-max.md src/content/notes/en/self-hosted-rag-claude-max.md
git mv src/content/notes/the-remembering-assistant.md  src/content/notes/en/the-remembering-assistant.md
git mv src/content/notes/token-economy-principle.md    src/content/notes/en/token-economy-principle.md
```

git records the move as a rename when the file content is unchanged (default similarity threshold 50%). `git log --follow src/content/notes/en/mcp-workstream.md` traces back through the move. **Avoid `mv` followed by `git add -A`** — git can detect the rename heuristically but the operation is less precise.

### 8. NoteCard slug strip pattern

Source: PLAN.md FE-T5

```astro
---
const { entry } = Astro.props;
const displaySlug = entry.slug.replace(/^(en|de|fr|ru)\//, '');
const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const href = localizePath(`/notes/${displaySlug}/`, locale);
const fmt = localeDateFmt(locale);
---
<a href={href} class="note-card" data-astro-prefetch>
  <span class="note-card-path mono">/notes/{displaySlug}/</span>
  <h3 class="serif" transition:name={`note-title-${displaySlug}`}>{entry.data.title}</h3>
  <p class="eyebrow mono">{fmt.format(entry.data.publishDate)}</p>
  <p>{entry.data.summary}</p>
</a>
```

The `transition:name` MUST use `displaySlug` (not `entry.slug`) so the `note-title-mcp-workstream` morph pairs across locales identically. Using `entry.slug` would produce four distinct names (`note-title-en/mcp-workstream`, `note-title-de/mcp-workstream`, …) — the morph would not pair across locale boundaries when a user clicks `FR` from a card, but **that morph pairing isn't desired anyway** (different language content, no visual continuity expected). The argument for `displaySlug` is consistency with the destination page's `transition:name`, which already uses `displaySlug`. Stay consistent: both ends use `displaySlug`.

### 9. Per-locale project subpage pattern (Option B)

Source: PLAN.md FE-T7. Mirror EN structure with translated text nodes; preserve JSX components, classnames, paths:

```astro
---
// src/pages/de/projects/devswarm/index.astro
import Base from '../../../../layouts/Base.astro';
import Nav from '../../../../components/Nav.astro';
import Footer from '../../../../components/Footer.astro';
import NoteLink from '../../../../components/NoteLink.astro';
import ArchitectureDevSwarm from '../../../../components/ArchitectureDevSwarm.astro';
import { t as translate, getLocale, type Locale } from '../../../../i18n';

const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const t = (k: string) => translate(k, locale);
---
<Base
  title={t('meta.projects.devswarm.title')}
  description={t('meta.projects.devswarm.description')}
  path="/de/projects/devswarm/"
>
  <Nav active="projects" />
  <main>
    <section>
      <div class="container">
        <article class="prose">
          <p class="eyebrow mono">/ projects / devswarm</p>
          <h1 class="serif">DevSwarm</h1>
          <p class="sub">{/* translated lede in German */}</p>
          <ArchitectureDevSwarm />
          {/* … translated prose body … */}
          <p>{/* translated paragraph mentioning */} <NoteLink slug="mcp-workstream">{/* DE label */}</NoteLink> {/* tail */}</p>
        </article>
      </div>
    </section>
  </main>
  <Footer />
</Base>
```

The `<NoteLink slug="mcp-workstream">` slug stays bare — `NoteLink.astro` (read-only) is responsible for prefixing the active locale. If `NoteLink.astro` does NOT currently localize, verify during FE-T1: it must use `localizePath(\`/notes/${slug}/\`, locale)` internally for the routing fix to extend to inline note references.

### 10. Frontmatter shape per locale note

Source: PLAN.md "Frontmatter contract per locale file"

```yaml
---
title: "Der MCP-Workstream"
slug: "mcp-workstream"
summary: "Outlook und Monday.com über MCP in Claude Code anbinden, und was das über den Umfang der Automatisierung lehrt."
publishDate: 2026-05-16
tags: ["mcp", "automatisierung", "tools"]
related: ["self-hosted-rag-claude-max"]
sources:
  - label: "Persönliches Notion — MCP-Workstream-Briefing"
    kind: notion
  - label: "Anthropic MCP-Spezifikation"
    kind: external
status: published
---
```

**`publishDate` is the same calendar date across all locales** — translations are not chronologically distinct works. **`related` contains bare slugs** (no locale prefix) — the rendering page applies the prefix. **`kind` is an enum discriminator and never translated.** **`status` is `published` (or `draft`).**

### 11. Lifecycle event ordering — `astro:page-load` vs `astro:after-swap`

Source: Astro docs, "Lifecycle events" — https://docs.astro.build/en/guides/view-transitions/#lifecycle-events

| Event | Fires on |
|---|---|
| `astro:page-load` | Initial page load AND end of every view transition. Bubbles on `document`. |
| `astro:after-swap` | After the new page DOM is in place, before scripts on the new page execute. Bubbles on `document`. |
| `astro:before-swap` | Right before DOM is swapped. Cancellable. |
| `astro:before-preparation` | Before navigation prep begins. |

The self-healing handler binds to both `astro:after-swap` (covers View Transition navigations) and `astro:page-load` (covers initial load and back/forward cache). On a View Transition navigation, both fire — the handler runs twice, but the operation is idempotent (it just rewrites hrefs and class lists from the current `window.location.pathname`).

## Gotchas

- **`entry.slug` includes the directory path.** This is the linchpin of Option 1. After the move, `entry.slug === 'en/mcp-workstream'` (NOT `'mcp-workstream'`). Every code site that previously used `entry.slug` to compose a URL or a `transition:name` MUST strip the locale prefix. PLAN identifies the sites (`NoteCard.astro`, `pages/notes/index.astro`, `pages/notes/[slug].astro`, and the per-locale equivalents). Grep audit: `grep -rn 'entry\.slug' src/` should return only sites that explicitly handle the prefix. Reference: https://docs.astro.build/en/guides/content-collections/#defining-custom-slugs.
- **Legacy `type: 'content'` vs Content Layer API.** Astro 5 introduced a new Content Layer with `loader: glob({...})` syntax where `entry.id` replaces `entry.slug`. The PLAN keeps the legacy `type: 'content'` API — `entry.slug` is the correct field. **Do NOT migrate to Content Layer mid-batch.** If `src/content/notes/config.ts` is somehow already Content Layer (verify in FE-T1), the slug-strip code must use `entry.id` instead, and `getCollection` filters must match on `id` rather than `slug`. Reference: https://docs.astro.build/en/guides/upgrade-to/v5/#legacy-v20-content-collections-api.
- **`transition:persist` removes element re-render across navigations.** That's exactly what PR #8 wanted for hamburger state stability, but the side-effect is that *any* dynamic content inside the persisted element freezes at first render. The LangSwitcher was the casualty. Removing the directive returns Nav to standard behavior. **Verify no other inline state lives in Nav that depends on persistence.** Search for `useState`-style patterns or `data-*` attributes mutated by the existing hamburger script — if the hamburger relies on `data-open` value persisting across nav, the toggle will reset to closed on every page (which is the desired UX for a hamburger anyway).
- **Idempotency of the self-healing script on cold load.** On `astro:page-load` for the initial document, the server-rendered `<a>` tags ALREADY have correct hrefs (computed by `LangSwitcher.astro` at build time per page). The script runs and recomputes the same hrefs — no visible change. Cost: one DOM read + four `setAttribute` calls. Negligible.
- **Double-firing on transitions.** Both `astro:after-swap` and `astro:page-load` fire on every View Transition navigation. The script runs twice. Confirm idempotency: the second call computes the same hrefs as the first because `window.location.pathname` doesn't change between the two events. Safe. If you want to dedupe, gate on a `data-i18n-fixed-at` timestamp — not necessary.
- **Inline script with `is:inline` runs once on cold load, NOT re-executed on swaps.** This is the **opposite** of what some V3 patterns expect. The script's `document.addEventListener` calls register handlers that DO fire on every subsequent event — that's the mechanism. The body of the script (the IIFE) runs exactly once per cold load. References that need to "re-execute on every page" go inside the event handler, not the IIFE body. Reference: https://docs.astro.build/en/guides/view-transitions/#script-behavior.
- **`is:inline` skips Vite processing.** No TypeScript, no module resolution, no minification. The script must be plain ES5-compatible JS (`function ()`, `var`, `forEach`). Don't use `const`, `let`, arrow functions in `is:inline` unless you've verified all target browsers support them. The PLAN's example uses `var` and `function ()` — correct.
- **`hreflang` attribute case.** The self-healing script reads `a.getAttribute('hreflang')` and lowercases. The build-time `LangSwitcher.astro` emits `hreflang={code}` where `code` is lowercase. Consistent. If a future change emits uppercase or mixed case, the script's locale matching breaks silently — defensive lowercase is correct.
- **`getCollection` non-recursive vs recursive.** `getCollection('notes')` returns ALL entries from ALL subdirectories of `src/content/notes/`. The subdirectory walk happens at the collection level, not per-call. So the locale filter in `getStaticPaths` is doing string-prefix matching on already-discovered entries, not a directory scan. Performance is irrelevant at this scale (~16 entries).
- **Frontmatter `slug` field vs derived slug.** The PLAN frontmatter contract retains `slug: "mcp-workstream"` (bare slug). Astro's legacy content collections allow a `slug:` frontmatter field to override the derived slug. **If `slug` is in frontmatter, it OVERRIDES the directory-derived path.** That would defeat the per-locale filter — `entry.slug` would be `'mcp-workstream'` for every locale, breaking the filter. Two resolutions:
  - **(A) Remove `slug:` from frontmatter** — let Astro derive it from the path. Cleanest.
  - **(B) Keep `slug:` and put the locale prefix in it** — `slug: "en/mcp-workstream"` in the EN file, `slug: "de/mcp-workstream"` in the DE file. Verbose but explicit.
  
  PLAN appears to assume the derived slug works (the filter is `slug.startsWith('en/')`). Verify Frontend reads the existing `mcp-workstream.md` frontmatter during FE-T1 — if `slug:` is present, **strip it before the `git mv`** (or apply option B). Reference: https://docs.astro.build/en/guides/content-collections/#defining-custom-slugs.
- **`entry.render()` Promise.** Must be awaited. `const { Content } = await entry.render();`. Forgetting the `await` produces a confusing runtime error.
- **`getStaticPaths` runs ONCE per build per file.** With static output, each `[slug].astro` enumerates its paths exactly once. Adding a 17th note requires a rebuild + deploy. Same constraint as PR #8.
- **`related` filter performance.** `getCollection('notes', filter)` runs the filter against every entry. For 16 entries × 4 locale pages = 64 filter passes per build. Negligible. If the collection grows to thousands, switch to a pre-computed map. Not in scope.
- **`getCollection` is called inside the `getStaticPaths` of each per-locale page AND inside the rendering frontmatter of each detail page (for `related`).** That's two scans per page render. Astro caches the collection load, so this is one disk read + multiple in-memory scans. No optimization needed.
- **`Astro.currentLocale` returns `undefined` on routes outside the `locales` list.** With `locales: ['en', 'de', 'fr', 'ru']` in `astro.config.mjs`, any route that doesn't start with `/de/`, `/fr/`, `/ru/` resolves to `locale: undefined` if `prefixDefaultLocale: false`. Defensive: `Astro.currentLocale ?? getLocale(Astro.url)`. Always.
- **The PR #8 LangSwitcher computed hrefs at build time.** Each per-page output had hrefs correct for THAT page (the bug was View Transitions reusing a stale rendered Nav, not the build-time computation). After the fix:
  - Without `transition:persist`: each navigation re-renders Nav with correct build-time hrefs. No script needed in theory.
  - With self-healing script: hrefs are also corrected client-side after every navigation. Defense in depth.
- **The `criterion 10` href grep.** The acceptance script extracts hrefs by parsing HTML with grep regex. This is fragile — attribute order, whitespace, and quoting can vary. The script assumes `class="lang-switch …" hreflang="…"` in that order. Astro's `class:list` directive emits attributes in source order — verify the LangSwitcher template's attribute order (`href` first, then `class:list`, then `hreflang`, then `aria-current`). If the order changes, the grep needs adjustment. Reference: https://html.spec.whatwg.org/multipage/syntax.html#attributes-2 (attribute order is not semantic).
- **Wrapper page tree from PR #8.** The existing thin `<IndexPage />` re-imports at `src/pages/{de,fr,ru}/index.astro`, `thesis.astro`, `404.astro`, `projects/index.astro` remain unchanged. Only the notes pages and project subpages get the full-file treatment. Verify the thin re-import pattern still works for `Astro.currentLocale` inheritance (it does — the wrapper's URL determines the locale, not the imported component's location).
- **JSON `require` in criterion 16 acceptance check.** The PLAN's Node one-liner uses `require()` on JSON. Node ESM doesn't allow `require` by default — the script must be `.cjs` or use `--input-type=commonjs`. Or use the `jq` fallback the PLAN already documents. Reviewer-Deployer should default to the `jq` fallback for portability:
  ```bash
  for L in de fr ru; do
    diff <(jq -r 'keys[]' src/i18n/en.json | sort) <(jq -r 'keys[]' src/i18n/$L.json | sort)
  done
  echo OK
  ```
- **`<iframe>` in project subpages.** PLAN mentions `<iframe>` in the EN body. iframes have a `src` attribute and may have a `title` attribute that is user-facing — translate the `title` per locale; do NOT translate `src`. If the iframe shows code or a demo, ensure the demo doesn't itself need localization (likely a static asset → unchanged).
- **`<pre>` and `<code>` blocks.** Code blocks stay literal across all locales. Translator must NOT translate variable names, function names, error messages inside `<pre>` / `<code>`. If a code block has surrounding prose explaining it, only the prose translates.
- **`<dl>` glossary structures.** `<dt>` term + `<dd>` definition. Both translate. Maintain the term-to-definition pairing exactly.
- **Em-dash in markdown auto-conversion.** Astro's default markdown pipeline does NOT do SmartyPants conversion (`--` → en-dash, `---` → em-dash) unless `markdown.smartypants: true` is set in `astro.config.mjs`. Verify during FE-T1; the PR #8 config likely doesn't enable it (V3 baseline). If it IS enabled, a literal `---` in note body becomes `—` in HTML, passing the source-grep but failing a `dist/` grep. Run the em-dash audit against `dist/` too (criterion 8 attempts this).
- **`<h2>`, `<h3>` heading translations.** Translate heading text. Preserve heading levels — don't promote `<h3>` to `<h2>` because German titles are longer. Keep the visual hierarchy intact.
- **DE word length and layout.** German words are 30–50% longer on average than English. The PLAN's "CSS layout invariance" requirement (criterion 14 — no style changes) means long DE words may cause wrapping issues. Test in browser during FE-T13. If a heading breaks the layout, the answer is NOT to widen the container — it's to rephrase the DE heading to be shorter while staying faithful. Translator judgment.
- **RU Cyrillic font availability.** V3 uses Instrument Serif + Inter + JetBrains Mono. **Verify Cyrillic glyph coverage** in each. If Inter / JetBrains Mono are subset to Latin only (PR #8 may have done this), Cyrillic text falls back to the system font — visually inconsistent. Check `public/fonts/` woff2 files via `pyftsubset --help` or `fc-query` for the unicode-ranges. If subset-Latin, add a Cyrillic subset (cost: zero new deps, just a build script update) or note it as a known cosmetic issue in the PR.
- **`copy-fonts.mjs` is read-only in this batch.** If fonts need re-subsetting, that's a separate batch. For this PR, RU body text may render in the system font fallback. Acceptable for the deliverable; flag in PR notes.
- **NoteLink locale awareness.** `<NoteLink slug="mcp-workstream">` is used in `Now.astro` and the project subpages. Verify `NoteLink.astro` reads `Astro.currentLocale` and routes to `/notes/...` for EN or `/<locale>/notes/...` for non-EN. If it currently hardcodes `/notes/...`, every note link from DE pages will jump to the EN note. **This may be the second LangSwitcher-shaped bug.** Check `NoteLink.astro` source during FE-T1; if it doesn't localize, that's an additional MODIFY (not in PLAN). Surface to Architect/orchestrator immediately if so.
- **`relatedEntries` source-of-truth.** The detail page filters `getCollection('notes', ...)` for related entries with the current locale prefix. If a DE note's `related: ['mcp-workstream']` references a slug that only exists in EN (no DE translation yet), the related entry is empty for DE. Acceptable — links to "missing" related entries should NOT render. The filter already handles this: missing matches = empty array = section skipped (per the existing `relatedEntries.length > 0` guard).
- **PR #8 `package.json` build chain.** The PLAN explicitly notes `package.json:8` build chain unchanged. Frontend MUST NOT touch this line. The order `check-i18n && check-notes && copy-fonts && make-og && astro build && post-build` is the contract.
- **`check-notes.mjs` line 13 is the only modification.** Don't refactor the script. Add the recursion, update the success message count if needed, ship.
- **Translation quality and verification.** Reviewer-Deployer can spot-check via criterion 6 (byte-inequality between EN and DE first paragraphs). That's a "did somebody translate" check, not a "is the translation good" check. Quality review is on Tom post-merge. Translators should self-review against the register rules (DE Sie, FR vouvoiement, RU «вы»).
- **`grep -A 0` and `head -c` in criterion 6.** `grep -A 0` is equivalent to no `-A` flag (no context lines). The script then takes the first 200 chars of the first `<p>` line. If the first `<p>` is empty or contains only whitespace, the check passes trivially (both EN and translated would be "<p>\n"). Defensive: check `head -c 500` and verify non-trivial content. Optional hardening.
- **MAIN_SHA capture in FE-T1.** Critical for drift detection. If `origin/main` has moved since the workspace was cloned, refreshing tracked files is mandatory. Skipping this step is exactly how PR #8's lessons were forged. Reviewer-Deployer should verify `SHA.txt` is present and DRIFT_REPORT was acted on.

## Security

The threat surface is unchanged from PR #8 except for the inline self-healing script, the per-locale `.astro` pages, and the markdown content authored by translators. All three are evaluated below.

- **XSS via the self-healing `is:inline` script.** The script reads `window.location.pathname` (browser-controlled) and writes to `setAttribute('href', ...)`. The pathname is a string, but it's interpolated into URL strings (`'/' + code + here`). A pathological pathname like `/de/" onload="alert(1)/` would NOT be interpreted as an attribute value because `setAttribute` properly handles attribute values — the browser API escapes attribute boundaries automatically. Reference: https://dom.spec.whatwg.org/#dom-element-setattribute. **Not vulnerable** to attribute injection via pathname. The pathname is also constrained by the URL spec to URL-safe characters; spaces and quotes would be percent-encoded.
- **`window.location.pathname` regex match safety.** `match(/^\/(de|fr|ru)(\/|$)/)` matches only the literal `de|fr|ru` segments at the start of the path. Any user-supplied path component beyond the prefix is untrusted — but the script does NOT execute or eval it, only string-concatenates into href values that go through `setAttribute`. Safe.
- **CSP and `is:inline` scripts.** Inline scripts require `script-src 'unsafe-inline'` in CSP. V3 already requires this (per V3 RESEARCH.md). The new script adds nothing new to CSP requirements. If a CSP nonce is in use, `is:inline` scripts on Astro 5 may need `is:inline define:vars={{}}` or a manual nonce attribute. Check the V3 deployment — likely no CSP is set (GitHub Pages default has no CSP), so this is moot.
- **`is:inline` script and supply chain.** No external imports, no `<script src="...">`. Zero supply chain delta. The script is committed source, reviewed in PR, immutable post-merge.
- **XSS via translated markdown bodies.** Astro's default markdown pipeline does NOT sanitize HTML embedded in markdown. A translator could include `<script>alert(1)</script>` in a translated note body and it would render. **Mitigation:** translators are Tom + trusted translator subagents; PR review is the merge gate. Defensive option: add a regex to `check-notes.mjs`:
  ```js
  if (/<\s*script|on\w+\s*=|javascript:/i.test(body)) {
    issues.push(`html risk ${file}`);
  }
  ```
  Cost: one regex. Catches the three classic markdown XSS vectors. Recommend adding as part of FE-T6 alongside the recursion change.
- **XSS via translated `<a href="…">` in markdown.** Markdown link `[click](javascript:alert(1))` produces `<a href="javascript:alert(1)">` in some processors. Astro's default remark-rehype pipeline **strips `javascript:` URL schemes** at the link transformation stage. Confirm by checking `@astrojs/markdown-remark` defaults (it uses GFM + URL-safe link filtering). Reference: https://github.com/remarkjs/remark-rehype/blob/main/lib/handlers/link.js. Defensive grep in `check-notes.mjs` (above) catches this too.
- **XSS via project subpage `.astro` files.** Per-locale `.astro` pages are Astro source files — they CAN contain arbitrary JSX and `set:html` sinks. **The PLAN forbids new `set:html` usage** (no mention in FE-T7/T8). Translators copy the EN structure and translate text nodes only. Audit: `grep -n 'set:html' src/pages/{de,fr,ru}/projects/` should return ZERO matches. Add as a recommended Reviewer-Deployer check.
- **JSX component preservation discipline.** Translators must preserve `<NoteLink slug="…">`, `<ArchitectureDevSwarm />`, `<ArchitectureExocortex />` invocations verbatim. A translator who renames `<NoteLink slug="mcp-workstream">` to `<NoteLink slug="mcp-arbeitsstrom">` would break the link (no such slug exists). Translator rule: NEVER translate `slug=` values. The body of `<NoteLink>...</NoteLink>` (the displayed label) IS translated; the `slug` attribute is NOT.
- **Frontmatter injection.** Zod schema validates frontmatter shape. Any unexpected field is silently allowed (Zod default is permissive). Add `.strict()` to the schema if exact shape is wanted — but this would require updating `src/content/notes/config.ts` which is marked READ-ONLY in the PLAN. Skip for this batch; revisit if drift is observed.
- **`publishDate` consistency.** Translations should not alter `publishDate` (translations are not new works). If a translator updates the date, sort order in `getCollection` changes — translated note appears at the wrong position. Translator rule; verifiable by `diff` against EN frontmatter.
- **Slug consistency across locales.** Frontmatter `slug` field (if present) must match per locale's filename (or be absent so Astro derives it). A mismatch would route the note to a wrong URL. **Best:** remove `slug:` from frontmatter entirely; let Astro derive.
- **`sources[].kind` enum constraint.** Zod restricts `kind` to `'notion' | 'memory' | 'site' | 'external'`. Translators MUST NOT change `kind`. Translate the `label` only.
- **Information disclosure via untranslated content.** If a translator forgets to translate a section, the English text appears in the DE/FR/RU page. Acceptance criterion 6 catches the first paragraph; downstream paragraphs are not gated. Translators should self-check word-by-word against the EN source. Defensive: build a "translation coverage" diff — count of `<p>` tags per locale page vs EN. Optional enhancement.
- **`relatedEntries` cross-locale prevention.** The locale-scoped filter prevents accidental cross-locale linking. A DE note's "Related" section will NEVER link to an EN note even if the slug matches but no DE translation exists yet (the filter returns empty). Correct behavior; better to show nothing than to dump a user from DE to EN context.
- **Leakage list scope (criterion 9).** Word-boundary regex over `src/i18n/`, `src/content/notes/`, `src/pages/{de,fr,ru}/`, `src/components/LangSwitcher.astro`. Pre-existing leakage in `src/components/CV.astro:12` and `src/content/caseStudies.ts:75–82` is OUT OF SCOPE (per PR #8 conflict resolution). Document this in PR description with the file:line pointers so future audits don't relitigate.
- **Russian translator and brand-name discipline.** Brand names (`DevSwarm`, `Claude`, `Astro`, `MCP`, etc.) stay in Latin script in RU prose. Per RU professional convention. The translator must NOT transliterate to Cyrillic (`Клод`, `Астро`) — would harm searchability and brand consistency.
- **CWE-79 (XSS).** Defended by (a) Astro auto-escape on JSX expressions, (b) no new `set:html` introduced, (c) optional `check-notes.mjs` HTML-injection regex (recommended), (d) trusted-translator model + PR review, (e) per-locale `.astro` file diff review.
- **CWE-918 (SSRF) / CWE-22 (Path Traversal).** N/A — static site, no server, no filesystem reads at runtime.
- **CWE-200 (Information Exposure).** Mitigated by leakage grep (criterion 9). Pre-existing exposure in CV.astro / caseStudies.ts is unchanged; document but do not gate.
- **CWE-1035 (OWASP A6 — Vulnerable & Outdated Components).** Zero new deps. V3+PR #8 baseline unchanged.
- **CWE-693 (Protection Mechanism Failure) — the LangSwitcher bug class.** The original bug was a failure of the View Transitions persistence model to interact correctly with build-time URL computation. The fix is two-layered: source-level (remove `transition:persist`) + client-level (self-healing script). Defense in depth, even though each layer would suffice. Future-proofs against re-introduction of persistence on Nav.
- **GitHub Pages routing.** `dist/de/notes/mcp-workstream/index.html` is served at both `https://tomscholtes.com/de/notes/mcp-workstream/` and `https://tomscholtes.com/de/notes/mcp-workstream/index.html`. With `trailingSlash: 'never'`, internal `<a href="/de/notes/mcp-workstream">` (no trailing slash) may 301-redirect to the slash form. Verify the LangSwitcher and self-healing script produce hrefs WITH trailing slashes consistently. Inspect output: `grep -oE 'href="[^"]*"' dist/de/notes/mcp-workstream/index.html | sort -u` — every internal `notes/*` and `projects/*` href should end with `/`.
- **PR-not-merge boundary (criterion 17).** Final integrity gate. Tom reviews the diff manually before merge. Reviewer-Deployer stops at PR open. No exception in this batch.

[opus + 1 tool call]

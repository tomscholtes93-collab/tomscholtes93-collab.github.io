# RESEARCH.md — tomscholtes-i18n-2026-05-24

## Libraries

This batch is **strictly additive** with **zero new runtime or dev dependencies** (acceptance criterion 7). Everything in the table is either already in V3's `package.json` or a platform / Astro 5 built-in.

| Name | Version | Purpose | Link |
|---|---|---|---|
| Astro | ^5.0.0 (existing) | Static build, file-based routing, content collections | https://docs.astro.build/en/getting-started/ |
| Astro 5 built-in i18n | Astro 5 builtin | Locale-prefixed routing, `Astro.currentLocale`, `i18n` config block | https://docs.astro.build/en/guides/internationalization/ |
| Vite JSON imports | Vite (bundled with Astro) | Static import of `*.json` as typed objects | https://vitejs.dev/guide/features.html#json |
| TypeScript | ^5.x (existing, via Astro) | `Locale` union, helper module typing | https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html |
| `Intl.DateTimeFormat` | ECMA-402 (platform) | Locale-aware `publishDate` rendering | https://tc39.es/ecma402/#datetimeformat-objects |
| Node `node:fs` (`readFileSync`) | Node 20+ stdlib | `scripts/check-i18n.mjs` reads JSON dicts | https://nodejs.org/api/fs.html#fsreadfilesyncpath-options |
| GNU grep / ripgrep `-P` | host tool | Em-dash audit via `\xe2\x80\x94` byte regex | https://www.gnu.org/software/grep/manual/grep.html |
| HTML Living Standard `<html lang>` | WHATWG | Per-locale root-element lang attribute | https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes |
| `rel="alternate" hreflang="..."` | Google SEO guidance | Per-locale alternate URL hinting | https://developers.google.com/search/docs/specialty/international/localized-versions |
| `og:locale` / `og:locale:alternate` | OpenGraph spec | Per-locale Open Graph signalling | https://ogp.me/#optional |
| `prefers-reduced-motion` | CSS Media Queries L5 (WD) | LangSwitcher underline transition gate | https://www.w3.org/TR/mediaqueries-5/ |

Explicitly **not used** (per PLAN.md hard rule and acceptance criterion 15):

| Library | Reason rejected |
|---|---|
| `i18next` / `react-i18next` / `next-i18next` | Third-party, runtime weight, not needed for a static site with ~320 keys |
| `@astrojs/i18n` integration | Deprecated / merged into Astro 5 core; using core is the modern path |
| `vue-i18n`, `svelte-i18n`, `@formatjs/intl` | Wrong stack / unneeded runtime |
| `date-fns`, `dayjs` | `Intl.DateTimeFormat` covers the two date-render sites |

## Reference patterns

### 1. Astro 5 i18n config block

Source: Astro docs, "Internationalization (i18n)" — https://docs.astro.build/en/guides/internationalization/

```js
// astro.config.mjs (excerpt)
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tomscholtes.com',
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: { /* unchanged */ },
});
```

`prefixDefaultLocale: false` keeps English at the root (`/`, `/projects/`, ...). Non-default locales live under `/de/`, `/fr/`, `/ru/`. Default behavior of `redirectToDefaultLocale` is `true` when `prefixDefaultLocale: true` is set; with `prefixDefaultLocale: false` it is effectively a no-op — do not set it explicitly (criterion 9 enforces absence).

### 2. Helper module — `src/i18n/index.ts`

Source: Astro JSON-import behavior (Vite handles `*.json` as typed default exports) — https://vitejs.dev/guide/features.html#json and ECMA-402 Intl.DateTimeFormat — https://tc39.es/ecma402/

```ts
// src/i18n/index.ts
import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import ru from './ru.json';

export type Locale = 'en' | 'de' | 'fr' | 'ru';
export const LOCALES = ['en', 'de', 'fr', 'ru'] as const satisfies readonly Locale[];
export const NON_DEFAULT_LOCALES = ['de', 'fr', 'ru'] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = 'en';

const DICTS: Record<Locale, Record<string, string>> = { en, de, fr, ru };

const DATE_LOCALE: Record<Locale, string> = {
  en: 'en-GB', de: 'de-DE', fr: 'fr-FR', ru: 'ru-RU',
};

export function getLocale(url: URL | { pathname: string }): Locale {
  const first = (url.pathname.split('/').filter(Boolean)[0] ?? '').toLowerCase();
  return (NON_DEFAULT_LOCALES as readonly string[]).includes(first)
    ? (first as Locale)
    : DEFAULT_LOCALE;
}

export function t(key: string, locale: Locale, vars?: Record<string, string | number>): string {
  const raw = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '/' : clean}`;
}

export function localeDateFmt(locale: Locale): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], { day: 'numeric', month: 'short', year: 'numeric' });
}
```

Notes:
- JSON imports do **not** need `assert { type: 'json' }` in Astro 5 / Vite. The PLAN's example with `assert` works under Node but is being deprecated for `with { type: 'json' }`. Astro/Vite handles JSON natively — drop the assertion entirely.
- The `t()` function is intentionally tiny. No nested-key traversal — keys are flat dot-strings (`'home.hero.eyebrow'` is a single string key, not a nested path). This keeps lookup O(1) and removes a class of "missing intermediate object" bugs.
- Fallback chain: locale value → EN value → literal key (visible in dev, blocked by build gate).

### 3. Component pattern — `t` via `Astro.currentLocale`

Source: Astro docs, "Astro.currentLocale" — https://docs.astro.build/en/reference/api-reference/#astrocurrentlocale

```astro
---
// any .astro component
import { t as translate, getLocale, type Locale } from '../i18n';

const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const t = (k: string, vars?: Record<string, string | number>) => translate(k, locale, vars);
---
<section class="hero">
  <p class="eyebrow">{t('home.hero.eyebrow')}</p>
  <h1>{t('home.hero.lead')}</h1>
  <p class="hero-meta">
    {t('home.hero.meta.years', { years: 6 })}
    <span class="dot">·</span>
    {t('home.hero.meta.casestudies', { count: 8 })}
  </p>
</section>
```

The local `t` alias (closing over `locale`) keeps call sites tidy. The `??` fallback to `getLocale(Astro.url)` exists because `Astro.currentLocale` can be `undefined` in edge cases (notably during prerender of routes outside the configured `locales` set, e.g., 404 handlers in some Astro versions — see Gotchas).

### 4. LangSwitcher — no client JS, CSS-only active state

Source: PLAN.md FE-T8 and Astro `class:list` directive — https://docs.astro.build/en/reference/directives-reference/#classlist

```astro
---
// src/components/LangSwitcher.astro
import { LOCALES, getLocale, localizePath, t as translate, type Locale } from '../i18n';

const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const t = (k: string) => translate(k, locale);
const stripLocalePrefix = (p: string) => p.replace(/^\/(de|fr|ru)(\/|$)/, '/');
const here = stripLocalePrefix(Astro.url.pathname || '/');
---
<div class="lang-switcher" role="group" aria-label={t('langswitcher.aria.group')}>
  {LOCALES.map((code) => (
    <a
      href={localizePath(here, code)}
      class:list={['lang-switch', { 'is-active': code === locale }]}
      hreflang={code}
      aria-current={code === locale ? 'true' : undefined}
    >{code.toUpperCase()}</a>
  ))}
</div>
```

The current locale link still renders as a real `<a>` (with `aria-current="true"`) rather than being suppressed — this is the modern A11y pattern (per WAI-ARIA 1.2 `aria-current`) and lets keyboard users navigate predictably. Reference: https://www.w3.org/TR/wai-aria-1.2/#aria-current.

### 5. Locale wrapper page (re-export pattern)

Source: Astro docs, "Imports" + "Re-exports" behavior — https://docs.astro.build/en/guides/imports/

```astro
---
// src/pages/de/index.astro
import IndexPage from '../index.astro';
---
<IndexPage />
```

For dynamic routes (`[slug]`), Astro requires the wrapper page to itself supply `getStaticPaths`. The re-export form works in Astro 5 for module-level exports:

```astro
---
// src/pages/de/notes/[slug].astro
import NoteDetail from '../../notes/[slug].astro';
export { getStaticPaths } from '../../notes/[slug].astro';
---
<NoteDetail />
```

**Important caveat (see Gotchas):** Astro's `getStaticPaths` is parsed as a top-level export from the wrapper file; re-exporting from another `.astro` file works in current versions but has been intermittently broken in past minor releases. The fallback is to inline the function body (call `getCollection('notes', ...)` directly in the wrapper). Test both forms early in FE-T10 before scaling to 27 files.

### 6. Build gate — `scripts/check-i18n.mjs`

Source: GNU grep / Node `node:fs` — https://nodejs.org/api/fs.html#fsreadfilesyncpath-options. The PLAN ships a complete implementation; the critical correctness points are:

```js
// Word-boundary leakage regex MUST escape hyphens-as-words carefully.
// "composite-keys" contains a literal hyphen — \b at \w/\W boundary works because
// '-' is \W, but the regex must not anchor on word chars only.
const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
```

The PLAN's `new RegExp(\`\\b${name}\\b\`, 'i')` is correct for the current ban list (no regex metacharacters inside the names). If the list ever gains a name containing `.` or `(`, escape it. Defensive: add the escape step unconditionally — costs nothing.

Two other quality points to fold in:
- After `JSON.parse`, verify the result is a flat string-keyed string-valued object (not a nested object). A nested mistake (`{ "home": { "hero": "..." } }`) would silently pass key-parity (top-level keys match) while breaking lookup. Add: `for (const [k, v] of Object.entries(dict)) if (typeof v !== 'string') errors.push(\`non-string value ${locale}: ${k}\`)`.
- Stable exit code: print evidence to stdout on success (criterion 1 looks for `✓ check-i18n: ...` in the build output tail).

### 7. Locale-aware date rendering

Source: ECMA-402 `Intl.DateTimeFormat` — https://tc39.es/ecma402/#datetimeformat-objects

```astro
---
// src/components/NoteCard.astro (modified site of the existing en-GB hardcode)
import { getLocale, localeDateFmt, type Locale } from '../i18n';
const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const fmt = localeDateFmt(locale);
const { entry } = Astro.props;
---
<a href={`/${locale === 'en' ? '' : locale + '/'}notes/${entry.slug}/`} class="note-card">
  <h3 class="serif" transition:name={`note-title-${entry.slug}`}>{entry.data.title}</h3>
  <p class="eyebrow mono">{fmt.format(entry.data.publishDate)}</p>
  <p>{entry.data.summary}</p>
</a>
```

Use `localizePath(\`/notes/${entry.slug}/\`, locale)` instead of inline interpolation — keeps the path logic in one place and matches the LangSwitcher.

### 8. `<html lang>` + hreflang alternates in Base.astro

Source: Google "Tell Google about localized versions" — https://developers.google.com/search/docs/specialty/international/localized-versions

```astro
---
// src/layouts/Base.astro (excerpt)
import { LOCALES, getLocale, localizePath, t as translate, type Locale } from '../i18n';
const SITE = 'https://tomscholtes.com';
const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const t = (k: string, vars?: Record<string, string|number>) => translate(k, locale, vars);

interface Props { title?: string; description?: string; path?: string; }
const { title, description, path = '/' } = Astro.props;
const resolvedTitle = title ?? t('meta.home.title');
const resolvedDesc = description ?? t('meta.home.description');
const canonical = new URL(localizePath(path, locale), SITE).href;
const OG_LOCALE = { en: 'en_GB', de: 'de_DE', fr: 'fr_FR', ru: 'ru_RU' } as const;
---
<!doctype html>
<html lang={locale}>
  <head>
    <title>{resolvedTitle}</title>
    <meta name="description" content={resolvedDesc} />
    <link rel="canonical" href={canonical} />
    {LOCALES.map((l) => (
      <link rel="alternate" hreflang={l} href={new URL(localizePath(path, l), SITE).href} />
    ))}
    <link rel="alternate" hreflang="x-default" href={new URL(path, SITE).href} />
    <meta property="og:locale" content={OG_LOCALE[locale]} />
    {LOCALES.filter((l) => l !== locale).map((l) => (
      <meta property="og:locale:alternate" content={OG_LOCALE[l]} />
    ))}
    <!-- existing fonts, og:image, JSON-LD preserved -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

The `x-default` hreflang points at the English canonical (`/`) per Google's recommendation when a default locale exists. Reference: same URL above.

### 9. Placeholder substitution contract

Source: ECMA-262 `String.prototype.replace` with named-capture callback — https://tc39.es/ecma262/

```js
// Given EN value: "{count} roles · {years}+ years"
// Translator must preserve placeholders verbatim:
//   DE: "{count} Rollen · {years}+ Jahre"
//   FR: "{count} postes · {years}+ ans"
//   RU: "{count} ролей · {years}+ лет"

t('home.cv.experience.summary', 'de', { count: 5, years: 6 })
// → "5 Rollen · 6+ Jahre"
```

`check-i18n.mjs` enforces placeholder preservation per criterion 11. The regex `/\{[a-zA-Z0-9_]+\}/g` matches only ASCII placeholder names — translators using Cyrillic in placeholder positions would not be detected as drift. The convention "placeholders are always ASCII" is therefore a translator rule, not just a regex assumption.

### 10. Em-dash audit byte sequence

Source: Unicode U+2014 in UTF-8 — https://www.unicode.org/charts/PDF/U2000.pdf

```bash
# Bash with ANSI-C quoted byte sequence:
grep -rP $'\xe2\x80\x94' src/i18n/ src/components/LangSwitcher.astro src/pages/

# Equivalent ripgrep:
rg --pcre2 '\x{2014}' src/i18n/ src/components/LangSwitcher.astro src/pages/

# Exit code: 0 = match found (FAIL), 1 = clean (PASS)
```

Distinct from U+2013 (en-dash, `\xe2\x80\x93`), U+002D (ASCII hyphen-minus), U+2212 (math minus). The ban applies only to U+2014.

### 11. Headlines / now / case-study data refactor

Source: PLAN.md FE-T6. Reference TypeScript discriminated-union pattern for stable IDs.

```ts
// src/content/now.ts (after refactor)
export type NowItem = {
  id: 'working' | 'building' | 'running' | 'learning' | 'offclock';
  // k/v values now resolved via t('home.now.items.<id>.k') and t('...v') at render
};

export const NOW: NowItem[] = [
  { id: 'working' },
  { id: 'building' },
  { id: 'running' },
  { id: 'learning' },
  { id: 'offclock' },
];
```

```astro
---
// Now.astro (excerpt)
import { NOW } from '../content/now';
import { t as translate, getLocale, type Locale } from '../i18n';
const locale = (Astro.currentLocale ?? getLocale(Astro.url)) as Locale;
const t = (k: string) => translate(k, locale);
---
<ul class="now-list">
  {NOW.map((it) => (
    <li>
      <span class="now-k">{t(`home.now.items.${it.id}.k`)}</span>
      <span class="now-v">{t(`home.now.items.${it.id}.v`)}</span>
    </li>
  ))}
</ul>
{/* The 'running' item has inline JSX (NoteLink) — special-case it: */}
```

The PLAN calls out that `home.now.items.running` is split into `lead/middle/tail` because the visible text wraps an inline `<NoteLink>` JSX component. Pattern: render the three text fragments and the JSX between them:

```astro
<li>
  <span class="now-k">{t('home.now.items.running.k')}</span>
  <span class="now-v">
    {t('home.now.items.running.lead')}
    <NoteLink slug="self-hosted-rag-claude-max">{t('home.now.items.running.middle')}</NoteLink>
    {t('home.now.items.running.tail')}
  </span>
</li>
```

## Gotchas

- **`Astro.currentLocale` can be undefined.** Per Astro 5 docs, `Astro.currentLocale` is derived from the URL using the `i18n.locales` config. For routes that don't match any locale prefix (e.g., file-system 404 pages, or root files when `prefixDefaultLocale: false`), it returns the `defaultLocale`. **But:** during `getStaticPaths` evaluation, `Astro` is not yet bound — never reference `Astro.currentLocale` inside `getStaticPaths`. Always parse from `Astro.url` in those contexts. Reference: https://docs.astro.build/en/reference/api-reference/#astrocurrentlocale.
- **`prefixDefaultLocale: false` keeps the default at the root, NOT under `/en/`.** Means `dist/index.html` is English, `dist/de/index.html` is German. Wrapper pages must live under `src/pages/de/`, `src/pages/fr/`, `src/pages/ru/` — there is NO `src/pages/en/`. Trying to mirror EN under `src/pages/en/` would create a duplicate route conflict at build.
- **`trailingSlash: 'never'` interaction with i18n routing.** V3 sets `trailingSlash: 'never'` which means Astro outputs `/notes/mcp-workstream/index.html` but resolves URLs without trailing slashes. With i18n, `/de/notes/mcp-workstream` is the canonical link. Audit each generated `<a href="...">` in components — make sure the `localizePath` output matches the canonical form. The PLAN's `localizePath` keeps the trailing slash if the input had one. Cross-check against `trailingSlash` config or the link will hard-redirect on GitHub Pages.
- **JSON `import` assertions are syntax-shifting.** Old syntax: `import en from './en.json' assert { type: 'json' };`. New (TC39 stage 3): `import en from './en.json' with { type: 'json' };`. Astro/Vite handles plain `import en from './en.json'` without either — JSON is auto-treated as a module by Vite's plugin. **Use the bare import form.** Reference: https://vitejs.dev/guide/features.html#json. Adding `assert`/`with` triggers warnings in some Vite versions or fails outright in environments that haven't enabled the proposal.
- **Re-exporting `getStaticPaths` from `.astro` files is fragile.** Astro 5 supports `export { getStaticPaths } from '../foo.astro';` but the function's closure context comes from the source file. If the source `getStaticPaths` references local imports relative to its own path, those resolve against the source — fine. But if it references file-relative paths via `import.meta.url`, those still resolve from the source. Test once before scaling to 27 files. Fallback: inline the body.
- **Wrapper page double-render.** A wrapper that does `<IndexPage />` and the index page itself both export default components. Astro's route resolver sees them as separate routes — no double-render at the same URL. But if the wrapper passes props (`<IndexPage someProp={x} />`), those props override defaults. Wrappers per the PLAN pass NO props — components consume `Astro.currentLocale` directly.
- **`Astro.currentLocale` on root index when `prefixDefaultLocale: false`.** Returns `'en'` (the default). Confirms via Astro docs. But during dev, hot-reload sometimes shows `undefined` on first paint of `/` — defensive `?? 'en'` covers this without polluting prod.
- **Wrapper pages inherit `getStaticPaths` from re-export — but the wrapper file's URL is what's used.** Astro maps `src/pages/de/notes/[slug].astro` → `/de/notes/${slug}/`. The re-exported `getStaticPaths` returns slugs (`mcp-workstream`, etc.); Astro applies them to the wrapper's route pattern, not the source's. So `getStaticPaths` returning `[{ params: { slug: 'mcp-workstream' } }]` produces `/de/notes/mcp-workstream/` in the German tree. Confirmed; this is the intended behavior.
- **`getCollection` is locale-blind.** It returns all entries regardless of locale. The PLAN keeps `src/content/notes/*.md` as English-only across all locales (out of scope for translation). Chrome around notes (`Sources`, `Related`, `← all notes`) IS localized. Be careful not to accidentally filter by locale in `[slug].astro` — every locale page must show every note.
- **YAML/JSON BOM and trailing newlines.** Translators using Windows tools may add UTF-8 BOM (`\xEF\xBB\xBF`) to `de.json` / `ru.json`. `JSON.parse` tolerates BOM but `grep` matches and exact byte comparisons may surprise. Defensive: add a BOM check in `check-i18n.mjs`: `if (raw.charCodeAt(0) === 0xFEFF) errors.push(\`BOM in ${locale}.json\`);` — costs one line, prevents a class of silent bugs.
- **Smart-quote auto-conversion in editors.** macOS / VS Code may convert `'`/`"` to `'/"/"/"` during editing. The dictionary should keep ASCII straight quotes for technical predictability. Add to gate if needed: `if (/[\u2018\u2019\u201C\u201D]/.test(val)) errors.push(\`smart quote ${locale}: ${k}\`)` — optional, ask Architect first.
- **CSS-only active state has no JS fallback for older WebKit.** The `:hover` underline grow assumes `transform: scaleX(0)` then `scaleX(1)`. All targets support this. The `prefers-reduced-motion` guard zeros `transition`, which is correct — active still shows via `color: var(--ink)` and the `::after` underline (no transform animation runs).
- **`hreflang` attribute case.** Spec accepts case-insensitive language tags, but **the convention is lowercase region-modifier subtags** (`hreflang="en-gb"`, not `en-GB`). The PLAN emits `hreflang={code}` where `code` is the bare two-letter locale (`'en'`, `'de'`, `'fr'`, `'ru'`) — no region. That's fine for primary languages; if a translator later asks for `de-AT` or `en-US`, switch to lowercase region tags. Reference: BCP 47 — https://www.rfc-editor.org/rfc/rfc5646.
- **`og:locale` requires `xx_XX` underscore format.** OpenGraph spec uses `en_GB`, not `en-GB`. The PLAN's `OG_LOCALE` map has the underscores right. Don't refactor to share `DATE_LOCALE` (which uses dashes for ECMA-402).
- **Russian language name display.** Russian readers expect `Русский` (Cyrillic, capitalized). German native form is `Deutsch` (capitalized). French native is `Français` (capitalized). The PLAN explicitly keeps language names literal — no `t()` call for those. Confirm `Languages.astro` outputs the native form for each, not transliterations.
- **Cyrillic and JSON minification.** `ru.json` will contain Cyrillic chars (UTF-8 2-byte sequences). `JSON.parse` handles this natively. If the orchestrator's `dist/` post-processing minifies JSON, ensure UTF-8 is preserved. V3's `post-build.mjs` (read-only here) should not touch `dist/**/*.json`. Confirm during FE-T1.
- **`Astro.props` in wrapper pages is empty.** The wrapper doesn't pass props. The shared component reads `Astro.currentLocale` from its own context — which is the wrapper's URL. So even though the wrapper imports the EN component, that component sees locale `'de'` when invoked from `/de/`. This is the core mechanism. Verify with one console.log during FE-T10 before scaling.
- **404 page locale routing.** Astro 5 by default serves `src/pages/404.astro` for any unmatched route. With i18n, you can also have `src/pages/de/404.astro`, `src/pages/fr/404.astro`, `src/pages/ru/404.astro`. GitHub Pages serves a single `/404.html` regardless of URL — so the localized 404s are reachable only via direct URL navigation, not server-side error matching. Acceptable; document in the PR.
- **Build time scaling.** Adding 27 wrapper pages × (8 notes + 8 static pages each) = ~270 pre-rendered HTML files. Astro 5 builds these in parallel. Expect a modest build-time increase (5–15 seconds on cold). If CI runs against `actions/setup-node@v4` with `cache: npm`, the install cost is negligible.
- **`grep -l 'lang-switcher' dist/**/index.html | wc -l` — shell glob expansion.** Acceptance criterion 12 uses `dist/**/index.html` which requires `shopt -s globstar` in bash or `**` support in zsh. If the runner is `sh`, this will not expand recursively. Reviewer-Deployer should use `find dist -name 'index.html' -exec grep -l 'lang-switcher' {} \; | wc -l` for portability.
- **`grep -A 1` in criterion 16.** The `-A 1` grabs only 1 line after the `prefers-reduced-motion` match. The PLAN's CSS block has the `.lang-switch` rule TWO lines after the `@media` line. Use `-A 3` or the criterion will false-fail. Recommend Reviewer-Deployer adjust: `grep -A 3 'prefers-reduced-motion' src/styles/components.css | grep -q 'lang-switch'`.
- **TypeScript inference of `Locale` from `LOCALES`.** The `as const satisfies readonly Locale[]` pattern keeps the array typed as the tuple `readonly ['en','de','fr','ru']` while also validating each element is a `Locale`. If the helper exports `LOCALES` and a component does `LOCALES.includes(someString)`, TypeScript narrows correctly. Reference: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference.
- **Case 08 leakage strings — DO NOT extract.** The PLAN's "Planning conflict to surface" explicitly resolves this: leave the `Investran ↔ Dealsplus ...` CV bullet (`CV.astro:12`) and Case 08 case-study fields (`caseStudies.ts:75–82`) as English literals across ALL locales. This passes the `src/i18n/` scoped leakage grep (criterion 5) while keeping scope contained. **Do not "fix" by translating those strings — they stay English in DE/FR/RU pages as well.** This is intentional consistency with the i18n.md "brand names stay literal" rule applied to internal product names.
- **Translator vouvoiement and Sie-form discipline.** The dictionary contains imperative phrasing ("Read more", "Get in touch"). Translators must convert to formal register:
  - EN `"Get in touch"` → DE `"Kontakt aufnehmen"` (not `"Melde dich!"`), FR `"Prendre contact"` (not `"Contacte-moi"`), RU `"Связаться"` (impersonal, not `"Свяжись со мной"`).
  - First-person prose ("Patterns I've worked through") → first-person but formal in DE/FR/RU. No `du`, no `tu`, no `ты`.
- **Markdown / inline HTML preservation.** Some EN values contain `<strong>`, `<em>`, or escaped entities. Translators must preserve tags verbatim. Add a regex check in `check-i18n.mjs`: count `<[a-z]+>` openings in EN value vs translated value — mismatched count = error. Optional enhancement; ask Architect before adding.
- **`tag` array extraction increases key churn.** PLAN extracts `home.work.case.01.tag.0/1/2` per case → ~21 tag keys for 7 cases × ~3 tags. These are short strings often left untranslated (`"QA automation"` is a fine literal in DE professional context). Translator policy: translate if natural; keep English if it's the established term. Either way, every locale must have all keys present (criterion 11).
- **Total key count estimation.** PLAN estimates ~320. Researcher's namespace count: `meta` (~18), `nav` (~12), `footer` (~10), `home.hero` (~20), `home.now` (~15), `home.work` (~35 incl. tags), `home.cv` (~40), `home.reading` (~10), `home.languages` (~2), `home.colophon` (~5), `home.contact` (~9), `projects.index` (~25), `projects.devswarm/exocortex/devswarm-cv` chrome (~30 combined), `notes.index/detail` (~10), `error.404` (~5), `thesis` (~25), `actions` (~7), `langswitcher` (~1). Total ~280–320. Stable estimate.

## Security

The threat surface is tiny: static site, no auth, no server, no user input. Risks reduce to (a) cross-site scripting via interpolation, (b) translator-introduced content drift, (c) supply chain (mitigated by zero-new-deps), (d) SEO / canonical correctness.

- **XSS via `t()` interpolation.** Astro auto-escapes string children in JSX-like expressions. `<h2>{t('home.work.heading')}</h2>` is safe even if the dictionary value contains `<script>...`. Astro escapes `<`, `>`, `&`, `"`, `'` in expression context. The only escape hatches are `set:html` and `<Fragment>` with raw strings. **The PLAN does NOT introduce any new `set:html`.** Reference: https://docs.astro.build/en/basics/astro-syntax/#dynamic-html.
- **XSS via HTML in dictionary values.** EN values may legitimately contain `<strong>` or `<em>` (per FE-T15 constraint "Inline markdown / HTML preserved verbatim"). Rendering those requires `set:html` — but the PLAN does NOT use `set:html` for `t()` output. If a value has HTML, it will render as literal text. **Resolution:** confirm with Architect — either (a) keep all dictionary values pure text (recommended), or (b) introduce a narrow `set:html` for the small number of values that genuinely need inline tags (e.g., colophon "Built with <strong>Astro 5</strong>..."). Option (a) is safer; option (b) requires that translator submissions be reviewed for `<script>` injection before merge. Since translators are Tom himself + this codebase, trust is high — but a defensive sanitizer (`rehype-sanitize` would be a new dep; ban) or a regex check in `check-i18n.mjs` is cheaper:
  ```js
  if (/<\s*script|on\w+\s*=|javascript:/i.test(val)) errors.push(`html risk ${locale}: ${k}`);
  ```
  This catches `<script>`, event handlers (`onclick=`), and `javascript:` URLs. Add to FE-T12 as a defensive gate; cost is one regex.
- **XSS via placeholder values.** `t(key, locale, { name: userInput })` is not exercised in this batch (no runtime variables come from user input — `{count: 5, years: 6}` are hardcoded constants). Even if added later, the substitution is done before JSX interpolation, so Astro's auto-escape still applies. Safe by construction.
- **`<a href={localizePath(...)}>` injection.** `localizePath` only prepends `/${locale}` to a controlled `path` argument. Locale is a typed `Locale` union — no user-controlled string ever flows in. Safe.
- **Trust boundary on dictionary content.** Translators (Tom or translator subagents) have write access to `src/i18n/*.json` only. The build-time gate (`check-i18n.mjs`) is the merge boundary. The leakage grep, em-dash check, placeholder check, and (recommended) HTML-injection check all run before bundling. PR-not-merge (criterion 17) is the human review final gate.
- **Supply chain.** Zero new dependencies (criterion 7 enforces). No `postinstall` scripts added. No new MCPs invoked. The build gate uses only Node stdlib (`node:fs`). Risk: unchanged from V3.
- **Lockfile drift.** `package-lock.json` must show ZERO changes (criterion 7). If `npm install` is run with no changes, npm 10 may still touch the lockfile metadata. Run `npm ci` (clean install from existing lockfile, no writes) to verify — also matches CI behavior.
- **CSP.** V3's inline-style and inline-script policy is unchanged. LangSwitcher emits CSS via the shared `components.css` (external, hashable) — no new inline. Wrappers add no new scripts. CSP-relevant surface: zero delta.
- **GitHub Pages locale routing.** GH Pages serves `dist/de/index.html` at `https://tomscholtes.com/de/index.html` and `https://tomscholtes.com/de/` (with `index.html` resolution). With `trailingSlash: 'never'`, internal `<a href="/de/">` may produce a 301 redirect on GH Pages. Verify: navigate to `/de/projects` (no slash) and confirm it lands at `/de/projects/` (with slash) cleanly. If redirects loop, the issue is `trailingSlash` mismatch between Astro config and link generation. Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#static-site-generators.
- **SEO correctness.** Misconfigured `hreflang` can hurt international ranking. Acceptance criteria don't gate SEO directly, but verify (manually or via https://www.merkle.com/en/merkle-now/tools/hreflang-tags-generator after deploy) that the four-way hreflang triangle is symmetric — every locale page lists alternates to all locales including itself.
- **OG `og:locale:alternate` count.** Filter excludes the active locale to avoid self-listing. Confirm: 1 `og:locale` + 3 `og:locale:alternate` per page = 4 total. Open Graph parsers tolerate self-listing but it's slightly redundant.
- **Information disclosure via missing-key fallback.** When `t('missing.key', 'de')` returns the literal `'missing.key'` string (final fallback), that string appears in HTML. If a translator drops a key, the bare key shows up in production. `check-i18n.mjs` blocks merge before this ships (criterion 10 enforces key parity). Defense in depth: the dev-mode `t` fallback could log a warning to stderr — minor enhancement, ask Architect.
- **Brand-name leakage (e.g., `Triton`).** Acceptance criterion 5 enforces zero matches inside `src/i18n/` only. Pre-existing leakage in `src/components/CV.astro` and `src/content/caseStudies.ts` (Case 08) is **out of scope** by explicit dispatch decision. Document this in the PR description with the file:line pointers so future audits don't relitigate.
- **Russian translation of headings: do not transliterate brand names.** "Tom Scholtes" stays in Latin script in `ru.json`. Transliteration to `Том Шольтес` would constitute a different identity claim. Translator rule.
- **CWE-79 (XSS) summary.** Defended by (a) Astro auto-escape, (b) no `set:html` added, (c) optional dictionary HTML-injection regex in build gate, (d) trusted-translator model + PR review.
- **CWE-918 (SSRF) / CWE-22 (Path Traversal).** N/A — no server, no filesystem reads at runtime.
- **CWE-200 (Information Exposure).** Defended by leakage grep + Jarvis grep (V4) + manual PR review.
- **CWE-1035 (OWASP A6 — Vulnerable & Outdated Components).** Zero new deps → zero new risk surface. V3 baseline unchanged.

[opus + 1 tool call]

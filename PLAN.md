# PLAN.md — tomscholtes-i18n-2026-05-24

Additive i18n pass on the deployed Astro 5 site. Adds DE / FR / RU locales alongside canonical English. Zero visual change. Astro 5 built-in i18n only. No third-party libs. No theme / typography / layout changes. The `src/content/notes/*.md` content collection is **out of scope for translation** (per dispatch); only chrome around notes is localized.

## Planning conflict to surface before handoff

Existing site copy contains three leakage-list tokens that are public today (pre-date this batch):

- `src/components/CV.astro:12` — `"Investran ↔ Dealsplus data integration (composite-keys bridging architecture)"`
- `src/content/caseStudies.ts:76,79–80` — Case 08 references `Investran`, `Dealsplus`, `composite-keys`

The dispatch leakage grep is scoped to `src/i18n/` only (NOT to existing components). Resolution: **do NOT extract those specific strings into i18n keys**. They remain literal English in their source files across all locales (consistent with the i18n.md "technical terms in English unless an established native term exists" rule plus "brand names stay literal"). This keeps `src/i18n/` leakage-grep-clean (zero matches) without enlarging scope into a content scrub. If Tom wants the live English site scrubbed of these tokens, that is a separate batch.

## Stack

- **Astro 5.x** (existing — no upgrade). `i18n` block added to `astro.config.mjs`.
- **Astro 5 built-in i18n routing** only. NO `i18next`, NO `react-i18next`, NO `@astrojs/i18n`, NO third-party translation libs. Confirmed by `package.json` audit: zero new runtime deps will be added.
- **Translation dictionaries:** flat JSON, dot-namespaced keys, one file per locale at `src/i18n/{en,de,fr,ru}.json`.
- **Helper:** `src/i18n/index.ts` exports `t(key, locale, vars?)`, `getLocale(url)`, `localizePath(path, locale)`. Pure TS, zero runtime deps.
- **Routing:** `defaultLocale: 'en'`, `locales: ['en','de','fr','ru']`, `routing.prefixDefaultLocale: false`. English at `/`, others at `/de/`, `/fr/`, `/ru/`.
- **LangSwitcher:** `src/components/LangSwitcher.astro` — three `<a>` tags rendered alongside the active one; CSS-only active state; **no React island, no client JS**. Mounted in `Nav.astro` to the right of `.nav-links`, before `.nav-cta`.
- **Build gate:** `scripts/check-i18n.mjs` — key-parity + placeholder-preservation + em-dash + leakage greps over `src/i18n/`. Wired as **the first** step in `npm run build` (before `check-notes.mjs`).
- **Notes collection:** untouched. `src/content/notes/*.md` is English-only across all locales (dispatch §"notes content collection stays untouched"). Only the page chrome around notes is localized.
- **Date formatting:** `Intl.DateTimeFormat` switched from hardcoded `'en-GB'` to a locale-aware lookup (`{en:'en-GB', de:'de-DE', fr:'fr-FR', ru:'ru-RU'}`) in two files only: `src/components/NoteCard.astro:8` and `src/pages/notes/[slug].astro:21`.
- **No deps added** to `package.json`. No deps removed.

## File layout

```
V2/
  astro.config.mjs                                  # MODIFY — add i18n block
  package.json                                      # MODIFY — prepend check-i18n.mjs to build script
  scripts/
    check-i18n.mjs                                  # CREATE — key parity + leakage + em-dash gate
    check-notes.mjs                                 # READ-ONLY (unchanged)
    copy-fonts.mjs                                  # READ-ONLY
    make-og.mjs                                     # READ-ONLY
    post-build.mjs                                  # READ-ONLY
  src/
    i18n/
      index.ts                                      # CREATE — t / getLocale / localizePath / dateFmt
      en.json                                       # CREATE — canonical dictionary
      de.json                                       # CREATE — German (Sie-form)
      fr.json                                       # CREATE — French (vouvoiement, LU/BE norms)
      ru.json                                       # CREATE — Russian («вы»-form)
    components/
      LangSwitcher.astro                            # CREATE — three <a> tags, CSS-only active
      Nav.astro                                     # MODIFY — mount LangSwitcher; t() on link labels + CTA
      Footer.astro                                  # MODIFY — t() on every label
      Hero.astro                                    # MODIFY — t() on eyebrow, lead, CTAs, hero-meta
      Now.astro                                     # MODIFY — t() on h2, blurb; NOW data via t()
      CaseStudies.astro                             # MODIFY — t() on eyebrow, h2, blurb
      CaseStudyCard.astro                           # READ-ONLY (renders props passed in)
      CV.astro                                      # MODIFY — t() on section labels; role bullets containing
                                                    #          leakage tokens stay inline (see conflict)
      Reading.astro                                 # MODIFY — t() on all theme titles + descriptions
      Languages.astro                               # MODIFY — t() on h2
      Colophon.astro                                # MODIFY — t() on h2 + body paragraphs
      Contact.astro                                 # MODIFY — t() on eyebrow, h2, body, CTAs
      NoteCard.astro                                # MODIFY — locale-aware Intl.DateTimeFormat only
    pages/
      index.astro                                   # READ-ONLY (English route at /)
      thesis.astro                                  # MODIFY — t() on prose strings
      404.astro                                     # MODIFY — t() on h1, body, CTA
      projects/
        index.astro                                 # MODIFY — t() on header, card text
        devswarm/index.astro                        # MODIFY — t() on chrome only (large content body
                                                    #          stays English unless feasible; see §FE-T9)
        exocortex/index.astro                       # MODIFY — same pattern as devswarm subpage
        devswarm-cv/index.astro                     # MODIFY — t() on chrome
      notes/
        index.astro                                 # MODIFY — t() on header chrome; date Intl locale-aware
        [slug].astro                                # MODIFY — t() on "Sources" / "Related" / "← all notes"
                                                    #          eyebrow date Intl locale-aware
      de/                                           # CREATE — German wrapper tree (9 files)
        index.astro
        thesis.astro
        404.astro
        projects/index.astro
        projects/devswarm/index.astro
        projects/exocortex/index.astro
        projects/devswarm-cv/index.astro
        notes/index.astro
        notes/[slug].astro
      fr/                                           # CREATE — French wrapper tree (9 files)
        … (mirror of de/)
      ru/                                           # CREATE — Russian wrapper tree (9 files)
        … (mirror of de/)
    layouts/
      Base.astro                                    # MODIFY — t() on default title + description; <html lang>
                                                    #          from Astro.currentLocale; canonical per locale
    content/
      headlines.ts                                  # MODIFY — keep `key` + `label` fields; pre/em/post
                                                    #          values resolved via t() at render time
      now.ts                                        # MODIFY — keep `k` field stable (used as switch in
                                                    #          Now.astro); `v` value resolved via t()
      caseStudies.ts                                # READ-ONLY for #08 leakage strings; for #01-#07
                                                    #          MODIFY: blurbs and titles via t(key)
                                                    #          (see frontend task FE-T6 for the split)
      notes/*.md                                    # READ-ONLY (out of scope)
      notes/config.ts                               # READ-ONLY
      config.ts                                     # READ-ONLY
    styles/
      components.css                                # MODIFY (append-only) — `.lang-switcher`,
                                                    #          `.lang-switch`, `.lang-switch.is-active`
      tokens.css                                    # READ-ONLY (hard rule: do not change)
      global.css                                    # READ-ONLY
      pages.css                                     # READ-ONLY
```

**Counts.** CREATE: 31 (4 dictionaries + 1 helper + 1 component + 1 script + 27 wrapper pages = 4+1+1+1+27 = 34, minus the 27 was an over-count; actual: 1 helper + 4 JSON + 1 LangSwitcher + 1 check-i18n + 27 wrappers = **34**). MODIFY: 18 source files + `astro.config.mjs` + `package.json` = **20**.

## API contracts

NOT_REQUIRED at runtime (static site).

**Build-time TS API** (`src/i18n/index.ts`):

```ts
export type Locale = 'en' | 'de' | 'fr' | 'ru';
export const LOCALES: readonly Locale[] = ['en', 'de', 'fr', 'ru'] as const;
export const NON_DEFAULT_LOCALES: readonly Locale[] = ['de', 'fr', 'ru'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

export function getLocale(url: URL | { pathname: string }): Locale;
//   Reads pathname; first segment in {de,fr,ru} -> that locale; else 'en'.
//   Astro 5 also exposes Astro.currentLocale; either source is acceptable
//   and both must return the same value for any path.

export function t(key: string, locale: Locale, vars?: Record<string, string | number>): string;
//   Dictionary lookup with EN fallback.
//   Placeholder substitution: replaces {name}, {count}, etc. Markdown/HTML left intact.
//   Missing key -> returns en[key]; missing in EN too -> returns the key string itself
//     (visible during dev; check-i18n.mjs blocks merge before that ever ships).

export function localizePath(path: string, locale: Locale): string;
//   localizePath('/projects/', 'de') -> '/de/projects/'
//   localizePath('/', 'de')          -> '/de/'
//   localizePath('/projects/', 'en') -> '/projects/'   (no prefix for default)

export function localeDateFmt(locale: Locale): Intl.DateTimeFormat;
//   { en: 'en-GB', de: 'de-DE', fr: 'fr-FR', ru: 'ru-RU' }
//   Used by NoteCard.astro and notes/[slug].astro for publishDate rendering.
```

**Astro idiom in components:**

```astro
---
import { t as translate, getLocale } from '../i18n';
const locale = Astro.currentLocale ?? getLocale(Astro.url);
const t = (k: string, vars?: Record<string, string|number>) => translate(k, locale, vars);
---
<h2>{t('home.work.heading')}</h2>
```

## DB schema

NOT_REQUIRED — static site, no persistence.

## Frontend tasks

### FE-T1. Pre-flight reads (no code yet)

Read in this order: `personas/frontend/LESSONS.md`, the three rules files (`NOTES_GUIDE.md`, `astro-site.md`, `i18n.md`), this PLAN.md, then `package.json`, `astro.config.mjs`, every `src/components/*.astro`, every `src/pages/**/*.astro`, every `src/content/*.ts`, `src/layouts/Base.astro`, `scripts/check-notes.mjs`. Confirm package name `tomscholtes-v3` v3.0.0, Astro 5.0, React 18 islands (`DisplayPanel.jsx`, `TweaksPanel.jsx`). Confirm the conflict tokens are present at the locations cited above. Do not start coding until reads are complete.

### FE-T2. `astro.config.mjs` — add i18n block

Modify the `defineConfig({ ... })` to add:

```js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'de', 'fr', 'ru'],
  routing: {
    prefixDefaultLocale: false,
  },
},
```

Insert between `trailingSlash: 'never',` and `build: { ... }`. Do not change `site`, `output`, `trailingSlash`, `build`, `integrations`, `vite`.

### FE-T3. `src/i18n/index.ts` — helper module

Implement per the API contract above. Single file, no external imports beyond the four JSON dictionaries (which are imported statically: `import en from './en.json' assert { type: 'json' };` — same for de/fr/ru). Use `JSON.parse` of imported dicts not needed; Astro / Vite handles JSON imports as typed objects. Export `t`, `getLocale`, `localizePath`, `localeDateFmt`, `LOCALES`, `NON_DEFAULT_LOCALES`, `DEFAULT_LOCALE`, `type Locale`.

### FE-T4. Build the string inventory and emit `src/i18n/en.json`

Walk every file in the MODIFY column of the layout table. Extract every user-facing string into the namespace catalogue below. Emit `en.json` populated with English values. Do **not** extract:

- Leakage-token strings (CV bullet at `CV.astro:12`, Case 08 at `caseStudies.ts:75–82`) — these remain inline as English literals across all locales.
- Brand names: `Tom Scholtes`, `Instrument Serif`, `Inter`, `JetBrains Mono`, `DevSwarm`, `OpenKB`, `Meridian`, `Fedora`, `Tailscale`, `Pixel`, `Even Realities G2`, `Notion`, `Asana`, `Outlook`, `Monday.com`, `Claude`, `Claude Code`, `ChatGPT`, `Glean`, `Investran`, `eFront`, `BOB50`, `SAP`, `Excel`, `Word`, `PowerPoint`, `LuxGAAP`, `eCDF`, `CSSF`, `BCL`, `MCP`, `RPA`, `Astro`, `React`, `TypeScript`, `GitHub Actions`, `Power Automate`, `MSc`, `BSc`, `PE`, `Private Debt`, `Real Estate`, role/firm names in CV (`Alter Domus`, `Waystone Administration Solutions`, `Aztec Group`, `European Fund Administration`, `Erasmus School of Economics, University of Rotterdam`, `University of Luxembourg`).
- URLs, email addresses, slugs, `aria-label="Open menu"` / `"Close menu"` — those last two **are** user-facing and DO go into the dictionary under `nav.menu.open`/`nav.menu.close`.
- Hardcoded thesis title (`"Augmented gravity model: ..."`) — keep inline (academic publication title, not translated).
- `class="..."` values, `data-*` attributes, eyebrow date formats consumed by Intl.

**Key namespace catalogue (representative, not exhaustive — Researcher produces the full file:line:snippet mention table per dispatch).**

| Namespace | Source location | Sample keys |
|---|---|---|
| `meta.*` | `layouts/Base.astro:17–18` defaults; per-page Base props in every `pages/*.astro` | `meta.home.title`, `meta.home.description`, `meta.thesis.title`, `meta.thesis.description`, `meta.404.title`, `meta.404.description`, `meta.projects.title`, `meta.projects.description`, `meta.notes.index.title`, `meta.notes.index.description`, `meta.projects.devswarm.title`, `meta.projects.devswarm.description`, `meta.projects.exocortex.title`, `meta.projects.exocortex.description`, `meta.projects.devswarm-cv.title`, `meta.projects.devswarm-cv.description` |
| `nav.*` | `components/Nav.astro:13,16–23,25–26,43` | `nav.brand`, `nav.now`, `nav.work`, `nav.projects`, `nav.notes`, `nav.cv`, `nav.thesis`, `nav.reading`, `nav.contact`, `nav.cta`, `nav.menu.open`, `nav.menu.close` |
| `footer.*` | `components/Footer.astro:9,12,16,25,30,32,36,37` | `footer.brand`, `footer.description`, `footer.col.site`, `footer.col.elsewhere`, `footer.col.contact`, `footer.thesis`, `footer.linkedin`, `footer.email.cta`, `footer.copyright`, `footer.opinions` (where `footer.copyright` value uses placeholder `"© {year} Tom Scholtes · Luxembourg"`) |
| `home.hero.*` | `components/Hero.astro:11,13–17,20–21,24–26`; `content/headlines.ts:3–32` | `home.hero.eyebrow`, `home.hero.lead`, `home.hero.cta.work`, `home.hero.cta.contact`, `home.hero.meta.years`, `home.hero.meta.years.label`, `home.hero.meta.casestudies`, `home.hero.meta.casestudies.label`, `home.hero.meta.languages`, `home.hero.meta.languages.label`, `home.hero.headlines.editorial.pre/em/post/label`, `home.hero.headlines.bold.pre/em/post/label`, `home.hero.headlines.plain.pre/em/post/label`, `home.hero.headlines.punchy.pre/em/post/label` |
| `home.now.*` | `components/Now.astro:9,11–14`; `content/now.ts:3,5–26` | `home.now.eyebrow`, `home.now.heading`, `home.now.blurb`, `home.now.items.working.k/v`, `home.now.items.building.k/v`, `home.now.items.running.k/v`, `home.now.items.learning.k/v`, `home.now.items.offclock.k/v`. **Note:** the `Running` value contains inline `<NoteLink>` JSX in `Now.astro:23–24` — that JSX stays in the component; the surrounding text fragments are split into keys `home.now.items.running.lead`, `home.now.items.running.middle`, `home.now.items.running.tail` and re-stitched in the component template. |
| `home.work.*` | `components/CaseStudies.astro:8,10,12–14`; `content/caseStudies.ts:11–73` (Cases 01–07 only) | `home.work.eyebrow`, `home.work.heading`, `home.work.blurb`, plus per-case keys `home.work.case.01.title/metric/label/blurb`, ..., `home.work.case.07.title/metric/label/blurb`. **Tags arrays** (`tags: [...]`) are also extracted as keys (`home.work.case.01.tag.0/1/2`) so DE/FR/RU translators can localize tag wording where natural (e.g., `'QA automation'` → `'Qualitätssicherung'` in DE). Case 08 strings (`caseStudies.ts:75–82`) NOT extracted (see conflict). |
| `home.cv.*` | `components/CV.astro:61,63–64,69,71,80–84,90,100,113` | `home.cv.eyebrow`, `home.cv.heading`, `home.cv.blurb`, `home.cv.experience.heading`, `home.cv.experience.summary` (with `{count}` and `{years}` placeholders → `"5 roles · 6+ years"` becomes `"{count} roles · {years}+ years"`), `home.cv.education.heading`, `home.cv.skills.heading`, `home.cv.publication.heading`, `home.cv.role.spv-controller.role`, `home.cv.role.spv-controller.period` (period strings stay literal English dates), `home.cv.role.spv-controller.note.0` (English-only, contains no leakage tokens; the second note bullet at `CV.astro:11` is general), `home.cv.role.spv-controller.note.2` (leakage bullet at `CV.astro:12`) **NOT extracted — stays inline literal**, `home.cv.role.spv-controller.note.3` (MCP/Outlook/Monday bullet at `CV.astro:13`), and similar for each of the four other roles, plus `home.cv.edu.0.degree`, `home.cv.edu.1.degree`, plus `home.cv.skills.row.0.k/v` through `home.cv.skills.row.7.k/v`, plus `home.cv.publication.subtitle`, `home.cv.publication.cta` |
| `home.reading.*` | `components/Reading.astro:3–6,12,14–15` | `home.reading.eyebrow`, `home.reading.heading`, `home.reading.blurb`, `home.reading.themes.0.t/n` through `home.reading.themes.3.t/n` |
| `home.languages.*` | `components/Languages.astro:3–8,14,16` | `home.languages.eyebrow`, `home.languages.heading`. Language NAMES (`English`, `Deutsch`, `Français`, `Русский`, `Lëtzebuergesch`, `Oʻzbekcha`) **stay literal** across locales — the autoglot convention is to render each language in its own script. |
| `home.colophon.*` | `components/Colophon.astro:7,8,11–22` | `home.colophon.eyebrow`, `home.colophon.heading`, `home.colophon.body.0`, `home.colophon.body.1`, `home.colophon.body.2` |
| `home.contact.*` | `components/Contact.astro:7,9–10,13–16,18,20,21` | `home.contact.eyebrow`, `home.contact.heading.pre`, `home.contact.heading.em`, `home.contact.heading.post`, `home.contact.body`, `home.contact.cta.linkedin`, `home.contact.cta.profile`, `home.contact.cta.email`, `home.contact.bg` (the giant "hi." backdrop — kept literal English) |
| `projects.index.*` | `pages/projects/index.astro:8–9,16,17,18–23,34–36,39,42–45,55–57,62,66–69` | `projects.index.eyebrow`, `projects.index.heading.pre`, `projects.index.heading.em`, `projects.index.heading.post`, `projects.index.blurb`, `projects.index.card.devswarm.num`, `.metric.num`, `.metric.lbl`, `.title`, `.body`, `.tag.0/1/2/3`, `projects.index.card.exocortex.*` (same fields), `projects.index.card.exocortex.metric.num` (`"live"`) |
| `projects.devswarm.*` | `pages/projects/devswarm/index.astro` (read end-to-end during FE-T5) | Chrome only (eyebrow, headings, captions, CTAs, "back" link). Large body prose stays English in the EN tree; DE/FR/RU tree pages get a `t('projects.devswarm.body')` block whose EN value is the original body text and whose DE/FR/RU values are full translations. **Architect recommendation:** if the body text exceeds ~600 words, split into named sub-blocks (`body.intro`, `body.architecture`, `body.evidence`, etc.) so translators can work in chunks. Researcher confirms exact split during inventory. |
| `projects.exocortex.*` | `pages/projects/exocortex/index.astro` | Same pattern as devswarm. |
| `projects.devswarm-cv.*` | `pages/projects/devswarm-cv/index.astro` | Same pattern. |
| `notes.index.*` | `pages/notes/index.astro:13–14,21,22,24–26` | `notes.index.eyebrow`, `notes.index.heading.pre`, `notes.index.heading.em`, `notes.index.heading.post`, `notes.index.sub` |
| `notes.detail.*` | `pages/notes/[slug].astro:22,46,57,66` | `notes.detail.eyebrow.prefix` (`"/ notes"`), `notes.detail.sources.heading`, `notes.detail.related.heading`, `notes.detail.back` (`"← all notes"`). Note **body** (the markdown content) stays English — out of scope per dispatch. |
| `error.404.*` | `pages/404.astro:6,12–17` | `error.404.title`, `error.404.description`, `error.404.heading`, `error.404.body`, `error.404.cta` |
| `thesis.*` | `pages/thesis.astro` (read during FE-T5) | All prose strings on the thesis page. Headline/abstract/methodology/findings keys as appropriate. |
| `actions.*` | shared CTAs across pages | `actions.read`, `actions.view`, `actions.message`, `actions.email`, `actions.back`, `actions.say-hi`, `actions.get-in-touch` |
| `langswitcher.*` | `components/LangSwitcher.astro` | `langswitcher.aria.group` (= `"Language"` / `"Sprache"` / `"Langue"` / `"Язык"`). Label codes (`EN/DE/FR/RU`) stay literal. |

**Total estimated key count:** ~320 keys (rough; Researcher gives exact count). Order in en.json: alphabetical by key for stable diffs.

### FE-T5. Replace hardcoded strings with `t(key)` calls

Walk every MODIFY file and substitute strings per the inventory. Pattern in each `.astro`:

```astro
---
import { t as translate, getLocale } from '../i18n';
const locale = Astro.currentLocale ?? getLocale(Astro.url);
const t = (k: string, vars?: Record<string, string|number>) => translate(k, locale, vars);
---
```

Constraints:
- Placeholders `{name}`, `{count}`, `{year}` survive — use the `vars` argument.
- Markdown / inline HTML preserved verbatim — the value `"Built with <strong>Astro 5</strong>..."` is OK; translators must keep the `<strong>` tag.
- Em-dash audit per file before commit. `grep -P $'\xe2\x80\x94' <file>` returns zero matches.
- `aria-label` attributes that are user-facing get `t()` too (`nav.menu.open`, `nav.menu.close`, `langswitcher.aria.group`).

### FE-T6. Refactor `content/headlines.ts`, `content/now.ts`, `content/caseStudies.ts`

- `headlines.ts`: keep the `Headline` type and the `HEADLINES` map keyed by `editorial/bold/plain/punchy`, but each value now exposes only `key` and `label`. Components fetch `pre/em/post/label` via `t('home.hero.headlines.editorial.pre')` etc.
- `now.ts`: keep the `NowItem` type and the structural array of five items keyed by `working/building/running/learning/offclock`. The `k` discriminator field stays as a stable ID (`'Working on'`, `'Building'`, ...) for the conditional in `Now.astro:22`. Switch `Now.astro:22` from string-equality on `'Running'` to discriminator-equality on `it.id === 'running'`. The displayed `k` label resolves via `t('home.now.items.{id}.k')`; the `v` resolves via `t('home.now.items.{id}.v')`.
- `caseStudies.ts`: keep the `CaseStudy` type and the structural array of eight cases, but for cases 01–07 the `title/metric/label/blurb/tags` fields are populated from `t('home.work.case.{n}.title')` etc. at render time inside `CaseStudies.astro` / `CaseStudyCard.astro`. Case 08 fields stay literal English (see conflict).

### FE-T7. Create dictionaries `de.json`, `fr.json`, `ru.json` as key-complete mirrors

First pass: copy `en.json` verbatim to each non-default locale file. This makes every key present so `check-i18n.mjs` passes immediately when wired. Second pass (FE-T13): overwrite values with real translations.

### FE-T8. `src/components/LangSwitcher.astro`

```astro
---
import { LOCALES, getLocale, localizePath, t as translate } from '../i18n';
const locale = Astro.currentLocale ?? getLocale(Astro.url);
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

Mount in `Nav.astro` between `</nav>` (closing `.nav-links`) and `<a ... class="nav-cta">`. Inside `.container.nav-inner` on the desktop layout, the switcher sits right of the link cluster. On mobile (`data-open="true"` state), it stacks below the link list.

### FE-T9. Append CSS in `src/styles/components.css`

Append-only (do not touch other rules):

```css
.lang-switcher {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.lang-switch {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--muted);
  padding: 4px 6px;
  position: relative;
  transition: color 200ms ease;
}
.lang-switch.is-active { color: var(--ink); }
.lang-switch::after {
  content: '';
  position: absolute;
  left: 6px; right: 6px; bottom: 2px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 200ms ease;
}
.lang-switch.is-active::after,
.lang-switch:hover::after { transform: scaleX(1); }
@media (prefers-reduced-motion: reduce) {
  .lang-switch, .lang-switch::after { transition: none; }
}
```

Matches the existing hover idiom (200 ms underline grow, no color shift on hover; the active state gets a permanent underline + ink color). Reduced-motion gate present.

### FE-T10. Wrapper-page tree under `src/pages/{de,fr,ru}/`

For each of the 9 logical pages, create three wrapper files (one per non-default locale). Each wrapper is a thin re-export of the canonical page body. Astro 5 routes them via the `[locale]` segment in the URL, and `Astro.currentLocale` is set automatically by the i18n routing.

**Wrapper template** (example for `src/pages/de/index.astro`):

```astro
---
// Locale wrapper — body renders via shared components which consume Astro.currentLocale.
import IndexPage from '../index.astro';
---
<IndexPage />
```

**For dynamic routes** (`src/pages/de/notes/[slug].astro`):

```astro
---
import NoteDetail from '../../notes/[slug].astro';
export { getStaticPaths } from '../../notes/[slug].astro';
---
<NoteDetail />
```

(Astro 5 supports re-exporting `getStaticPaths` from another route file; if the runtime resists, fall back to inlining the `getStaticPaths` body that calls `getCollection('notes', ...)` and re-using `entry` props.)

For each non-default locale, this produces:

```
src/pages/de/index.astro
src/pages/de/thesis.astro
src/pages/de/404.astro
src/pages/de/projects/index.astro
src/pages/de/projects/devswarm/index.astro
src/pages/de/projects/exocortex/index.astro
src/pages/de/projects/devswarm-cv/index.astro
src/pages/de/notes/index.astro
src/pages/de/notes/[slug].astro
```

× 3 locales = **27 wrapper files**, each ≤ 6 lines. No business logic.

### FE-T11. `src/layouts/Base.astro` — locale-aware head

Modify to:
- Set `<html lang={locale}>` (currently `lang="en"` hardcoded at line 27).
- Default `title` and `description` props resolved via `t('meta.home.title')`, `t('meta.home.description')`.
- `canonical` URL is locale-aware via `localizePath`.
- Add `<link rel="alternate" hreflang="..." href="...">` per locale (4 entries) for SEO completeness.
- `og:locale` set to `{en:'en_GB', de:'de_DE', fr:'fr_FR', ru:'ru_RU'}[locale]`.
- Preserve existing fonts, og:image, JSON-LD wiring.

### FE-T12. `scripts/check-i18n.mjs` — build gate

Implement:

```js
#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const I18N_DIR = 'src/i18n';
const LOCALES = ['en','de','fr','ru'];
const EM_DASH = '\u2014';
const LEAKAGE = ['Sofia','Bekzoda','Triton','composite-keys','Investran','Dealsplus','Luke','Joakim','Anna','Conrad','Adam'];

const load = (l) => JSON.parse(readFileSync(`${I18N_DIR}/${l}.json`, 'utf8'));
const en = load('en');
const enKeys = Object.keys(en).sort();
const errors = [];

for (const locale of ['de','fr','ru']) {
  const dict = load(locale);
  const dictKeys = new Set(Object.keys(dict));
  for (const k of enKeys) if (!dictKeys.has(k)) errors.push(`missing ${locale}: ${k}`);
  for (const k of dictKeys) if (!enKeys.includes(k)) errors.push(`extra ${locale}: ${k}`);
  for (const k of enKeys.filter((k) => dictKeys.has(k))) {
    const enVal = String(en[k] ?? '');
    const val = String(dict[k] ?? '');
    const placeholders = enVal.match(/\{[a-zA-Z0-9_]+\}/g) ?? [];
    for (const ph of placeholders) {
      if (!val.includes(ph)) errors.push(`placeholder drift ${locale}: ${k} missing ${ph}`);
    }
    if (val.includes(EM_DASH)) errors.push(`em-dash ${locale}: ${k}`);
    for (const name of LEAKAGE) {
      const re = new RegExp(`\\b${name}\\b`, 'i');
      if (re.test(val)) errors.push(`leakage ${locale}: ${k} contains "${name}"`);
    }
  }
}
// Also check EN for em-dash + leakage (defense in depth)
for (const k of enKeys) {
  const val = String(en[k] ?? '');
  if (val.includes(EM_DASH)) errors.push(`em-dash en: ${k}`);
  for (const name of LEAKAGE) {
    const re = new RegExp(`\\b${name}\\b`, 'i');
    if (re.test(val)) errors.push(`leakage en: ${k} contains "${name}"`);
  }
}

if (errors.length) {
  console.error(`\n✗ check-i18n FAILED: ${errors.length} issue(s)\n`);
  errors.slice(0, 100).forEach((e) => console.error(`  ${e}`));
  if (errors.length > 100) console.error(`  ... and ${errors.length - 100} more`);
  process.exit(1);
}
console.log(`✓ check-i18n: ${enKeys.size} keys × 4 locales, key-parity + placeholders + em-dash + leakage all clean`);
```

### FE-T13. `package.json` — wire build gate FIRST

```diff
- "build": "node scripts/check-notes.mjs && node scripts/copy-fonts.mjs && node scripts/make-og.mjs && astro build && node scripts/post-build.mjs",
+ "build": "node scripts/check-i18n.mjs && node scripts/check-notes.mjs && node scripts/copy-fonts.mjs && node scripts/make-og.mjs && astro build && node scripts/post-build.mjs",
```

### FE-T14. First green build

`cd V2 && npm run build`. Must exit 0 with check-i18n green (key parity holds because de/fr/ru mirror en exactly) and check-notes green. Tail of output saved for Reviewer-Deployer PR description.

### FE-T15. Fill DE / FR / RU translations

Open each non-default JSON and overwrite values. Apply registers per the i18n.md rules:

- **DE — Sie-form throughout.** Avoid Anglicisms unless they're the established professional term (`Software Engineer`, `Compliance`, `Controller` stay English). Headings: faithful, not literal (`"Patterns I've worked through."` → `"Muster, die ich durchgearbeitet habe."`). Technical terms (`MCP`, `RAG`, `OpenKB`, `DevSwarm`, `Astro`, `React`, `Tailscale`) literal.
- **FR — vouvoiement** throughout. Luxembourgish / Belgian French norms where they diverge (`courriel` not `mail`; `septante`/`nonante` avoided in favor of `soixante-dix`/`quatre-vingt-dix` per Belgium-LU usage). Comma-decimal preserved if any numeric strings appear.
- **RU — modern professional register, «вы» form.** `не калька с английского`. Brand names in Latin script (`Tom Scholtes` stays Latin, not transliterated to `Том Шольтес`). Technical terms (MCP, RAG, Astro) in Latin script per modern professional usage.

Constraints during translation:
- Em-dash forbidden in every locale. Use point / semicolon / rewrite.
- Leakage list forbidden in every locale.
- Placeholders `{name}`, `{year}`, `{count}` preserved verbatim.
- Inline markdown / HTML preserved verbatim.

### FE-T16. Second green build

`npm run build` again. Confirms translations don't break placeholders or sneak em-dashes through. Exit 0 required.

### FE-T17. Spot-check routes locally

`npm run preview` (or read `dist/` directly). Confirm `dist/index.html`, `dist/de/index.html`, `dist/fr/index.html`, `dist/ru/index.html` exist. Confirm `dist/notes/index.html` and `dist/de/notes/index.html` exist. Confirm one note slug exists in all four trees (`dist/notes/mcp-workstream/index.html`, `dist/de/notes/mcp-workstream/index.html`, ...).

## Backend tasks

NOT_REQUIRED. Static GitHub Pages site, no server runtime. No build-time endpoint added. Backend persona reads its LESSONS.md, reads the three rules files, confirms the static-site nature, emits NOT_REQUIRED, exits.

## Acceptance criteria

Reviewer-Deployer executes in order. Evidence captured into PR description. Does NOT auto-merge.

1. **Build green.** `cd workspace/.target_repo && npm ci && npm run build` exits 0. Output contains:
   - `✓ check-i18n: <N> keys × 4 locales, key-parity + placeholders + em-dash + leakage all clean`
   - `✓ check-notes passed: ...`
   - No `[ERROR]` lines from Astro.
   Tail (last 30 lines) attached to PR.
2. **check-i18n is the FIRST gate.** `grep -E '^\s*"build"' package.json` shows `node scripts/check-i18n.mjs &&` ahead of `node scripts/check-notes.mjs &&`. Attach the line.
3. **Four URL trees present in `dist/`.** All of these are non-zero-byte files:
   - `dist/index.html`, `dist/de/index.html`, `dist/fr/index.html`, `dist/ru/index.html`
   - `dist/thesis/index.html`, `dist/de/thesis/index.html`, `dist/fr/thesis/index.html`, `dist/ru/thesis/index.html`
   - `dist/projects/index.html` + three locale variants
   - `dist/projects/devswarm/index.html` + three locale variants
   - `dist/projects/exocortex/index.html` + three locale variants
   - `dist/projects/devswarm-cv/index.html` + three locale variants
   - `dist/notes/index.html` + three locale variants
   - For at least one note slug (`mcp-workstream`): `dist/notes/mcp-workstream/index.html` + three locale variants
   Bash one-liner: `for L in '' de/ fr/ ru/; do for P in index thesis/index projects/index projects/devswarm/index projects/exocortex/index projects/devswarm-cv/index notes/index notes/mcp-workstream/index; do test -s "dist/${L}${P}.html" || { echo "MISSING dist/${L}${P}.html"; exit 1; }; done; done; echo OK`. Output `OK` attached.
4. **Em-dash ban.** `grep -rP $'\xe2\x80\x94' src/i18n/ src/components/LangSwitcher.astro src/pages/` returns ZERO matches. Command and count attached.
5. **Leakage word-boundary check.** `grep -riE '\b(Sofia|Bekzoda|Triton|composite-keys|Investran|Dealsplus|Luke|Joakim|Anna|Conrad|Adam)\b' src/i18n/` returns ZERO matches. (Pre-existing inline strings in `src/components/CV.astro` and `src/content/caseStudies.ts` are NOT inside `src/i18n/` and are intentionally excluded per the conflict-resolution above.) Command and count attached.
6. **LangSwitcher is not a React island.** `grep -rE "client:(load|idle|visible|media|only)" src/components/LangSwitcher.astro` returns ZERO matches. `grep -rE "react|jsx|tsx" src/components/LangSwitcher.astro` returns ZERO matches.
7. **No new deps.** `git diff main -- package.json package-lock.json` shows ZERO added `dependencies` or `devDependencies`. The only `package.json` change is the `build` script.
8. **Tokens untouched.** `git diff main -- src/styles/tokens.css` is empty. Also `src/styles/global.css` and `src/styles/pages.css` empty. Only `src/styles/components.css` shows the appended `.lang-switcher` / `.lang-switch` rules.
9. **i18n block correct.** `grep -A 6 'i18n:' astro.config.mjs` shows `defaultLocale: 'en'`, `locales: ['en','de','fr','ru']`, `prefixDefaultLocale: false`. No `redirectToDefaultLocale` value set.
10. **Key parity proof.** From inside `node`: load all four JSONs, assert `Object.keys(en).sort()` deep-equal to `Object.keys(de).sort()` deep-equal to `Object.keys(fr).sort()` deep-equal to `Object.keys(ru).sort()`. Print `N keys × 4 locales`. Attach.
11. **Placeholder preservation.** For every EN value containing `{var}` placeholders, the corresponding DE/FR/RU value contains the same placeholders. `check-i18n.mjs` enforces this; PR captures the line `placeholder drift ... 0` (or equivalent clean output).
12. **LangSwitcher rendered on every page.** `grep -l 'lang-switcher' dist/**/index.html | wc -l` ≥ 36 (9 pages × 4 locales).
13. **Layout invariance (chrome).** `grep -c 'class="hero"' dist/index.html`, `dist/de/index.html`, `dist/fr/index.html`, `dist/ru/index.html` — each returns 1. Same for `class="hero-meta"`, `class="cases"`, `class="cv-block"`, `class="lang-grid"`. (Full visual diff is a Tom-side check after deploy; Reviewer-Deployer does not run headless screenshots in this batch.)
14. **`<html lang>` per locale.** `grep -h 'html lang=' dist/index.html dist/de/index.html dist/fr/index.html dist/ru/index.html` returns four distinct values (`"en"`, `"de"`, `"fr"`, `"ru"`).
15. **No third-party i18n libs.** `grep -E "i18next|react-i18next|next-i18next|vue-i18n|@formatjs|svelte-i18n" package.json` returns ZERO matches.
16. **prefers-reduced-motion respected on LangSwitcher.** `grep -A 1 'prefers-reduced-motion' src/styles/components.css | grep -q 'lang-switch'` succeeds (the appended block contains a reduced-motion guard for `.lang-switch`).
17. **PR opened, not merged.** Branch pushed (orchestrator-supplied name, e.g., `devswarm/<project_id>`). `gh pr create` against `main` succeeds. PR URL captured to `workspace/.pr_url`. PR description includes: (a) the diff of `astro.config.mjs` `i18n` block, (b) counts of files created (34) vs modified (20), (c) build output tail from criterion 1, (d) grep evidence from criteria 4 + 5 + 6 + 7 + 9 + 15 verbatim, (e) key-parity proof from criterion 10, (f) the 17 criteria as a pass/fail checklist. Reviewer-Deployer STOPS at PR open per dispatch.

[opus + 11 tool calls]

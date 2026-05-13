# PLAN.md — tomscholtes-v3

Surgical evolution of V2 (`/home/sofia/Projects/Personal_Website/V2/`) into an Astro 5 static build, exit-track-calibrated, honesty-audited per §2 of the brief. Aesthetic identity (terracotta · Instrument Serif + Inter + JetBrains Mono · light/dark/ink · Tweaks Panel) is preserved; the React-from-CDN + Babel-in-browser pipeline is removed.

## Stack
- **Astro 5.x** (static output, `output: 'static'`, no SSR adapter)
- **React 18.3.1** retained ONLY for two interactive islands — `TweaksPanel` and `DisplayPanel` — via `@astrojs/react`, hydrated `client:idle`
- **astro:assets** for image optimisation (`sharp` builtin) and OG image embedding
- **satori + @resvg/resvg-js** for build-time OG image generation (lightest, no headless browser; integrated via a tiny Astro endpoint that emits a static `.png` to `public/og/`)
- **Inline SVG** for architecture diagrams (no JS, theme-aware via `currentColor` and `data-theme` ancestor selectors)
- **Self-hosted woff2** subsets for Instrument Serif (Latin + Latin-Ext), Inter (Latin + Latin-Ext + Cyrillic), JetBrains Mono (Latin), preloaded with `<link rel="preload" as="font" crossorigin>`; total budget < 80 KB
- **Vanilla JS** (≤ 1 KB) for: nav hamburger, hero-card rotation, IntersectionObserver scroll reveals
- **No** Tailwind, no CSS-in-JS, no client router. Global CSS is V2's existing stylesheet, refactored into `src/styles/`
- **No** runtime backend, no analytics, no service worker
- **Build target:** initial JS < 15 KB gz, total HTML+CSS+font < 200 KB gz, Lighthouse Performance ≥ 95
- **Deploy:** GitHub Pages from `dist/`. Custom domain `tomscholtes.com` via existing `CNAME`. `.nojekyll` preserved

## File layout
```
frontend/
  astro.config.mjs
  package.json
  tsconfig.json
  .nvmrc                                   # node 20 LTS
  public/
    CNAME                                  # "tomscholtes.com" — preserved verbatim
    .nojekyll                              # empty file — preserved
    favicon.svg
    fonts/
      instrument-serif-regular.woff2
      instrument-serif-italic.woff2
      inter-400.woff2
      inter-500.woff2
      inter-600.woff2
      inter-700.woff2
      jetbrains-mono-400.woff2
      jetbrains-mono-500.woff2
    og/
      default.png                          # generated at build time
  src/
    pages/
      index.astro                          # the main site
      thesis.astro                         # ported from V2 /thesis.html
      404.astro                            # ported from V2 /404.html
      projects/
        index.astro                        # ported from V2 /projects/index.html
        devswarm/
          index.astro                      # ported from V2 /projects/devswarm/index.html
        devswarm-cv/
          index.astro                      # ported from V2 /projects/devswarm-cv/index.html
        exocortex/
          index.astro                      # ported from V2 /projects/exocortex/index.html
      og/
        default.png.ts                     # Astro endpoint that returns satori-rendered PNG
    components/
      Nav.astro
      Hero.astro
      HeroComposition.astro                # NEW — wraps two rotating HeroCards
      HeroCardAccounts.astro               # V2's annual-accounts flow, ported
      HeroCardDevSwarm.astro               # NEW — DevSwarm idea-to-PR flow card
      FlowRow.astro
      Now.astro
      CaseStudies.astro
      CaseStudyCard.astro                  # NEW — extracted card primitive
      CV.astro
      Reading.astro
      Languages.astro
      Colophon.astro
      Contact.astro
      Footer.astro
      JsonLdPerson.astro                   # NEW — emits <script type="application/ld+json">
      ArchitectureDevSwarm.astro           # NEW — inline SVG, 5-persona flow
      ArchitectureExocortex.astro          # NEW — inline SVG, G2 → Claude Code stack
      islands/
        TweaksPanel.jsx                    # React island, client:idle
        DisplayPanel.jsx                   # React island, client:idle
    layouts/
      Base.astro                           # <head>, meta, OG, JSON-LD, font preloads
    styles/
      tokens.css                           # :root + [data-theme=...] custom properties
      global.css                           # body, container, .serif, .mono, .eyebrow, rules
      components.css                       # per-component scoped rules ported from V2
    content/
      caseStudies.ts                       # 7 case studies as typed data (no MD overhead)
      headlines.ts                         # the 4 V3 headline options + default selection
      now.ts                               # /now copy as structured data
    lib/
      og.ts                                # satori template (JSX-as-VDOM, no React runtime)
      theme.ts                             # tiny pre-paint script (inlined into <head>)
backend/
  (NOT_REQUIRED — see Backend tasks)
```

## API contracts
NOT_REQUIRED for runtime. One **build-time** Astro endpoint:

- `GET /og/default.png` — Astro static endpoint (`src/pages/og/default.png.ts`). Renders satori → resvg → PNG (1200×630). Returns `Response` with `image/png`. Evaluated at build, output written to `dist/og/default.png`. Referenced from `<meta property="og:image">` and `<meta name="twitter:image">`. No request-time execution.

## DB schema
NOT_REQUIRED — static site. All "content" lives in typed TS modules under `src/content/`.

## V2 → V3 component mapping

| V2 source (file:lines) | V3 replacement | Hydration |
|---|---|---|
| `index.html` (head + CDN scripts + inline `<style>`) | `src/layouts/Base.astro` + `src/styles/{tokens,global,components}.css` | static |
| `app.jsx:3-25` `TWEAK_DEFAULTS` / `ACCENTS` / `HEADLINES` | `src/content/headlines.ts` + props on `TweaksPanel` island | static config |
| `app.jsx:26` `App` (root composition) | `src/pages/index.astro` | static |
| `app.jsx:112` `Nav` | `Nav.astro` (hamburger toggle is 12 LOC vanilla JS) | static + tiny inline JS |
| `app.jsx:153` `Hero` | `Hero.astro` + `HeroComposition.astro` | static |
| `app.jsx:213` `HeroCard` (annual-accounts) | `HeroCardAccounts.astro` (wrapped by `HeroComposition`) | static + 1 KB JS rotator |
| — (new) | `HeroCardDevSwarm.astro` — 5-persona idea-to-PR flow card | static |
| `app.jsx:235` `FlowRow` | `FlowRow.astro` | static |
| `app.jsx:249` `Now` | `Now.astro` (copy from `src/content/now.ts`) | static |
| `app.jsx:280` `CaseStudies` | `CaseStudies.astro` + `CaseStudyCard.astro` (data from `src/content/caseStudies.ts`) | static |
| `app.jsx:377` `Writing` | **DELETED** (per §4.6, §7.7 — four "Coming soon" entries removed; nav + footer links also removed) | n/a |
| `app.jsx:411` `CV` | `CV.astro` | static |
| `app.jsx:504` `Reading` | `Reading.astro` | static |
| `app.jsx:534` `Languages` | `Languages.astro` (six languages: EN, DE, FR, RU, LU, UZ) | static |
| `app.jsx:564` `Colophon` | `Colophon.astro` | static |
| `app.jsx:588` `Contact` | `Contact.astro` (calibrated copy per the dispatch brief) | static |
| `app.jsx:612` `Footer` | `Footer.astro` | static |
| `tweaks-panel.jsx` | `src/components/islands/TweaksPanel.jsx` | **React island, `client:idle`** |
| `display-panel.jsx` | `src/components/islands/DisplayPanel.jsx` | **React island, `client:idle`** |
| `thesis.html` | `src/pages/thesis.astro` | static |
| `404.html` | `src/pages/404.astro` | static |
| `projects/index.html` | `src/pages/projects/index.astro` | static |
| `projects/devswarm/index.html` | `src/pages/projects/devswarm/index.astro` | static |
| `projects/devswarm-cv/index.html` | `src/pages/projects/devswarm-cv/index.astro` | static |
| `projects/exocortex/index.html` | `src/pages/projects/exocortex/index.astro` | static |

**React islands retained (and only these):** `TweaksPanel`, `DisplayPanel`. They mutate `<html data-theme>`, `data-density`, `data-accent`, `data-headline`, persist to `localStorage`, and need event handlers + state — Astro static cannot do this. Everything else compiles to zero-JS HTML.

## New components to design

### `HeroComposition.astro`
Wraps `HeroCardAccounts` and `HeroCardDevSwarm` in a single positioned container with a 12 LOC vanilla JS rotator (`setInterval` 6 s, `prefers-reduced-motion: reduce` short-circuits to first card only, opacity crossfade via CSS class swap). No framework. The DevSwarm card is the Frontend persona's flagship motion piece — small terminal-style stack of FlowRows with the wall-clock `Total 4m 42s → cv-onepager #1`.

### `ArchitectureDevSwarm.astro` (inline SVG)
Theme-aware via `currentColor` for strokes and `var(--accent)` / `var(--ink)` / `var(--muted)` for fills. Five-node flow: Architect → (Researcher, Frontend, Backend in parallel) → Reviewer-Deployer → PR. Each node is a `<g>` with `role="img"` and an `<aria-label>`. Width 100%, viewBox-driven, ≤ 4 KB. Embedded in `/projects/devswarm/index.astro`.

### `ArchitectureExocortex.astro` (inline SVG)
G2 glasses → Pixel 7 (Tailscale node) → Fedora server → Even Terminal :3456 → patched Claude Code → MCP fan-out to OpenKB + Meridian + Notion + Asana. Same theming pattern. Embedded in `/projects/exocortex/index.astro` (replacing any ASCII diagram present in V2).

### `CaseStudyCard.astro`
Extracted card primitive. Props: `eyebrow`, `title`, `body`, `metric`, `metricLabel`, `href?`. Subtle `transform: translateY(-2px)` on hover; theme-aware metric pill (`background: var(--accent)`, `color: var(--bg)`). Disabled when `prefers-reduced-motion: reduce`.

### `OGImageTemplate` (`src/lib/og.ts`)
Satori VDOM (not real React — satori consumes a JSX-shaped tree without React runtime). 1200×630. Black `#0E0E0C` background. Name in Instrument Serif 96 px, accent terracotta `#C4623A`. Through-line ("Six years…") in Inter 32 px. Tiny inline 5-node DevSwarm SVG in the bottom-right corner. Reads woff2 files directly from `public/fonts/` at build, returns a `React.ReactNode`-shaped tree. `@resvg/resvg-js` rasterises to PNG, written to `dist/og/default.png`. Referenced absolutely (`https://tomscholtes.com/og/default.png`) in OG/Twitter meta.

## Content edits (file-by-file)

**`src/layouts/Base.astro`** (per §4.1)
- `<title>` → `"Tom Scholtes — finance ops engineer who automates the work in reach. Looking for a data/automation seat in 2026."`
- `<meta name="description">` → the §4.1 V3 value verbatim.
- Add OpenGraph + Twitter Card meta. `og:image` = `https://tomscholtes.com/og/default.png`.
- Add `JsonLdPerson.astro` emission: `name`, `jobTitle: "Finance ops engineer"`, `worksFor: { "@type": "Organization", "name": "Triton" }` (employer kept anonymised on-site copy via "Working in Controlling" per the dispatch default; structured data uses real name for ATS but visible body copy does not), `nationality`, `knowsLanguage: ["en","de","fr","ru","lb","uz"]`, `sameAs: [linkedin, github]`.
- Replace Google Fonts `<link>` with self-hosted `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the three primary weights, plus an inline `@font-face` block.
- Inline 6-line pre-paint theme script (reads `localStorage.theme`, falls back to `prefers-color-scheme`, sets `<html data-theme>`).

**`src/content/headlines.ts`** (per §1)
- Default: `editorial` → use the calibrated phrasing from the dispatch brief (NOT the §1 "Looking for a seat" variant). The default editorial value:
  > *"Six years in Luxembourg fund services, quietly automating the desk underneath me. Always interested in conversations about data engineering, automation, applied AI, multi-agent systems, knowledge engineering, agent infrastructure — especially where they meet regulated workflows."*
- Keep `bold`, `plain`, `punchy` from §1 as alternates accessible via Tweaks Panel.

**`Hero.astro`** (per §4.3)
- Lead paragraph → §4.3 V3 replacement, adjusted to "six years", "Available from June 2026", no "looking for the seat" verbatim — use the calibrated framing.
- Hero-meta strip: `6 yrs · 7 case studies · 6 languages`.
- CTA buttons: `"See the work"` + `"Get in touch"` (NOT "Open roles I'd take" — too direct for an employed exit; preserves V2's calibrated posture per dispatch).
- Composition: rotating `HeroCardAccounts` ↔ `HeroCardDevSwarm`.

**`Now.astro`** (per §4.4)
- Eyebrow `/ now · May 2026`.
- Bullets per the dispatch defaults — `Working on`, `Building` (DevSwarm), `Running` (Exocortex, 44 docs), `Learning`, `Off the clock`.
- The "Looking for" line is **omitted** in favour of the calibrated About-section phrasing. Reason: dispatch brief specifies no explicit job-hunt phrase visible to all visitors while Tom is still employed.

**`CaseStudies.astro` / `src/content/caseStudies.ts`** (per §4.5)
- All 7 cases kept as-is (dispatch §4 input).
- Order: keep V2's 01–07 (dispatch did not request reordering).
- Case 07 (`AI Skill Architecture`) — append the one-line `"From single-purpose skills to five-persona orchestration → DevSwarm v1, see Projects."` reference.
- **Add Case Study 08** (per dispatch input 5): `"Investran ↔ Dealsplus composite-keys bridge (designed)"`. Copy: `"Designed a composite-keys bridging architecture for Investran ↔ Dealsplus reconciliation while the instrument master was still being scoped. Proposed internally; not deployed."` Metric: `"Pattern · designed"`. **DO NOT use the words "deployed" or "shipped" anywhere on this card** (§2 honesty table).

**`Writing.astro`** — **NOT CREATED**. Section removed entirely from page composition. Nav and Footer link references removed.

**`CV.astro`** (per §4.7 + dispatch input 13)
- Employer anonymisation preserved: `"Working in Controlling"` (dispatch input 2 default).
- Triton role bullets — add the three new bullets verbatim from dispatch input 13:
  - "Payment automation across the SPV book — batch generation, exception routing, recharge / intercompany cases"
  - "Investran ↔ Dealsplus data integration (composite-keys bridging architecture)"
  - "Task management workstream via MCP — Outlook + Monday.com wired into Claude Code through MCP"
- Skills: append `AI infra` and `Dev` rows per §4.7. Append `· Even Realities G2 SDK (assembled stack)` to AI tooling.
- Languages: six (EN, DE, FR, RU, LU, UZ).

**`Languages.astro`** (per dispatch input 3) — six languages, copy per V2's existing structure.

**`Colophon.astro`** — add the line `"V3 of this site was built by DevSwarm, the five-persona Claude Code orchestrator described in Projects."` (it IS being built by DevSwarm — verified true).

**`Contact.astro`** (per dispatch About-section block — the single most important edit)
- Body copy verbatim: *"Always interested in conversations about data engineering, automation, applied AI, multi-agent systems, knowledge engineering, agent infrastructure — especially where they meet regulated workflows."*
- **DO NOT** use V2's "not taking on commercial work" — that line is fully removed.
- **DO NOT** use the §4.11 draft "Open to data / analytics / automation / applied-AI roles" — overruled by the dispatch's calibrated copy (Tom is still employed at Triton; public "looking" copy is an exposure risk).
- CTAs unchanged: LinkedIn / Email / View profile.
- Big serif headline preserved: *"If any of this is interesting, say hi."*

**`Footer.astro`** — description line edited: remove `"Non-commercial."`; replace with `"Notes on AI in finance ops, a live CV, and a portfolio of work."` (no exit-posture phrasing — matches Contact calibration).

**`/projects/index.astro`** (per §5)
- Two project cards: DevSwarm v1, Personal AI Exocortex.
- **DO NOT** surface `go` Luxembourg routing CLI (dispatch input 9).
- DevSwarm card metric: `"4m 42s — idea to PR"` (dispatch input 12 confirms this number is correct).
- Verify link to real PR `https://github.com/tomscholtes93-collab/devswarm-smoke-20260512/pull/1` is present and visible.

**`/projects/devswarm/index.astro`** — port V2 content. Add `ArchitectureDevSwarm.astro` inline SVG. Confirm OpenKB "44 docs indexed" stays (dispatch input 7). Honesty audit: `grep -i jarvis` must return zero matches OR only the §2-compliant phrasing.

**`/projects/exocortex/index.astro`** — port V2 content. Add `ArchitectureExocortex.astro` inline SVG (replacing any ASCII diagram). 44-docs stays. Same Jarvis grep gate.

**`/projects/devswarm-cv/index.astro`** — port V2 verbatim; this is the "look ma, the swarm built this" artifact. Embedded iframe of the cv-onepager output preserved.

## OG image generation approach

**Choice: satori + @resvg/resvg-js**, wired through a static Astro endpoint.

Rationale: `@vercel/og` is a thin wrapper around the same two libs and pulls in Edge-runtime polyfills DevSwarm doesn't need. `astro-og-canvas` uses canvaskit-wasm (~ 5 MB build dep). The raw satori + resvg pair is < 2 MB of build dependencies, no runtime dep at all, and integrates as a normal Astro endpoint (`src/pages/og/default.png.ts`) that returns a `Response`. Astro's static build executes it once and writes `dist/og/default.png`. The endpoint reads woff2 files from `public/fonts/` directly so the OG image uses the same Instrument Serif glyphs as the live site — visual consistency in iMessage / Slack previews.

The template lives in `src/lib/og.ts`. Tested by visual diff during local `astro dev`.

## Font self-hosting plan

Source the three families from `fontsource` packages (`@fontsource/instrument-serif`, `@fontsource/inter`, `@fontsource/jetbrains-mono`), then **subset locally with `pyftsubset`** during a one-time `npm run subset:fonts` script (committed output, not run on every build):

| Family | Weights | Unicode ranges | Approx size (woff2) |
|---|---|---|---|
| Instrument Serif | 400 regular + 400 italic | U+0000-024F (Latin + Latin-Ext, covers `ëéàâô` for Luxembourgish/French) | ~14 KB × 2 = 28 KB |
| Inter | 400, 500, 600, 700 | U+0000-024F + U+0400-04FF (Cyrillic for RU/UZ) | ~9 KB × 4 = 36 KB |
| JetBrains Mono | 400, 500 | U+0000-00FF (Basic Latin + Latin-1 Supplement only — used for code/metadata, no Cyrillic needed) | ~7 KB × 2 = 14 KB |

**Total: ~78 KB.** Inside the < 80 KB budget.

Lëtzebuergesch diacritic check: `ë` (U+00EB), `é` (U+00E9), `ä` (U+00E4), `ö` (U+00F6) all in Latin-Ext range. Uzbek Latin orthography (`oʻ`, `gʻ`) needs `ʻ` (U+02BB) — added explicitly to subset range for Inter only.

`@font-face` declarations use `font-display: swap` and `unicode-range` to scope Cyrillic fallback only when needed.

## Frontend tasks

> **Frontend persona: BEFORE writing any component, invoke `/frontend-design:frontend-design` skill** (per dispatch instructions). Use it on `HeroComposition`, `CaseStudyCard`, both inline-SVG architecture diagrams, the OG template, and the rotating-card motion design.

- Scaffold Astro 5 project under `frontend/` with `@astrojs/react` integration; configure `output: 'static'`, `site: 'https://tomscholtes.com'`, base `/`, `build.assets: '_astro'`.
- Move V2's inline `<style>` from `index.html:17-end` into `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/components.css`. Preserve every CSS custom property and every theme override (`[data-theme="dark"]`, `[data-theme="ink"]`, density variants, accent variants). Do NOT change values.
- Port the V2 page composition into `src/pages/index.astro` using the component map above. Each `function Xxx()` in `app.jsx` becomes one `.astro` component receiving plain props.
- Implement `HeroComposition` rotation + scroll reveals using IntersectionObserver. `prefers-reduced-motion: reduce` disables both.
- Implement `TweaksPanel.jsx` and `DisplayPanel.jsx` as React islands hydrated `client:idle`. Port from V2 with minimal change; replace any DOM lookups for `<html>` with `document.documentElement` calls and persist to `localStorage`.
- Implement `ArchitectureDevSwarm.astro` and `ArchitectureExocortex.astro` as accessible inline SVG (per dispatch — NO ASCII).
- Implement satori OG template + Astro endpoint at `src/pages/og/default.png.ts`.
- Self-host fonts: commit subsetted woff2 to `public/fonts/`, write `@font-face` block, remove all `fonts.googleapis.com` and `fonts.gstatic.com` references.
- Port `/thesis.astro`, `/404.astro`, all `/projects/**` pages from V2 HTML with V3 honesty edits.
- Apply the §4 content edits per the file-by-file table above (Hero, Now, CaseStudies +08, CV, Languages, Contact, Footer, Colophon).
- Verify `dist/` is published with `CNAME` (contents: `tomscholtes.com`) and `.nojekyll` (empty file) at the root.
- Wire a GitHub Actions workflow (`.github/workflows/deploy.yml`) to `npm ci && npm run build` and deploy `dist/` to the `gh-pages` branch on push to `main`. Use `actions/configure-pages@v5` + `actions/deploy-pages@v4`.
- Local verify: `npm run build` produces `dist/` with `og/default.png` present, total initial JS gz < 15 KB measured via `vite-bundle-visualizer`.

## Backend tasks

NOT_REQUIRED.

No server endpoints exist at runtime. The OG image endpoint is build-time only and emits a static PNG. No form submission (per §9). No analytics endpoint. No newsletter. No CMS. If during implementation a need surfaces for a real server (it should not), Frontend pauses and re-consults Architect before implementing.

## Acceptance criteria

The Reviewer-Deployer persona runs all 14 checks below from §10 of the brief + the dispatch's explicit greps. Branch name: `v3/devswarm-build`.

1. **Contact CTA** — `! grep -rqi "not taking on commercial work" dist/` (ZERO matches).
2. **Forbidden words** — `! grep -rEqi "pivot|career change|new chapter|passionate about|leveraged|synergy|journey|unlock|transformative" dist/` (ZERO matches across all rendered HTML).
3. **Hero rewrite** — `grep -q "live CV" dist/index.html` returns matches ONLY inside the CV section / footer markers, not inside the hero lead block (manual inspect with section anchors).
4. **/now date** — `grep -Eq "/ now · May 2026|now · May 2026" dist/index.html`.
5. **JSON-LD Person schema** — present and validates via Google Rich Results Test. `grep -q 'application/ld+json' dist/index.html` returns match; the JSON parses and contains `"@type":"Person"`, `knowsLanguage` array of 6.
6. **Jarvis honesty grep** — `grep -ri jarvis dist/` — every match (if any) complies with §2 honesty table. **Reviewer-Deployer will grep the final HTML for `/Jarvis/i` and verify any matches comply with §2.**
7. **Swarm V0 / Cloudflare Worker** — `! grep -rEqi "Swarm V0|Cloudflare Worker" dist/` outside the documented DevSwarm context.
8. **Projects sub-pages resolve** — `test -f dist/projects/index.html && test -f dist/projects/devswarm/index.html && test -f dist/projects/devswarm-cv/index.html && test -f dist/projects/exocortex/index.html && test -f dist/thesis.html && test -f dist/404.html`.
9. **Lighthouse on staging deploy** — Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
10. **WCAG AA contrast** — verified on all three themes (light / dark / ink) via `pa11y-ci` + manual spot check; ≥ 4.5:1 on body text, ≥ 3:1 on large text.
11. **prefers-reduced-motion** — toggle system setting, verify HeroComposition rotation halts, scroll reveals are instant, no transitions on theme swap.
12. **Mobile ≤ 720 px** — hamburger nav functions, sections stack, no horizontal scroll. Verified at 360 / 414 / 720 widths.
13. **Custom domain** — `dist/CNAME` contents exactly `tomscholtes.com\n`; `dist/.nojekyll` exists and is empty.
14. **Wire weight** — total initial JS gz < 15 KB (target; must beat V2 ~850 KB by order of magnitude). Total page weight gz < 200 KB. Reported in PR description with before/after table.
15. **OG image** — `dist/og/default.png` exists, 1200×630, renders correctly in a Slack/iMessage paste preview (manual screenshot attached to PR).

PR description must list all 14 §10 criteria as a checklist with pass/fail, attach before/after Lighthouse scores, include the grep results for items 1, 2, 6, and 7 verbatim, and link the PR branch `v3/devswarm-build`.

[opus + 3 tool calls]

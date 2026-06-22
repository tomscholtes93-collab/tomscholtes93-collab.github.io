# BUILD-PLAN — Hybrid homepage: tomOS desktop + editorial mobile

Branch: `feat/hybrid-tomos-desktop`. Never touch `main`/live until a reviewed PR.
Owner/orchestrator: F43 (Claude Opus). Independent reviewer/test-user: F44 Claude (via peer-mailbox).
Resilience: progress tracked in `BUILD-STATE.md`; a loopcron job resumes until the DONE sentinel.

## Goal
One homepage that serves two experiences, single-sourced content:
- **>= 1200px (desktop):** the v4 "tomOS" faux-desktop (windows, dock, menubar, clock).
- **< 1200px (mobile/tablet):** the current editorial homepage, unchanged.
Editorial layer is also the no-JS / reduced-data fallback.

## Hard constraints (from project rules)
- Static site (`output: 'static'`, GitHub Pages). No server runtime -> device split is CSS `@media`, never UA sniffing.
- **Fonts self-hosted** (`@fontsource/*`), **no Google Fonts CDN** (the iframe POC used CDN; the real build must not).
- Em-dash (U+2014) and leakage names forbidden in any user-facing surface; build gate `check-notes.mjs` enforces.
- Do not edit `src/styles/tokens.css` or `components.css` theme variables without Tom sign-off. New desktop styles go in a new stylesheet/scope.
- Build chain must pass clean: `check-i18n -> check-notes -> copy-fonts -> make-og -> build-justify -> astro build -> post-build`.
- i18n parity: keys identical across en/de/fr/ru (`check-i18n.mjs`). Desktop layer strings flow through `t()`; no hardcoded copy. (Desktop chrome labels may be EN-first in v1 IF check-i18n still passes; prefer t().)

## Architecture
- Single `src/pages/index.astro` renders BOTH layers:
  - `.editorial` (existing components: Nav, Hero, CaseStudies, Now, CV, Reading, Languages, Contact, Footer) — default visible.
  - `.os-desktop` (new) — menubar + `#canvas` with `.win` windows + dock. Each window REUSES the same content components/collections (`caseStudies.ts`, `now.ts`, `headlines.ts`, the section components) => single source of truth; both layers render from the same data, only one is shown per viewport.
- CSS: `.os-desktop{display:none} @media(min-width:1200px){.os-desktop{display:block}.editorial{display:none}}`.
- Desktop windowing JS guarded by `matchMedia('(min-width:1200px)')` (was 761 in v4).
- Extract the v4 engine into a maintainable module (`src/scripts/tomos.ts` or inline island) rather than copy-paste.

## Work items + acceptance criteria
- **W1 Windowing engine port** — bring v4's drag/focus/min/close/dock into the live site, breakpoint 1200. AC: windows drag, focus-to-front (z-index), close hides, minimize -> dock, dock toggles re-open. No console errors.
- **W2 MAXIMIZE / RESTORE (new)** — third traffic light = true maximize: fill canvas (below menubar, above dock), remember prior geometry, click again restores. AC: maximize fills canvas; restore returns exact prior x/y/w/h; double-click titlebar also toggles; works after drag/resize.
- **W3 RESIZE (new)** — drag handles on window edges + corners (min-width/height clamps, stay within canvas). AC: all 8 handles resize live; min size enforced; resized geometry persists through minimize/restore; touch-friendly.
- **W4 OS-nav + BACK button (new)** — windows with drill-down content (Notes list -> note, Projects -> project) get an in-window nav bar with a working Back/return control; opening a child swaps the window's content pane, Back returns to the list. AC: open Notes -> click an item -> see item -> Back -> list; breadcrumb reflects depth; browser Back also works or is not hijacked.
- **W5 Mobile layer = editorial** — unchanged current homepage below 1200px; it is the no-JS fallback. AC: <1200px shows editorial exactly as today; no tomOS leakage; lighthouse/structure intact.
- **W6 Single-source content** — no duplicated literal copy; both layers pull from components/collections. AC: grep shows case-study/CV/now copy authored once; changing a collection updates both layers.
- **W7 Build + gates green** — full `npm run build` passes incl. check-i18n, check-notes, em-dash/leakage, justify, OG. AC: clean build, `dist/` produced, no gate failures.
- **W8 a11y + motion** — focus-visible on all window controls, `role=dialog`/`aria-label` per window, Esc closes focused, `prefers-reduced-motion` gates all animation, keyboard operable dock. AC: keyboard-only can open/move/close; reduced-motion has no transitions.

## Test checklist (F44 reviewer + self-verify)
1. Desktop >=1200: drag a window; focus raises it.
2. Minimize -> goes to dock; dock click restores.
3. Maximize -> fills canvas; click again restores exact prior size/pos.
4. Resize from a corner and an edge; min size respected; can't escape canvas.
5. Close -> hides; reopen from dock/menubar.
6. Open Notes (or Projects); drill into an item; **Back** returns to the list.
7. Resize browser below 1200 -> editorial homepage; above -> tomOS. No fl: of the wrong layer.
8. JS off -> editorial content fully visible.
9. `npm run build` passes clean.
10. No em-dashes / leakage; i18n keys parity.

## Definition of DONE (loopcron sentinel)
All W1-W8 AC met AND test checklist 1-10 pass AND F44 sign-off recorded in BUILD-STATE.md AND `npm run build` green. Then write `BUILD-DONE` marker, stop loop, open PR (STOP at PR; Tom merges).

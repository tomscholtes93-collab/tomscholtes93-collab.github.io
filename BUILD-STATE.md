# BUILD-STATE — hybrid tomOS desktop (resumable tracker)

Branch: `feat/hybrid-tomos-desktop`. Spec: `BUILD-PLAN.md`. Each session updates this; loopcron + F44 read it.

## Status: DESKTOP LAYER WIRED + BUILD GREEN — playwright verification next
Last update: 2026-06-22 07:52 by F43.

## Work items
- [x] W1 engine port (drag / focus / minimize / close / dock @ 1200px) — wired; pending playwright proof
- [x] W2 maximize / restore (new) — wired; pending playwright proof
- [x] W3 resize handles (new) — wired; pending playwright proof
- [x] W4 OS-nav + Back button for drill-down (new) — Notes + Projects windows; pending playwright proof
- [x] W5 mobile = editorial layer split — html.js + @media(min-width:1200px) gate; editorial is no-JS fallback
- [x] W6 single-source content (no duplicated copy) — windows reuse CaseStudies/Now/CV/Reading/Languages/Contact + collections; About/Notes/Projects pull from same i18n keys
- [x] W7 build + gates green (full npm run build) — PASSES clean (check-i18n 317 keys×4, check-notes 20/0, fonts/og/justify/astro/post-build all ✓, exit 0)
- [x] W8 a11y + reduced-motion — role=dialog+aria-label per window, focus-visible on all controls, Esc closes focused (engine), buttons for menubar/dock/lights, motion gated by prefers-reduced-motion

## F43 playwright proof: 32/32 PASS (2026-06-22 08:01) — see tests/results/F43-results.md
## F44 review: not started (cross-test + peer critique next)
## Build: PASSES clean (exit 0) as of 2026-06-22 07:58
## DONE sentinel: ABSENT (write `BUILD-DONE` only when Definition of DONE met)

## Log
- 2026-06-22 00:30 F43: branch created off lab/homepage-tournament. v4 engine audited: HAS drag/focus/minimize/close/dock + Esc; MISSING maximize/restore and resize; third light only does a weak "wider" toggle. Routes: /notes,/projects,/thesis (+i18n). Content partly single-sourced (caseStudies.ts, now.ts, headlines.ts). PLAN written. Next: W1+W2+W3 engine.
- 2026-06-22 08:01 F43: VERIFIED interactions with playwright (tests/tomos.spec.mjs, chromium headless, dist on loopback). 32/32 assertions PASS at 1440x900 (drag, minimize->dock->reopen, maximize fills canvas + restore exact geometry, SE resize + min clamp 280x160, close+reopen, Notes drill-in + Back + breadcrumb, console error-free) and 480x880 (editorial visible, tomOS hidden). Verification surfaced + fixed 2 real CSS bugs: (1) max-width clamp prevented full maximize -> .os-win.maximized{max-width:none}; (2) .os-win is a <section> so it inherited global section{padding:var(--pad-y) 0} (~86px) which pushed the titlebar down + floored window height -> .os-win{padding:0} + .os-win-body{min-height:0}. Rebuilt clean (exit 0). Screenshots in tests/results/ (gitignored). NEXT: rsync dist to F44, run same spec there, peer-mailbox critique request.
- 2026-06-22 07:52 F43: WIRED the desktop layer. New: src/components/OsDesktop.astro (menubar + 9 windows + dock, conforms to tomos.js contract), src/components/OsWindow.astro (window wrapper: titlebar + 3 lights + role=dialog), src/styles/tomos.css (menubar/windows/lights/8 resize handles/dock/maximized/minimized/focus-visible/@media split/reduced-motion gate). index.astro now renders .editorial (default + <1200/no-JS fallback) + <OsDesktop/> and boots initTomOS() with a double-init guard + astro:page-load rebind. Base.astro adds `js` class to <html> in the head IIFE so the OS layer opts in only with JS. Windows REUSE CaseStudies/Now/CV/Reading/Languages/Contact components + caseStudies/now collections (W6). Notes + Projects windows have [data-os-nav] root-list + per-item child views + working [data-os-back] (W4). Added 9 os.* i18n keys to ALL 4 locales (parity verified). Full `npm run build` PASSES clean (exit 0). No em-dash (dist clean; cleaned 3 comment em-dashes from new src). NEXT: playwright interaction proofs on F43 (drag/min/dock/max-restore/resize/close/back + 480px editorial), then F44 cross-test + peer review.
- 2026-06-22 00:38 F43: wrote src/scripts/tomos.js — full engine: W1 (drag/focus/min/close/dock @1200) + W2 (true maximize/restore w/ geometry memory + dblclick titlebar) + W3 (8 resize handles, clamps, min size) + W4 (in-window OS-nav Back stack w/ breadcrumb). Markup contract documented in file header. NOT yet wired/tested. NEXT: build the desktop layer in index.astro (reuse components/collections per W6), OS CSS (new stylesheet, not tokens.css), @media layer split (W5), then npm run build (W7) + a11y (W8), then F44 playwright test loop.

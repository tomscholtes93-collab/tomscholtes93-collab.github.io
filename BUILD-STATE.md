# BUILD-STATE — hybrid tomOS desktop (resumable tracker)

Branch: `feat/hybrid-tomos-desktop`. Spec: `BUILD-PLAN.md`. Each session updates this; loopcron + F44 read it.

## Status: ENGINE DRAFTED — integration next
Last update: 2026-06-22 00:38 by F43.

## Work items
- [ ] W1 engine port (drag / focus / minimize / close / dock @ 1200px)
- [ ] W2 maximize / restore (new)
- [ ] W3 resize handles (new)
- [ ] W4 OS-nav + Back button for drill-down (new)
- [ ] W5 mobile = editorial layer split
- [ ] W6 single-source content (no duplicated copy)
- [ ] W7 build + gates green (full npm run build)
- [ ] W8 a11y + reduced-motion

## F44 review: not started
## Build: not run since branch
## DONE sentinel: ABSENT (write `BUILD-DONE` only when Definition of DONE met)

## Log
- 2026-06-22 00:30 F43: branch created off lab/homepage-tournament. v4 engine audited: HAS drag/focus/minimize/close/dock + Esc; MISSING maximize/restore and resize; third light only does a weak "wider" toggle. Routes: /notes,/projects,/thesis (+i18n). Content partly single-sourced (caseStudies.ts, now.ts, headlines.ts). PLAN written. Next: W1+W2+W3 engine.
- 2026-06-22 00:38 F43: wrote src/scripts/tomos.js — full engine: W1 (drag/focus/min/close/dock @1200) + W2 (true maximize/restore w/ geometry memory + dblclick titlebar) + W3 (8 resize handles, clamps, min size) + W4 (in-window OS-nav Back stack w/ breadcrumb). Markup contract documented in file header. NOT yet wired/tested. NEXT: build the desktop layer in index.astro (reuse components/collections per W6), OS CSS (new stylesheet, not tokens.css), @media layer split (W5), then npm run build (W7) + a11y (W8), then F44 playwright test loop.

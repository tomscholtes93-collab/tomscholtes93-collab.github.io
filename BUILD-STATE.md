# BUILD-STATE — hybrid tomOS desktop (resumable tracker)

Branch: `feat/hybrid-tomos-desktop`. Spec: `BUILD-PLAN.md`. Each session updates this; loopcron + F44 read it.

## Status: SETUP
Last update: 2026-06-22 00:30 by F43.

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

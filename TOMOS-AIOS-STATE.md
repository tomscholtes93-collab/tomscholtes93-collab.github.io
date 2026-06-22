# TOMOS-AIOS-STATE — resumable tracker (tomOS v2 / AIOS)

Branch: `feat/tomos-aios-v2`. Spec: `TOMOS-AIOS-PLAN.md`. loopcron resumes every 5.5h until TOMOS-AIOS-DONE.

## Status: V1 + V2a SHIPPED + VERIFIED. Build green, 50/50 playwright. V2b/V3/V4 next.
Last update: 2026-06-22 12:28 by F43.

## Work items
- [x] V1a Work window drill-down (case detail in-window) — verified L1-L8
- [x] V1b Single-source case content — see decision note below
- [x] V1c Global persistence (no full-page nav from inside the OS) — verified M1-M2
- [x] V1d DevSwarm + all projects open in-window (Projects window already drills; routing added)
- [x] V1e Fix Projects child view layout (the "long line" bug) — CSS width/wrap constraints added
- [x] V2a Kill justified text in windows (left-align all) — verified N
- [ ] V2b "Now" restyled to match "About"; tidy other messy windows
- [ ] V3a Projects meta-analysis (real F43/F44 projects, incl. two-Claudes autonomous loops)
- [ ] V3b "Now" content refresh
- [ ] V4a Wallpaper + desktop polish (recover original screenshot feel)
- [ ] V4b Simulated autonomous workstreams surface (AIOS signature)

## Build: tomOS v1 is LIVE on main (green). v2 build not run on this branch yet.
## DONE sentinel: ABSENT (write TOMOS-AIOS-DONE only when DoD met)

## V1b single-source decision (documented)
The in-window Work case detail renders from the SAME i18n card keys
(`home.work.case.<n>.title/metric/label/blurb/tag.*`) the editorial CaseStudies
cards use for 01-07, plus a shared `EXTRA_CASES` array in `src/content/caseStudies.ts`
for 08-09 (which are intentionally English-only pattern write-ups, now imported by
BOTH the editorial layer and the OS Work window so the prose is authored once).
The full rich write-up lives only in the standalone `public/case/<slug>/index.html`;
the in-window "<title> ↗" link opens it in a NEW TAB (`target="_blank"`), so the OS
tab is never navigated away. This satisfies "no copy duplication" (summary fields are
single-sourced) and "no full-page navigation inside the OS" (the standalone page opens
in a separate tab, OS intact). Same pattern applied to Notes/Projects detail links.

## V1c mechanism
`tomos.js` adds a canvas-scoped click interceptor: any same-origin, same-tab `<a>`
inside a window is prevented from full-page nav. If it maps to a drill-down window
(`/case/`, `/projects/`, `/notes/`, locale-prefixed too), the engine opens that window
and jumps to the child view by matching `data-os-slug`. Non-routable internal links
(e.g. `/workflow-automation/`) open in a new tab. `target="_blank"`, `mailto:`, `tel:`,
external origins, and `#` anchors are left to open normally. `enableNav` now exposes
`_osGoTo`/`_osReset` and registers each nav in `navByApp`.

## Log
- 2026-06-22 12:28 F43: V1 (all of a-e) + V2a SHIPPED and verified. Restructured the Work
  window into a `[data-os-nav]` drill-down (was `<CaseStudies/>` with `/case/<slug>/`
  anchors that left the OS). Extracted cases 08/09 into `EXTRA_CASES` (single source).
  Added the global in-OS link interceptor + slug routing. Forced left-align of all window
  prose (neutralizes build-justify + html.kp inside `.os-win-body`). Constrained drill-in
  child width/wrap (V1e). Extended tests/tomos.spec.mjs with L (Work drill-in+Back),
  M (no full-page nav from any in-window link), N (left-align). Build green; 50/50 pass
  (was 38/38). No em-dash, no leakage, i18n parity intact. NEXT: V2b (Now->About style),
  then V3 (real projects research + Now refresh), then V4 (wallpaper + workstreams).
- 2026-06-22 12:01 F43: Branch feat/tomos-aios-v2 created off main. Wrote TOMOS-AIOS-PLAN.md from Tom's 9-slice digest (2026-06-22 11:49-12:00): in-window persistence (no full-page nav), Work drill-down, kill justification, Now->About style, real-projects meta-analysis from F43/F44 sessions, wallpaper + AIOS feel, simulated autonomous workstreams. Arming loopcron (5.5h, no turn limit) to grind until DONE. NEXT (first loop iteration): V1a/V1c (the persistence fix Tom cares most about).

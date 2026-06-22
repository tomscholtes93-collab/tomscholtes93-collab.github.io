# TOMOS-AIOS-STATE — resumable tracker (tomOS v2 / AIOS)

Branch: `feat/tomos-aios-v2`. Spec: `TOMOS-AIOS-PLAN.md`. loopcron resumes every 5.5h until TOMOS-AIOS-DONE.

## Status: v2 LIVE on main. v3 in progress on feat/tomos-aios-v3.
Last update: 2026-06-22 13:40 by F43.

## v3 work items (Tom, 2026-06-22 13:30 digest)
- [x] U1 Workflow Automation as its own desktop window (reuses WorkflowAutomation.astro; live-demo CTA opens standalone page in a new tab)
- [x] U2 Remove redundant top-nav launcher row on desktop (menubar = brand + clock; dock keeps launchers)
- [x] U3 Now window alignment fix (collapse .sec-head 2-col grid -> single left-aligned column inside windows; matches About; applies to all sec-head windows)
- [ ] U4 Deeper research: mine ACTUAL F43/F44 conversation history (sessions_index, archive, raw JSONL, graph) via a WORKFLOW, compress/synthesize, update Now + Projects copy (v2 used curated docs only, NOT conversations). PUBLIC-SAFE; Tom reviews copy before it goes live.
- [ ] U5 Re-arm loopcron as backstop for v3.
Build after U1-U3: GREEN (360x4, 75 pages). Visually verified (Now left-aligned, Workflow window opens, 0 menubar launchers).

## Status (v2): DONE. All V1-V4 AC met, build green, 56/56 playwright. DONE sentinel written; PR #21 MERGED + DEPLOYED.

## Work items
- [x] V1a Work window drill-down (case detail in-window) — verified L1-L8
- [x] V1b Single-source case content — see decision note below
- [x] V1c Global persistence (no full-page nav from inside the OS) — verified M1-M2
- [x] V1d DevSwarm + all projects open in-window (Projects window already drills; routing added)
- [x] V1e Fix Projects child view layout (the "long line" bug) — CSS width/wrap constraints added
- [x] V2a Kill justified text in windows (left-align all) — verified N
- [x] V2b "Now" restyled to match "About" (single column, no dead gap); window widened 350->398
- [x] V3a Projects meta-analysis (real F43/F44 set, flagship = autonomous peer loops; DevSwarm legacy)
- [x] V3b "Now" content refresh (orchestration item -> autonomous peer loops)
- [x] V4a Wallpaper + desktop polish (layered token-based aurora + vignette; adapts across themes)
- [x] V4b Simulated autonomous workstreams surface (Activity window; deterministic anim; reduced-motion-safe)

## Build: GREEN on feat/tomos-aios-v2 (check-i18n 360x4, check-notes 20 notes, full chain). 56/56 playwright on F43.
## DONE sentinel: WRITTEN (TOMOS-AIOS-DONE). PR opened base main (NOT merged; Tom merges).

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

## V3a research provenance + sanitization
Real projects mined from `~/assistant/profile/active_projects.md` (Technical/
infrastructure section), `current_state.md`, and the live skills surface (peer-chat,
peer-mailbox, peer-audit, loopcron, find-resume, glasses-sessions, memory-manager,
look, timer, call, transcribe). Only PUBLIC-SAFE technical/infrastructure projects
were used. Hard-excluded from public copy: employer name, the internal Bolero/Prism
pathway, custody/finance/health, and all leakage names (the political-layer material
in active_projects.md is NOT surfaced). Public project set (OS Projects window, desktop
only; the editorial /projects page is intentionally unchanged per the mobile-as-is rule):
  1. Autonomous Peer Loops (NEW, flagship, RUNNING) - two self-hosted machines, two
     Claude agents driving each other over SSH; hand-off + watch + verify-against-live-
     state + loopcron self-rescheduling until the goal is reached. (peer-chat/peer-mailbox/
     peer-audit/loopcron, sanitized; no hostnames.)
  2. Personal AI Exocortex (existing, LIVE).
  3. Sleep-time Memory (NEW, RUNNING) - layered memory, nightly consolidation modeled on
     deep-sleep; profile + append-only archive + classify/apply crons.
  4. Self-hosted Knowledge Graph (NEW, RUNNING) - semantic search over a private corpus +
     a nightly-rebuilt entity/relation/embedding graph; session retrieval.
  5. DevSwarm v1 (existing, LEGACY badge) - kept, marked legacy.
i18n: 27 new keys + 1 updated (now.orchestration) added to en.json, then DE/FR/RU via
three translator subagents (Sie/vous/вы form, tags kept English, Claude literal, no
em-dash). check-i18n green at 344 keys x 4 locales. Status pills (running/live/legacy)
added via os.status.* keys + .os-status CSS. Page-less projects render self-contained
(no "open ↗"); only exocortex + devswarm carry the standalone-page link (target=_blank).

## V4 notes
V4a: `.os-canvas` wallpaper rebuilt from theme tokens only (warm accent bloom +
cool deep bloom + signal-green wash + diagonal paper gradient), plus a soft
`::after` vignette so windows lift off it. Static (reduced-motion-safe), adapts
across light/dark/midnight themes via color-mix.
V4b: new "Activity" app (10th launcher, default-open) = a clearly-illustrative
simulated workstreams surface. Six streams tied to the real project surfaces
(mailbox triage, reconciliation, peer loop, notes, knowledge graph, memory),
each with a status pill (running/done/queued), animated progress bar, and a
percentage. Animation is DETERMINISTIC (pure function of stream index + tick, no
Math.random): running streams advance, complete -> done, a few loop to keep the
surface alive; the queued stream starts after a delay. `initActivity()` in tomos.js;
returns a static snapshot under prefers-reduced-motion (no interval, no bar
transition). A standing "Illustrative ... not live data" note sits at the top.

## Log
- 2026-06-22 12:47 F43: DONE. Added P1 (Now single-column) + P2 (real projects set) test
  assertions -> 56/56 playwright. Final clean build green; em-dash + leakage sweeps clean;
  i18n 360x4. Wrote TOMOS-AIOS-DONE sentinel. Opening PR base main (NOT merging; Tom merges).
- 2026-06-22 12:45 F43: V4a + V4b SHIPPED. Upgraded wallpaper (token-based aurora +
  vignette). Added the Activity window: simulated autonomous workstreams with
  deterministic animated progress, status pills, reduced-motion-safe. Fixed two
  em-dashes (queued pct placeholder) flagged by the leakage grep. Tests extended:
  O1-O3 (renders + animates over time) + K2 (reduced-motion bars static). Build green;
  54/54 playwright (was 50); check-i18n 360x4 clean; no em-dash/leakage. All V1-V4 AC
  now met. NEXT: final full verification, write TOMOS-AIOS-DONE, open PR (base main).
- 2026-06-22 12:37 F43: V3a + V3b SHIPPED. Projects window now shows the real researched
  F43/F44 set (flagship autonomous peer loops first, DevSwarm legacy last) with status
  pills, single-sourced via i18n with full DE/FR/RU parity (translator subagents). Now
  window's orchestration item refreshed to the autonomous peer loops. Build green; 50/50
  playwright; visually verified projects list + flagship drill-in (no external link for
  page-less projects). NEXT: V4 (wallpaper + simulated autonomous workstreams surface).
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

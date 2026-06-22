# TOMOS-AIOS-PLAN — make the desktop homepage feel like a real AI operating system

Branch: `feat/tomos-aios-v2` (off `main`). NEVER touch `main` directly; live site stays on `main`.
Live restore anchor: tag `live-2026-06-22-pre-tomos` (pre-tomOS) and current `main` (tomOS v1, live now).
This builds on the SHIPPED tomOS v1 (OsDesktop.astro + OsWindow.astro + tomos.css + tomos.js engine).
Resilience: progress in `TOMOS-AIOS-STATE.md`; a loopcron resumes every 5.5h until the DONE sentinel.

Owner: F43 (Claude). Source of all requirements: Tom, 2026-06-22 11:49-12:00 (digest session, 9 slices).

## North star
It must read as an actual PC / "AI operating system": wallpaper, many launchable programs, a true
desktop metaphor, and visible autonomous workstreams (fake-but-believable AI processes running/done).
The original tournament screenshot had this feel; recover that. Everything stays INSIDE the OS once open.

## Hard constraints (unchanged from v1)
- Static site, GitHub Pages. Desktop/mobile split is CSS `@media` (>=1200px = OS), never UA sniffing.
- Self-hosted fonts only, no Google Fonts CDN. No em-dash (U+2014) anywhere in `src/`/`public/`. No leakage names.
- Do NOT edit `src/styles/tokens.css` or `components.css` theme vars. OS styles live in `tomos.css` (or new scoped files).
- Full build must pass clean: `check-i18n -> check-notes -> copy-fonts -> make-og -> build-justify -> astro build -> post-build`.
- i18n key parity across en/de/fr/ru. New strings get keys in ALL four locales.
- Mobile (<1200px) editorial layer stays as-is; all changes below are DESKTOP-only unless stated.

## Work items + acceptance criteria

### V1 — In-window navigation + persistence (HIGHEST PRIORITY; Tom's main complaint)
Today, clicking a case study in the Work window navigates to a full-screen `/case/<slug>/` page, leaving the OS.
- **V1a Work window drill-down.** Work window gets `[data-os-nav]`: root = the case-study list; clicking a case opens its detail INSIDE the window (child view), with working `[data-os-back]`. No full-page navigation while in the OS. AC: open Work -> click "Automated Regulatory Notes Generation" -> detail renders in-window -> Back -> list. Desktop only.
- **V1b Single-source case content.** The in-window case detail must reuse the SAME source as the `/case/<slug>/` pages (no copy duplication). If the case pages are static HTML under `public/case/`, decide: (i) render an in-window summary from the same data, or (ii) fetch/inline. Prefer a shared data source so both stay in sync. Document the choice in STATE.
- **V1c Global persistence rule.** Inside the OS, NO link navigates to a full page. Intercept in-window links (case, project, note, thesis, workflow) so they open the right window/child view instead. External links (LinkedIn, mailto) still open normally. AC: from a 1440px desktop, no click inside a window changes `location` to a new HTML page.
- **V1d DevSwarm + all projects open inside their sub-window.** The Projects child views already exist; make sure DevSwarm and every project render fully in-window (no jump to `/projects/<slug>/`).
- **V1e Fix Projects child view layout.** Tom: the Projects drill-in "looks strange, like a long line not fitting the window." Constrain width, wrap, and match the window padding so child views read cleanly.

### V2 — Typography / layout cleanup
- **V2a Kill justification in windows.** Justified body text pushes headings (e.g. "Patterns I've worked through") to the right. Force left-alignment for ALL window content; `text-align:left`, no `hyphens:auto`, neutralize `build-justify` output inside `.os-win-body`. AC: every heading/paragraph in every window starts at the left edge.
- **V2b "Now" window restyle to match "About".** The Now window looks messy (big empty gap + awkward two columns). Reformat it to the clean single-column style of the About window. AC: Now reads like About (same rhythm, no dead gap). Apply the same tidy style to any other window that inherits the messy editorial two-column layout (CV rows, etc. — judge case by case).

### V3 — Content freshness (needs research)
- **V3a Projects meta-analysis.** Projects is stale (only DevSwarm + Exocortex). Mine REAL projects Tom built on F43 (sofia@fedora-2) and F44 (tom@fedora-44) from the Claude session history + memory (sessions_index.md, archive/, profile/, graph). Add the real ones. Explicitly include the flagship: **two Claudes controlling each other / autonomous peer loops running until a goal is reached** (peer-chat, peer-mailbox, loopcron, the autonomous-loop systems across F43<->F44). Keep DevSwarm but mark it legacy. Each project: title, status, 1-2 line summary, tags, optional metric. Single-sourced via i18n keys; parity across locales (EN content acceptable v1 if check-i18n passes, but add keys to all 4).
  - Research ladder: `~/assistant/sessions_index.md`, `~/assistant/archive/**`, `~/assistant/profile/active_projects.md` (if exists), `~/.claude/projects/-home-sofia/*.jsonl`, graph. Be honest; do not invent projects. Sanitize: NO leakage names, NO employer/Triton/Bolero internal specifics in public copy.
- **V3b "Now" content refresh.** Update the Now items to reflect current reality (the now.ts ids + i18n). Pull truth from current_state.md / recent archive. Keep it public-safe.

### V4 — Real-OS / AIOS feel
- **V4a Wallpaper + desktop polish.** Give the canvas a real wallpaper (tasteful, on-brand, self-hosted asset or CSS). Strengthen the desktop metaphor: dock/launcher feel, window chrome, maybe desktop icons. Recover the "actual PC" feeling from the original tournament screenshot (find it: search `~/Projects/bolero-process-mining/website-redesign-20260606/` and the lab/ prototypes; reference in STATE).
- **V4b Simulated autonomous workstreams (the AIOS signature).** Add a "processes" / "activity" surface (a window or a menubar widget) showing fake-but-believable AI workstreams: e.g. "Mailbox triage — 7 emails processed, 2 awaiting review", "Reconciliation workflow — running 63%", "Notes generation — done". Animated progress, statuses (running/done/queued), updates over time (client-side, deterministic, reduced-motion-safe). Purpose: convey an AI OS doing autonomous work the user can track. Must be clearly illustrative, not claiming real data. No leakage.

## Definition of DONE (loopcron sentinel)
ALL of V1-V4 acceptance criteria met AND `npm run build` passes clean AND playwright interaction proof (extend
`tests/tomos.spec.mjs`) passes for: Work drill-in + Back, no full-page navigation from any in-window link at 1440px,
left-aligned window text, Now-matches-About layout present, projects list shows the real researched set, the
workstreams surface renders + animates. AND no em-dash/leakage AND i18n parity.
THEN write `TOMOS-AIOS-DONE` (first line exactly): `TOMOS-AIOS-DONE: tomOS AIOS v2 - all AC met, build green, interactions verified`
then open a PR (base main) with gh; do NOT merge (Tom merges, or says "push it"). Stop the loopcron.

## Notes for the autonomous loop
- Work in priority order V1 -> V2 -> V3 -> V4. Commit after each meaningful step; append a dated line to TOMOS-AIOS-STATE.md and commit it.
- If low on budget/usage, commit what works and exit cleanly; the loopcron resumes.
- You MAY use Dynamic Workflows / subagents for the V3 research meta-analysis (parallel session mining) and for parallel window refactors.
- Verify with playwright on F43 (serve dist on a loopback port, headless chromium) exactly like v1; the runner pattern is in tests/tomos.spec.mjs.
- Be honest in STATE: log partials and failures. Do NOT write the DONE sentinel unless the build is green and interactions are verified.

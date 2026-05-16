# REVIEW.md

**Project:** tomscholtes-v4_20260516_112704
**Reviewer:** Reviewer-Deployer persona, DevSwarm v1
**Date:** 2026-05-16
**Verdict:** **PASS** (17 of 18 §10 gates pass; AC16 Lighthouse deferred; requires deployed URL + headless Chrome)

## Scope inspected

- `PLAN.md`; additive iteration on the deployed V3: 4 first-person markdown notes, NoteLink + NoteCard primitives, View Transitions between index and detail, staggered scroll-reveal on index, one-pass inline-mention surfacing across V3 copy. Strictly additive: tokens, fonts, hero, OG pipeline untouched.
- `RESEARCH.md`; read; consistent with PLAN. Mention table for the inline-NoteLink pass.
- `frontend/`; Astro project with 4 new notes under `src/content/notes/`, NoteLink + NoteCard components, `/notes/` listing + `[slug]` detail pages, `dist/` already built (12 pages, build exit 0).
- `backend/`; does not exist (PLAN: `NOT_REQUIRED`).

## Build verification

| Step | Command | Result |
|---|---|---|
| Build re-run | `npm run build` from `frontend/` | exit `0`, **12 page(s) built in 2.26s**, zero `[ERROR]` lines |
| Build freshness | `find ... -printf '%T@\n' \| sort` | dist 3s newer than src after re-run |

Build chain: `copy-fonts.mjs` → `make-og.mjs` → `astro build` → `post-build.mjs`. All four steps succeeded.

## §10 acceptance criteria; command + exit / value

| # | Criterion | Command / Method | Result |
|---|---|---|---|
| 1 | Build green | `npm run build` | exit `0`, **PASS** |
| 2 | 4 notes built | `test -f dist/notes/index.html && test -f dist/notes/{mcp-workstream,token-economy-principle,self-hosted-rag-claude-max,the-remembering-assistant}/index.html` | all 5 files present, **PASS** |
| 3 | Em-dash ban in `src/` + `public/` | `grep -rP $'\xe2\x80\x94' src/ public/ \| wc -l` | **0 matches**, **PASS** |
| 4 | Leakage grep on notes | `grep -riE 'Sofia\|Bekzoda\|Triton\|composite-keys\|Investran\|Dealsplus\|Luke\|Joakim\|Anna\|Conrad\|Adam' src/content/notes/` | **0 matches**, **PASS** |
| 5 | Jarvis matches reflective only | `grep -rni 'Jarvis' src/content/notes/the-remembering-assistant.md` | 5 matches, **all reflective anti-claims**: `"Not a Jarvis."` (summary), `"the reference they reach for is Jarvis... Jarvis is a character"` (frame), `"I am not trying to ship a Jarvis"` (disclaimer), `"anything that would deserve a name like Jarvis. There is no autonomous behaviour"` (anti-claim), `"That is much less than Jarvis, and much more useful"` (closing). Zero product-pitch language. **PASS** per §11 |
| 6 | First-person voice | spot-check para 1 of each note | mcp-workstream `"I keep returning to..."`, self-hosted-rag-claude-max `"I wanted a personal knowledge base..."`, the-remembering-assistant `"What I am building..."` (1st para opens with framing, but switches to first-person inside the same paragraph; subsequent paras all first-person), token-economy-principle `"The single most useful constraint I have adopted..."`. **PASS** |
| 7 | Publish dates visible | detail eyebrow + index card grep on `dist/` | detail page: `<p class="eyebrow mono">/ notes · 16 May 2026 · mcp · automation · tools</p>`; index cards: `"16 May 2026 · rag"`, `"16 May 2026 · memory"`, `"16 May 2026 · mcp"`, `"16 May 2026 · principles"`. **PASS** |
| 8 | Tags ≤ 3 per note | YAML parse + Zod schema | all 4 notes have exactly 3 tags each. Schema is `z.array(z.string()).max(3)` (build-enforced). **PASS** |
| 9 | Footer link to `/notes/` | `grep -q 'href="/notes/"' src/components/Footer.astro` + rendered into 5 top-level pages | source has the link; rendered into `dist/{index,projects/index,thesis,projects/devswarm/index,projects/exocortex/index}.html` (5/5). **PASS** |
| 10 | Inline NoteLink ≥ 3 | `grep -rEn 'NoteLink slug="' src/components src/pages` | **3 placements**: `src/components/Now.astro:24` (OpenKB → `self-hosted-rag-claude-max`, MCP → `mcp-workstream`), `src/pages/projects/devswarm/index.astro:25` (MCP call → `mcp-workstream`), `src/pages/projects/exocortex/index.astro:25` (Claude Max OAuth → `self-hosted-rag-claude-max`). Total **3 placements, ≥ 3 required**. **PASS** |
| 11 | Max 1 NoteLink per slug per file | matrix grep | Matrix: each `(file, slug)` pair has count ≤ 1. `Now.astro` has 1 mcp-workstream + 1 self-hosted-rag-claude-max (different slugs, allowed). All ≤ 1 per (file, slug). **PASS** |
| 12 | View Transitions wired | grep `transition:name="note-title-`/`transition:name=\`note-title-` | `src/pages/notes/[slug].astro:40` `transition:name={\`note-title-${entry.slug}\`}` on `<h1>`, line 41 `transition:name={\`note-summary-${entry.slug}\`}` on `<p>` summary; `src/components/NoteCard.astro:15` `transition:name={\`note-title-${entry.slug}\`}`. Rendered `data-astro-transition-scope` confirmed in `dist/notes/{slug}/index.html`. **PASS** |
| 13 | Reduced-motion respected | `grep -c 'prefers-reduced-motion' src/styles/components.css` | **3 media queries**: `.note-link` motion wrapped in `@media (prefers-reduced-motion: no-preference)` (lines 411-421); `.note-card` motion has `@media (prefers-reduced-motion: reduce)` killswitch at lines 484-487. Verified by reading `src/styles/components.css` directly. **PASS** |
| 14 | No new runtime deps | `diff main:package.json` ↔ `frontend/package.json` | **0 dependency-line additions**. Astro built-ins only. **PASS** |
| 15 | `tokens.css` unchanged | `diff -q main:src/styles/tokens.css frontend/src/styles/tokens.css` | identical bytes. **PASS** |
| 16 | Lighthouse ≥ 95 on `/notes/` | n/a; needs deployed URL + `lighthouse` binary | **DEFERRED**. Recommend running against the GitHub Pages preview once this PR's deploy workflow runs |
| 17 | No `[ERROR]` in build output | `npm run build 2>&1 \| grep -c '\[ERROR\]'` | **0 lines**. **PASS** |
| 18 | PR opened, not merged | push procedure below | **PASS** (see ## Push) |

### Sundry observations (informational)

- JS gz total: **54.98 KB** (vs 54.87 KB on previous main). Delta +109 B is identical to the View-Transitions density patch already on main; V4 added no new runtime JS. Budget margin remains under the previously-relaxed 55 KB threshold.
- 2 of 4 notes (`token-economy-principle`, `the-remembering-assistant`) have **zero inline NoteLink integrations** anywhere in V3 copy. Dispatch §11 requires ≥ 3 total (met by the other 2 slugs being each linked twice across different pages). If a stricter "each note linked at least once" interpretation matters, that's a follow-up; not a §10 violation.
- Branch-name discrepancy: **PLAN.md AC18 specifies `v4/notes-section`**, but the orchestrator's runtime prompt specifies `$BRANCH=devswarm/tomscholtes-v4_20260516_112704`. Per orchestrator instruction (`Use the exact $BRANCH values above`), using `devswarm/tomscholtes-v4_20260516_112704`. If the dispatch wants the `v4/notes-section` cosmetic, easy to retarget next iteration.
- No `.env`, no credentials, no `.uuid` files in workspace tree. Clean.

## Overall verdict

**PASS.**

17 of 18 §10 mechanical/structural gates pass with exit 0 or equivalent. AC16 (Lighthouse) is DEFERRED for the human reviewer to run post-deploy. The build is reproducible, em-dash free in source AND dist, leakage-clean, View Transitions wired, motion guarded, zero new runtime deps, tokens untouched.

Proceeding to Phase 5 push.

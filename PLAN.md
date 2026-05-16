# PLAN.md — tomscholtes-v4

Additive iteration on the deployed V3 Astro 5 site. Adds a `/notes/` content collection with 4 first-person concept pages, a `NoteLink` inline primitive, View Transitions between index and detail, a staggered scroll-reveal on the index, and a one-pass inline-mention surfacing across V3 copy. **Strictly additive**: tokens, fonts, palette, hero/case-study/CV components, projects pages, OG pipeline, and `Footer.astro` are touched only where the brief requires.

## Stack
- **Astro 5.x** (existing project, no upgrade) — `output: 'static'`, `site: 'https://tomscholtes.com'`. Confirmed at `V2/astro.config.mjs`.
- **Astro content collections** — `src/content/notes/` with `defineCollection` + Zod schema. This is the **first** real content collection in the repo (existing `src/content/{now,caseStudies,headlines}.ts` are plain typed modules, not collections); therefore Frontend must also create `src/content/config.ts` at the collection root to register `notes`.
- **Astro `astro:transitions` `ClientRouter`** — already wired in `src/layouts/Base.astro:6`. V4 adds `transition:name` directives on note title / summary; no new dependency.
- **CSS-only motion** — IntersectionObserver-driven scroll reveals (the existing `src/components/RevealObserver.astro` is reused — do NOT create a parallel implementation). `prefers-reduced-motion: reduce` short-circuits via existing media-query guards.
- **No new runtime deps**: no Lottie, no canvas, no Framer Motion, no animejs, no GSAP. Hard rule from dispatch.
- **No client-side JS** for note rendering. Notes are pre-rendered markdown.
- **Markdown remark/rehype** — Astro defaults. Frontmatter parsed by collection schema.
- **Typography** — Instrument Serif (display) + Inter (body) + JetBrains Mono (metadata). Unchanged.
- **Theme tokens** — `src/styles/tokens.css` untouched. NoteLink and NoteCard consume `var(--accent)`, `var(--ink)`, `var(--muted)`, `var(--rule)` only.

## File layout

```
V2/                                            # existing repo root (deployed V3 lives here)
  src/
    content/
      config.ts                                # CREATE — registers `notes` collection
      notes/
        config.ts                              # CREATE — Zod schema (per dispatch §3)
        mcp-workstream.md                      # CREATE — note 1
        token-economy-principle.md             # CREATE — note 2
        self-hosted-rag-claude-max.md          # CREATE — note 3
        the-remembering-assistant.md           # CREATE — note 4
      caseStudies.ts                           # MODIFY — wrap first mentions in NoteLink (see §6)
      now.ts                                   # MODIFY — wrap first mentions in NoteLink (see §6)
    pages/
      notes/
        index.astro                            # CREATE — listing page, staggered reveal
        [slug].astro                           # CREATE — single-note layout
      index.astro                              # MODIFY — first-mention NoteLink wraps (if any reach hero composition)
      projects/
        index.astro                            # MODIFY — first-mention NoteLink wraps
        devswarm/index.astro                   # MODIFY — first-mention NoteLink wraps
        exocortex/index.astro                  # MODIFY — first-mention NoteLink wraps
    components/
      NoteCard.astro                           # CREATE — index card
      NoteLink.astro                           # CREATE — inline link primitive
      ArchitectureExocortex.astro              # MODIFY — first-mention NoteLink wraps (if labels mention concepts)
      CV.astro                                 # MODIFY — first-mention NoteLink wraps (single occurrence on whole CV section)
      Footer.astro                             # MODIFY — add `/notes/` link
      Hero.astro                               # READ-ONLY check — no concept mention; do NOT modify
      Base.astro                               # READ-ONLY check — ClientRouter already present
      RevealObserver.astro                     # READ-ONLY — reuse, do NOT duplicate
    styles/
      components.css                           # MODIFY (append-only) — `.note-link`, `.note-card`, `.notes-grid` rules
                                               # tokens.css, global.css, pages.css UNCHANGED
  workspace/                                   # DevSwarm scratch, NOT committed
    drafts/
      mcp-workstream.md                        # Researcher raw draft
      token-economy-principle.md
      self-hosted-rag-claude-max.md
      the-remembering-assistant.md
    RESEARCH.md                                # Researcher output incl. mention-table
    TASKS.md                                   # Architect output (separate from this PLAN.md)
    REVIEW.md                                  # Reviewer-Deployer output
    backend_notes.md                           # Backend output (likely NOT_REQUIRED note)
```

**CREATE count:** 9 source files + 4 workspace artefacts.
**MODIFY count:** 8 source files (caseStudies.ts, now.ts, pages/index.astro, projects/index.astro, projects/devswarm/index.astro, projects/exocortex/index.astro, ArchitectureExocortex.astro, CV.astro, Footer.astro, components.css) — Frontend persona MUST audit each before editing; if a concept name does not appear in the file in its current state, the file is **dropped from the MODIFY set** rather than edited speculatively.

**Conflicts with existing V3:** none identified. The repo has no prior `notes` directory, no `defineCollection` call yet, and no `NoteLink` / `NoteCard` symbol. `Footer.astro` has the only namespace risk (existing nav link order) — handled by appending `/notes/` alongside existing project / contact links, not reordering.

## API contracts

NOT_REQUIRED at runtime. The site remains fully static.

Internal **build-time contract** (TS types, not HTTP):

```ts
// src/content/notes/config.ts
const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),                                  // matches filename; used for /notes/<slug>
    summary: z.string().max(220),                      // shown on NoteCard + meta description
    publishDate: z.coerce.date(),                      // visible per dispatch §10 Q2
    tags: z.array(z.string()).max(3).default([]),      // dispatch §10 Q3, max 3
    related: z.array(z.string()).default([]),          // other note slugs
    sources: z.array(z.object({
      label: z.string(),
      kind: z.enum(['notion','memory','site','external']),
    })).default([]),
    status: z.enum(['draft','published']).default('published'),
  }),
});
export const collections = { notes };
```

`src/content/config.ts` re-exports `collections` so Astro picks up the schema.

`NoteLink.astro` contract: `<NoteLink slug="mcp-workstream">MCP workstream</NoteLink>`. Renders `<a href="/notes/mcp-workstream/" class="note-link">…</a>`. No JS. Underline-in + 1px lift handled via CSS `:hover` + `@media (prefers-reduced-motion: no-preference)`.

`NoteCard.astro` contract: receives `{ entry: CollectionEntry<'notes'> }`; emits the listing card.

## DB schema

NOT_REQUIRED — static site, no persistence layer.

## Frontend tasks

1. **Audit V3 first** (no code yet). Read `package.json`, `astro.config.mjs`, `src/layouts/Base.astro`, `src/components/Hero.astro`, `src/components/CaseStudyCard.astro`, `src/components/Footer.astro`, `src/components/RevealObserver.astro`, `src/content/{now,caseStudies,headlines}.ts`, `src/styles/tokens.css`. Confirm `ClientRouter` is already in `Base.astro` (it is, line 6). Do not import it again in `notes/[slug].astro`; let it inherit via the layout.

2. **Create `src/content/config.ts`** — minimal file: `export { collections } from './notes/config';`. This registers the `notes` collection with Astro.

3. **Create `src/content/notes/config.ts`** — Zod schema per the contract above. Status defaults to `published`; only `published` entries are listed.

4. **Author the 4 markdown notes** in `src/content/notes/` from Researcher drafts at `workspace/drafts/`. Each file: frontmatter (title, slug, summary, publishDate `2026-05-16`, tags ≤ 3, related slugs, sources, status: `published`) + body in first-person reflective voice matching `src/pages/thesis.astro`'s prose register. Length per dispatch §4. **Em-dash audit (U+2014) on every file before commit** — replace with periods, semicolons, or rewrites.

5. **Create `src/components/NoteLink.astro`**:
   - Props: `slug: string`, default `<slot />` content.
   - Renders `<a href={`/notes/${slug}/`} class="note-link" data-astro-prefetch>`.
   - Styles in `src/styles/components.css` (appended): underline drawn via `background-image: linear-gradient(...)` + `background-size 0% / 100% 1px` transitioning to `100% / 100% 1px` over 200 ms; `transform: translateY(-1px)` on hover; `color: inherit` (no color change). Wrap motion in `@media (prefers-reduced-motion: no-preference)`. Focus-visible: solid 2 px outline at `var(--accent)`.

6. **Create `src/components/NoteCard.astro`**:
   - Props: `entry: CollectionEntry<'notes'>`.
   - Renders eyebrow (`<span class="eyebrow">` with formatted `publishDate` + first tag), title (`<h3 class="serif">`), summary `<p>`, and a `<span class="mono">/notes/<slug>/</span>` corner mark for craft signal.
   - Outer element: `<a href={`/notes/${entry.slug}/`} class="note-card">`. Hover: 1 px lift + accent-tinted border via `border-color: var(--accent)` transitioned 200 ms. Reduced-motion media query disables both.
   - `transition:name={`note-title-${entry.slug}`}` on the title element so the index → detail morph picks it up.

7. **Create `src/pages/notes/index.astro`**:
   - Uses `Base.astro` with `title="Notes — Tom Scholtes"`, custom `description` (~140 chars), `path="/notes/"`.
   - `await getCollection('notes', ({ data }) => data.status === 'published')`, sort `publishDate` desc.
   - Wrapper in `<RevealObserver>` (existing component) for staggered fade-in: each `NoteCard` gets `class="reveal"` and inline `style={`--reveal-delay: ${i * 50}ms`}` capped at index 5 (max 6 cards per dispatch §5). The 50 ms cap and reduced-motion short-circuit live in the existing observer.
   - Grid layout via `.notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }` appended to `components.css`.

8. **Create `src/pages/notes/[slug].astro`**:
   - `export async function getStaticPaths()` enumerates published notes.
   - Layout: uses `Base.astro` with `title={`${note.data.title} — Tom Scholtes`}`, `description={note.data.summary}`, `path={`/notes/${note.slug}/`}`.
   - Renders eyebrow (`/ notes · {formatted publishDate} · {tags.join(' · ')}`), `<h1 class="serif">` with `transition:name={`note-title-${note.slug}`}`, summary `<p>` with `transition:name={`note-summary-${note.slug}`}`, then `<Content />` from `note.render()`.
   - Bottom block: `Sources` list (rendered from `note.data.sources`) and `Related` chips (linked NoteCards if `note.data.related` non-empty).
   - Back-link: `<a href="/notes/">← all notes</a>` in mono.
   - **No `<ClientRouter />` here** — inherited from Base.

9. **Animation pass (per dispatch / §5):**
   - Inline NoteLink hover: underline-in 200 ms, 1 px lift, no color change. Reduced-motion guard.
   - Index → detail morph: handled by `transition:name` on title + summary. No additional code beyond the directives.
   - Index reveal: staggered ≤ 6 cards × 50 ms via `RevealObserver`. Reduced-motion shortcircuit.
   - **No other motion added.** No hero changes, no project-page motion changes, no theme transitions.

10. **Inline mention pass (per dispatch / §6):**
    - Concepts: `MCP workstream` → `mcp-workstream`; `token economy` / `GL never enters the context` → `token-economy-principle`; `self-hosted RAG` / `OpenKB` / `Meridian` / `Claude Max OAuth` → `self-hosted-rag-claude-max`; `remembering assistant` / `G2 + memory` framing → `the-remembering-assistant`.
    - Walk the file set in scope (`src/content/caseStudies.ts`, `src/content/now.ts`, `src/pages/index.astro`, `src/pages/projects/index.astro`, `src/pages/projects/devswarm/index.astro`, `src/pages/projects/exocortex/index.astro`, `src/components/ArchitectureExocortex.astro`, `src/components/CV.astro`). For each file: identify first occurrence of each concept, wrap in `<NoteLink slug="…">…</NoteLink>`. **Max one per concept per page; first mention wins.** Skip files where no concept appears.
    - `.ts` content modules (`caseStudies.ts`, `now.ts`) currently emit raw strings rendered as text. To support inline NoteLink there, either (a) refactor the string field to an array of `{ kind: 'text'|'note', value: string, slug?: string }` segments rendered by a small `<RichText>` component, OR (b) keep the strings plain and add the NoteLink wraps only inside `.astro` files where JSX-style components compose cleanly. **Choose (b)** to keep diff surface small: the inline pass focuses on `.astro` files; if a target string lives only in `caseStudies.ts` / `now.ts`, the Frontend persona moves that specific line into the consuming `.astro` template instead of refactoring the data module.
    - Document every placement in `workspace/REVIEW.md` as `file:line — concept → /notes/<slug>/`.

11. **Footer link** (dispatch §10 Q4): add `<a href="/notes/">Notes</a>` to `src/components/Footer.astro` alongside the existing footer nav cluster. No styling override.

12. **Append CSS** to `src/styles/components.css`: `.note-link`, `.note-card`, `.notes-grid`, `.note-eyebrow`, `.note-sources`, `.note-related` rules. Append-only; do NOT touch `tokens.css`, `global.css`, `pages.css`.

13. **Local verify** before handoff:
    - `npm ci && npm run build` exits 0.
    - `dist/notes/index.html` exists; `dist/notes/<slug>/index.html` exists for all four slugs.
    - No console warnings in build output about unknown frontmatter fields.
    - `grep -rP $'\xe2\x80\x94' src/ public/` returns ZERO matches.
    - `grep -riE 'Sofia|Bekzoda|Triton|composite-keys|Investran|Dealsplus|Luke|Joakim|Anna|Conrad|Adam' src/content/notes/` returns ZERO matches.
    - Visit `/` and `/notes/` in `npm run dev`, click through to all four notes via inline links AND via index cards. Confirm View Transitions morph the title. Toggle `prefers-reduced-motion` in DevTools → confirm motion disabled.

## Backend tasks

NOT_REQUIRED.

The site is static. The only build-config touchpoint is registering the new content collection, which is a frontend concern handled by creating `src/content/config.ts`. No `astro.config.mjs` edit required — Astro 5 auto-discovers content collections from `src/content/`. If Backend persona finds during execution that `astro.config.mjs` needs an integration tweak (e.g., remark plugin for the markdown notes), it writes the rationale to `workspace/backend_notes.md` and pings Architect before editing. Otherwise emits `NOT_REQUIRED`.

## Acceptance criteria

Reviewer-Deployer runs these in order, captures evidence in PR description, does NOT auto-merge.

1. **Build green** — `cd workspace/.target_repo && npm ci && npm run build` exits 0. Tail of output attached to PR.
2. **Four notes built** — `test -f dist/notes/index.html && for s in mcp-workstream token-economy-principle self-hosted-rag-claude-max the-remembering-assistant; do test -f "dist/notes/$s/index.html" || exit 1; done`.
3. **Em-dash ban** — `grep -rP $'\xe2\x80\x94' src/ public/` returns ZERO matches (U+2014, the literal `—` character). Command and count attached.
4. **Leakage grep** — `grep -riE 'Sofia|Bekzoda|Triton|composite-keys|Investran|Dealsplus|Luke|Joakim|Anna|Conrad|Adam' src/content/notes/` returns ZERO matches. Command and count attached.
5. **Jarvis grep** — `grep -ri 'Jarvis' src/content/notes/the-remembering-assistant.md`: any matches must be reflective / first-person framing only, no product-pitch / "I built Jarvis" language. Reviewer reads each match against PLAN.md §11 and the dispatch leakage list. If a match implies Jarvis-as-application is built, the note is sent back to Researcher.
6. **First-person voice** — spot-check first paragraph of each note; must read in first person (per dispatch §10 Q1).
7. **Visible publish dates** — each note detail page renders `publishDate` in the eyebrow. Index card shows the date. (Dispatch §10 Q2.)
8. **Tags ≤ 3** — `grep -c '^- ' src/content/notes/*.md` for the `tags:` block; each file shows ≤ 3 tag entries; schema enforces this at build (`z.array(z.string()).max(3)`).
9. **Footer link** — `grep -q 'href="/notes/"' src/components/Footer.astro` succeeds; rendered into every page (verified by `grep -l '/notes/' dist/**/index.html` showing all top-level pages).
10. **Inline NoteLink integrations ≥ 3** — count distinct `<NoteLink slug=` placements across the V3 file set in scope. Dispatch success criterion §11 requires ≥ 3. Each placement reported in PR description with `file:line — concept → /notes/<slug>/`.
11. **Max one per concept per page** — for each modified file, `grep -c 'NoteLink slug="mcp-workstream"' <file>` ≤ 1 and similarly for the other three slugs. Reviewer attaches the matrix.
12. **View Transitions wired** — `grep -q 'transition:name="note-title-' src/pages/notes/\[slug\].astro` and same string in `NoteCard.astro` succeed.
13. **Reduced-motion respected** — `grep -q 'prefers-reduced-motion' src/styles/components.css` succeeds; the `.note-link` and `.note-card` motion blocks are guarded. Reviewer toggles the media-query in a headless run and confirms transitions / underline animations disable.
14. **No new runtime deps** — `git diff main -- package.json package-lock.json` shows ZERO added dependencies. (Astro built-ins only per dispatch hard rule.)
15. **Tokens untouched** — `git diff main -- src/styles/tokens.css` is empty. `tokens.css`, fonts, terracotta accent, light/dark/ink themes unchanged.
16. **Lighthouse ≥ 95 on /notes/** — Performance ≥ 95 on staging build. Score attached.
17. **No console errors** — `npm run build` output contains zero `[ERROR]` lines; runtime check in dev server on `/notes/` and one note page shows clean console.
18. **PR opened, not merged** — branch `v4/notes-section` pushed; `gh pr create` against `main` succeeds; PR URL captured to `workspace/.pr_url`. Reviewer-Deployer STOPS. Orchestrating Claude session handles merge after diff read (per dispatch).

**PR description must include**, in order: (a) one-line summary of each of the 4 notes; (b) inline NoteLink matrix from criterion 10; (c) build output tail; (d) grep results from criteria 3, 4, 5 verbatim; (e) Lighthouse score from criterion 16; (f) the criteria 1–17 checklist with pass marks.

[opus + 3 tool calls]

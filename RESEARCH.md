# RESEARCH.md — tomscholtes-v4

## Libraries

V4 is **strictly additive** to V3 with **zero new runtime dependencies** (acceptance criterion 14). Everything in the table is either already in V3's `package.json` or a built-in Astro 5 feature. No npm install is needed.

| Name | Version | Purpose | Link |
|---|---|---|---|
| Astro | ^5.0.0 (existing) | Static build, file-based routing, content collections | https://docs.astro.build/en/getting-started/ |
| Astro Content Collections | Astro 5 builtin | `defineCollection` + Zod schema for `notes/` | https://docs.astro.build/en/guides/content-collections/ |
| Zod | bundled with Astro | Schema validation for note frontmatter | https://zod.dev/ |
| `astro:transitions` (`ClientRouter`) | Astro 5 builtin | View Transitions API + SPA-style nav between index ↔ detail | https://docs.astro.build/en/guides/view-transitions/ |
| `astro:content` (`getCollection`, `CollectionEntry`) | Astro 5 builtin | Type-safe access to `notes` collection | https://docs.astro.build/en/reference/modules/astro-content/ |
| Remark + Rehype | Astro defaults | Markdown → HTML for note bodies | https://docs.astro.build/en/guides/markdown-content/ |
| View Transitions API | CSS-WG Level 1 (WD) | `transition:name` pairing of index ↔ detail title morph | https://drafts.csswg.org/css-view-transitions-1/ |
| Intersection Observer | Level 1 (REC) | Staggered scroll reveal (existing `RevealObserver`) | https://www.w3.org/TR/intersection-observer/ |
| CSS Media Queries Level 5 | WD | `prefers-reduced-motion` guards on motion blocks | https://www.w3.org/TR/mediaqueries-5/ |
| CSS Backgrounds and Borders Level 3 | REC | `background-image: linear-gradient(...)` underline-draw effect | https://www.w3.org/TR/css-backgrounds-3/ |
| CSS Transforms Level 1/2 | REC/CR | 1 px `translateY(-1px)` hover lift | https://www.w3.org/TR/css-transforms-1/ |
| HTML Living Standard | WHATWG | `<a>` semantics, `meta` description, etc. | https://html.spec.whatwg.org/multipage/ |
| Schema.org `Article` (optional) | live spec | JSON-LD for note detail pages if SEO desired (not in PLAN) | https://schema.org/Article |

Tooling-only (not runtime):
- `grep -P` with `\xe2\x80\x94` for em-dash audit (GNU grep / ripgrep) — https://www.gnu.org/software/grep/manual/grep.html
- `gh pr create` — https://cli.github.com/manual/gh_pr_create

## Reference patterns

### 1. Astro 5 content collection schema (legacy "content" type)

Source: Astro docs, "Content Collections" — https://docs.astro.build/en/guides/content-collections/

```ts
// src/content/notes/config.ts
import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string().max(220),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).max(3).default([]),
    related: z.array(z.string()).default([]),
    sources: z.array(z.object({
      label: z.string(),
      kind: z.enum(['notion', 'memory', 'site', 'external']),
    })).default([]),
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const collections = { notes };
```

```ts
// src/content/config.ts
export { collections } from './notes/config';
```

`z.coerce.date()` accepts YAML's unquoted ISO date `publishDate: 2026-05-16` and coerces it to a `Date` object. Without `coerce`, you'd need to write `new Date('2026-05-16')` in frontmatter, which doesn't work in YAML.

### 2. Listing page with `getCollection` + filter + sort

Source: Astro docs, "Querying collections" — https://docs.astro.build/en/guides/content-collections/#querying-collections

```astro
---
// src/pages/notes/index.astro
import Base from '../../layouts/Base.astro';
import NoteCard from '../../components/NoteCard.astro';
import RevealObserver from '../../components/RevealObserver.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('notes', ({ data }) => data.status === 'published'))
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
---
<Base title="Notes — Tom Scholtes" description="Reflections on MCP, token economy, RAG, and memory." path="/notes/">
  <RevealObserver>
    <section class="notes-grid">
      {entries.map((entry, i) => (
        <div class="reveal" style={`--reveal-delay: ${Math.min(i, 5) * 50}ms`}>
          <NoteCard entry={entry} />
        </div>
      ))}
    </section>
  </RevealObserver>
</Base>
```

Cap the per-card delay at index 5 so card 7+ doesn't introduce a noticeable lag. Inline `--reveal-delay` CSS variable lets the existing `RevealObserver` apply `transition-delay: var(--reveal-delay)` without per-card JS.

### 3. Detail page with `getStaticPaths` + `entry.render()`

Source: Astro docs, "Generating routes from data" — https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content

```astro
---
// src/pages/notes/[slug].astro
import Base from '../../layouts/Base.astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('notes', ({ data }) => data.status === 'published');
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

interface Props { entry: CollectionEntry<'notes'> }
const { entry } = Astro.props;
const { Content } = await entry.render();
const fmt = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
---
<Base
  title={`${entry.data.title} — Tom Scholtes`}
  description={entry.data.summary}
  path={`/notes/${entry.slug}/`}
>
  <article class="note">
    <p class="eyebrow mono">
      / notes · {fmt.format(entry.data.publishDate)}{entry.data.tags.length ? ` · ${entry.data.tags.join(' · ')}` : ''}
    </p>
    <h1 class="serif" transition:name={`note-title-${entry.slug}`}>{entry.data.title}</h1>
    <p class="lead" transition:name={`note-summary-${entry.slug}`}>{entry.data.summary}</p>
    <Content />
    {entry.data.sources.length > 0 && (
      <section class="note-sources">
        <h2 class="eyebrow">Sources</h2>
        <ul>{entry.data.sources.map(s => <li>{s.label} <span class="mono">· {s.kind}</span></li>)}</ul>
      </section>
    )}
    <p class="back mono"><a href="/notes/">← all notes</a></p>
  </article>
</Base>
```

`entry.slug` (legacy "content" type) is the filename without extension by default — matches `{ params: { slug } }` for the route. Note: the new Astro 5 Content Layer API uses `entry.id` instead of `entry.slug` — see Gotchas.

### 4. View Transitions named morph

Source: Astro docs, "View Transitions" — https://docs.astro.build/en/guides/view-transitions/ and CSS-WG draft "Named view transitions" — https://drafts.csswg.org/css-view-transitions-1/#named-elements

```astro
<!-- NoteCard.astro -->
<a href={`/notes/${entry.slug}/`} class="note-card">
  <h3 class="serif" transition:name={`note-title-${entry.slug}`}>{entry.data.title}</h3>
  <p>{entry.data.summary}</p>
</a>

<!-- pages/notes/[slug].astro -->
<h1 class="serif" transition:name={`note-title-${entry.slug}`}>{entry.data.title}</h1>
```

The browser pairs elements that share `view-transition-name` (Astro's `transition:name` directive emits exactly that CSS property under the hood) and animates their geometry between the two states. **Both elements must have unique names** — using `transition:name="note-title"` on every card would cause the browser to skip the animation entirely (per spec §5: duplicate names ⇒ skip). Always include `${entry.slug}` to disambiguate.

### 5. NoteLink primitive — underline-draw on hover, lift, reduced-motion guarded

Source: CSS-Tricks "Animated CSS Underline" — https://css-tricks.com/css-link-hover-effects/ and MDN `prefers-reduced-motion` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

```astro
---
// src/components/NoteLink.astro
interface Props { slug: string }
const { slug } = Astro.props;
---
<a href={`/notes/${slug}/`} class="note-link" data-astro-prefetch><slot /></a>
```

```css
/* appended to src/styles/components.css */
.note-link {
  color: inherit;
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-size: 100% 1px;
}
@media (prefers-reduced-motion: no-preference) {
  .note-link {
    background-size: 0 1px;
    transition: background-size 200ms ease, transform 200ms ease;
  }
  .note-link:hover,
  .note-link:focus-visible {
    background-size: 100% 1px;
    transform: translateY(-1px);
  }
}
.note-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

The trick: render the static (always-visible) underline by default for users with reduced motion, then *override* with a 0-width animated underline inside the `no-preference` block. This guarantees the link is visually identifiable as a link **always** — never "invisible until hovered" for reduced-motion users.

### 6. `data-astro-prefetch` (Astro 5 builtin prefetch)

Source: Astro docs, "Prefetch" — https://docs.astro.build/en/guides/prefetch/

```html
<a href="/notes/mcp-workstream/" data-astro-prefetch>MCP workstream</a>
```

Astro 5 ships prefetch as a stable feature (no integration needed). The strategy defaults to `hover` — page is fetched on hover, ready before click. Cost: tiny (one fetch per hovered link). Reference: https://docs.astro.build/en/reference/configuration-reference/#prefetch.

### 7. Em-dash audit command

Source: GNU grep manual — https://www.gnu.org/software/grep/manual/grep.html and POSIX byte syntax

```bash
grep -rP $'\xe2\x80\x94' src/ public/
```

`-P` enables Perl-compatible regex (needed for byte-level `\x` escapes in the pattern). `$'...'` is bash's ANSI-C quoted string — produces the raw 3-byte UTF-8 sequence for U+2014 (em-dash). An equivalent ripgrep call: `rg --pcre2 '\x{2014}' src/ public/`. Exit code 0 means at least one match (failure for our purposes); exit 1 means clean.

### 8. Frontmatter shape for a note

Source: PLAN §3 (schema) + Astro markdown docs — https://docs.astro.build/en/guides/markdown-content/

```yaml
---
title: "The MCP workstream"
slug: "mcp-workstream"
summary: "Wiring Outlook and Monday.com into Claude Code through MCP, and what it taught me about scope of automation."
publishDate: 2026-05-16
tags: ["mcp", "automation", "tools"]
related: ["self-hosted-rag-claude-max"]
sources:
  - label: "Personal Notion — MCP workstream brief"
    kind: notion
  - label: "Anthropic MCP spec"
    kind: external
status: published
---
```

YAML 1.2 parses the unquoted date `2026-05-16` as a date if `z.coerce.date()` accepts it. Always quote `title`/`summary` (avoid colons confusing the YAML parser).

### 9. Reusing existing `RevealObserver` with stagger

Source: Astro docs, "Reusing components" — https://docs.astro.build/en/basics/astro-components/

```astro
<!-- existing src/components/RevealObserver.astro is assumed to:
     - wrap children in a container
     - add an IntersectionObserver
     - apply .visible class when in view
     - respect prefers-reduced-motion (instant reveal)
-->
<RevealObserver>
  {entries.map((entry, i) => (
    <div class="reveal" style={`--reveal-delay: ${Math.min(i, 5) * 50}ms`}>
      <NoteCard entry={entry} />
    </div>
  ))}
</RevealObserver>
```

The CSS in `components.css` (or wherever the existing reveal rules live) should already include:

```css
.reveal { opacity: 0; transform: translateY(8px); transition: opacity .4s ease var(--reveal-delay, 0ms), transform .4s ease var(--reveal-delay, 0ms); }
.reveal.visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
```

Verify the existing observer's CSS supports `--reveal-delay` before relying on it. If not, append the rule above to `components.css`.

## Gotchas

- **Astro 5 Content Layer API vs legacy `type: 'content'`**: Astro 5 introduced a new "Content Layer" API with `loader: glob({...})` syntax. The PLAN uses the **legacy** `type: 'content'` API. Legacy is still supported in Astro 5 but flagged for future removal. The legacy API uses `entry.slug`; the new Content Layer API uses `entry.id`. **PLAN's `entry.slug` references the legacy field — keep using `type: 'content'`. Do not "modernize" unless instructed.** Reference: https://docs.astro.build/en/guides/upgrade-to/v5/#legacy-v20-content-collections-api.
- **Content config file location**: Astro 5 recommends `src/content.config.ts` (top-level, not under `content/`). The pre-5 location `src/content/config.ts` still works. **PLAN says `src/content/config.ts` — use that.** Both locations are auto-discovered; do not duplicate. Reference: https://docs.astro.build/en/guides/content-collections/#the-collection-config-file.
- **`getStaticPaths` runs at build only**: With `output: 'static'`, `getStaticPaths` evaluates once at build. Adding a note later requires a rebuild. This is expected for V4.
- **`entry.render()` returns a Promise**: `const { Content } = await entry.render();` — the `await` is mandatory. Forgetting it produces a confusing "Content is undefined" error at runtime, not a build error.
- **`Content` is a component, not a string**: Render it with `<Content />`. Do **not** try `{entry.body}` to render HTML — `body` is raw markdown source, not HTML.
- **YAML date parsing**: `publishDate: 2026-05-16` is parsed by YAML as a date. `publishDate: "2026-05-16"` (quoted) is parsed as a string and requires `z.coerce.date()` to convert. Use **unquoted** dates for cleanliness; `z.coerce.date()` handles both.
- **YAML colon-in-title**: A frontmatter `title: The MCP workstream: a retrospective` will fail YAML parsing (second colon ambiguity). Always quote titles with colons: `title: "The MCP workstream: a retrospective"`.
- **`transition:name` collision**: Named view transitions must be unique within a page. Two cards with the same name → animation skipped silently. Always interpolate the slug into the name: `transition:name={`note-title-${entry.slug}`}`. Reference: https://drafts.csswg.org/css-view-transitions-1/#dom-viewtransitiontypeset.
- **View Transitions browser support**: Native View Transitions API is supported in Chrome 111+, Edge 111+, Safari 18+ (Sep 2024), Firefox 132+ (Oct 2024). Astro's `ClientRouter` falls back to instant navigation in older browsers. Reference: https://caniuse.com/view-transitions. No polyfill needed; degraded experience is acceptable.
- **`ClientRouter` and inline `<script is:inline>`**: View Transitions persist the document between navigations, so `<script is:inline>` runs **once at first load** and not again on subsequent page navigations. The V3 pre-paint theme script in `Base.astro` is therefore safe (theme is set before any paint of the first page). Reference: https://docs.astro.build/en/guides/view-transitions/#script-behavior.
- **`document.documentElement.dataset.theme` and View Transitions**: The persisted `<html>` element retains its `data-theme` attribute across navigations. No re-application needed. But any **per-page** script in `is:inline` will not re-run. If a note page needs page-specific JS, use `<script>` (default, bundled, re-fires on transition) or `<script data-astro-rerun>`. Reference: https://docs.astro.build/en/guides/view-transitions/#data-astro-rerun.
- **Em-dash audit byte sequence**: U+2014 in UTF-8 is **`0xE2 0x80 0x94`**. `grep -P` with `\xe2\x80\x94` and `rg --pcre2 '\x{2014}'` both work. **Watch for U+2013 (en-dash, 0xE2 0x80 0x93) — different character, also looks dash-y.** PLAN bans only U+2014; en-dashes pass. If the brief intent is "no fancy dashes at all", add U+2013 to the grep: `grep -rP $'\xe2\x80[\x93\x94]' src/`. Confirm with Architect before broadening.
- **CLAUDE.md's no-em-dash rule applies to all written content**: Tom's global instructions ban U+2014. The note bodies and frontmatter must obey. The grep gate (criterion 3) enforces it. Pre-flight every note before commit.
- **Markdown auto-em-dash conversion**: Some markdown processors convert `--` to en-dash and `---` to em-dash (SmartyPants-style). **Astro's default markdown pipeline does NOT do this** — verify by checking `astro.config.mjs` for `markdown.smartypants` (absent by default in Astro 5). Reference: https://docs.astro.build/en/reference/configuration-reference/#markdownsmartypants. If smartypants is enabled, a literal `---` in note body becomes `—` in HTML, which would pass `grep src/` but fail a `grep dist/` audit. Run the em-dash grep on `dist/` too if uncertain.
- **Frontmatter unknown-field warnings**: Astro logs `[content] Unknown field "X"` if a frontmatter key isn't in the schema. PLAN criterion 13 requires zero such warnings. Either match the schema exactly, or call `z.object({...}).strict()` to fail the build on extras. Default Zod is permissive — undocumented fields pass silently. Use strict mode in development to catch drift.
- **`z.array(...).max(3)` is build-time enforcement**: If a frontmatter file lists 4 tags, the build fails with a Zod error. That's the desired behaviour (acceptance criterion 8). Do not relax to `.optional()` — let the schema gate enforce.
- **Inline NoteLink in `.ts` content modules**: PLAN §10 specifies option (b) — keep `.ts` strings plain, move the specific line into the `.astro` template if a NoteLink is needed. **Do NOT refactor `caseStudies.ts` / `now.ts` into rich-segment arrays.** That would be a structural change; PLAN explicitly forbids it.
- **First-mention rule**: "Max one NoteLink per concept per page; first mention wins." Implementation: walk the file, find first match of each concept string, wrap it. If a concept appears 0 times → skip. If 2+ times → wrap only the first. Reviewer-Deployer audits this via per-file grep count ≤ 1 (criterion 11).
- **Concept-string disambiguation**: The token-economy concept matches multiple phrasings ("token economy", "GL never enters the context"). Pick one canonical phrase per file (the most concept-evocative one) and wrap only that. Document the choice in REVIEW.md.
- **`<a>` inside `<a>` is invalid HTML**: `NoteCard` is itself an `<a class="note-card">`. **Do not nest a `<NoteLink>` inside `NoteCard`** — browsers will reflow the inner `<a>` outside the outer one (or render unpredictably). NoteCards are listing cards; NoteLinks are inline mentions in body copy. Don't mix.
- **`getCollection` and draft entries**: Without a filter, `getCollection('notes')` returns *all* entries including `status: 'draft'`. Always pass the filter `({ data }) => data.status === 'published'`. Otherwise drafts ship to production.
- **`new Intl.DateTimeFormat` locale**: Defaults to the build host's locale. Pin explicitly to `'en-GB'` (or `'en'`) so build output is deterministic regardless of CI runner locale. Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat.
- **`text-decoration: none` accessibility**: Removing the default underline on `.note-link` and replacing with a hover-only underline is **less accessible than the default** for low-vision users. The `no-preference` block adds the underline-on-hover, but the static (no-preference-not-matching) state still has a 1-pixel underline. Verify with pa11y. If contrast is insufficient, raise the underline width to 1.5 px or make it always-visible at lower opacity. WCAG 2.2 SC 1.4.1 forbids using color alone to indicate links.
- **`color: inherit` on links**: Keeps NoteLinks visually consistent with surrounding text. Combined with the underline, it remains distinguishable as a link. Verify per WCAG SC 1.4.1.
- **Footer link must not break existing layout**: V3's Footer has a fixed nav cluster. Append `Notes` to the cluster (not as a new line/row). Inspect spacing on mobile (< 720 px); ensure no wrap break that puts "Notes" alone on a row.
- **`grep -c '^- '` for tag count is approximate**: PLAN's criterion 8 uses `grep -c '^- '` on the `tags:` block — this counts ALL `- ` list items in the file, including under `related:` and `sources:`. Frontmatter limits the tag block specifically, not the whole-file `-` count. Read the criterion carefully: it likely meant "tags-block-scoped" — verify by reading the tag list manually or using `yq` for precision: `yq '.tags | length' note.md`. Schema enforcement (`z.array().max(3)`) is the real gate; the grep is a smoke test.
- **`gh pr create` requires auth**: Reviewer-Deployer's persona must have `gh auth status` returning logged-in. If not, PR creation fails. PLAN assumes auth is preconfigured per V3 deploy workflow.
- **Branch name `v4/notes-section`**: Slashes in branch names are allowed by git but some tooling (older Jenkins, certain CI) chokes. GitHub handles them. `gh pr create --base main --head v4/notes-section` is the standard incantation.
- **No new dependencies (criterion 14)**: Avoid the temptation to `npm install date-fns` for date formatting. `Intl.DateTimeFormat` (stdlib) is sufficient. Avoid `npm install reading-time` — not in scope.
- **Build output console errors**: Astro logs deprecation warnings for legacy collection APIs in Astro 5. These are `[WARN]`, not `[ERROR]`. Criterion 17 looks for `[ERROR]` only — warnings are tolerated but worth noting in PR description.
- **OG image and notes**: V3's static OG endpoint emits ONE default OG. PLAN does not request per-note OGs. Note detail pages reuse `og:image` from Base. Acceptable. If individually-OG'd notes are wanted later, add per-page `<meta property="og:image">` in the `[slug].astro` frontmatter.
- **JSON-LD `Article` schema (not in PLAN)**: For SEO, each note could emit `Article` JSON-LD. PLAN omits this. If added later, escape `<` to `\u003c` in stringified payloads (same XSS-prevention rule as V3).

## Security

V4's surface is a strict subset of V3's: same static-site shape, same GitHub Pages target, same zero-runtime-deps posture. New attack vectors are limited to markdown rendering and the inline NoteLink primitive.

- **Markdown XSS**: Astro's default markdown pipeline (remark + rehype) does **not** sanitise HTML embedded in markdown by default. A note containing raw `<script>alert(1)</script>` in its body would render the script tag verbatim. **Mitigation**: notes are authored by Tom (trusted), reviewed by Reviewer-Deployer, and committed. There is no untrusted markdown source. If notes ever accept external contributions, add `rehype-sanitize` — https://github.com/rehypejs/rehype-sanitize.
- **Markdown auto-link XSS**: `[click](javascript:alert(1))` markdown links produce `<a href="javascript:alert(1)">` HTML by default in some processors. Astro's default remark setup **strips `javascript:` URL schemes** (verify with `npm view @astrojs/markdown-remark` and check the remark-rehype default). Defensive measure: lint note bodies with `eslint-plugin-mdx` or grep for `javascript:` in committed notes.
- **Frontmatter injection**: Zod schema validation gates frontmatter shape. Any unexpected field with strict mode triggers a build error. Without strict mode, extra fields pass silently — low-risk because they aren't rendered.
- **XSS via NoteLink slug**: The slug interpolates into `href={`/notes/${slug}/`}`. If the slug contains `"` or `<`, Astro's JSX-like escaping handles it (attribute values are escaped). Per Astro docs (https://docs.astro.build/en/guides/dev-toolbar/), expression interpolation auto-escapes. Slugs come from frontmatter (controlled) → no user input → no risk. But verify by trying `slug: "ev\"il"` once locally and confirming the escape works (defensive QA).
- **`set:html` audit**: PLAN does not introduce new `set:html` sinks. The only `set:html` in V3 was the JSON-LD payload (typed literals → safe). V4 inherits this with no expansion.
- **`data-astro-prefetch` and SSRF / privacy**: Prefetch fetches the same-origin note HTML on hover. No third-party fetches. No SSRF risk. Privacy: prefetch reveals user intent to the server (fetch of `/notes/X/`) before they click. Static site → no server logs analysed → no privacy leak beyond GitHub Pages' raw access logs.
- **View Transitions and DOM swap**: `ClientRouter` swaps the `<body>` content between routes. Any third-party script (none here) could re-inject during the swap. With zero third-party JS, the surface is closed. The pre-paint script runs only on initial load (see Gotchas) — no re-entry risk.
- **`localStorage` consistency across pages**: TweaksPanel/DisplayPanel (V3 islands) hydrate on `/`. They do not hydrate on `/notes/*` unless those pages explicitly import them. If a user changes theme on `/`, navigates to `/notes/X/`, the theme is read from `<html data-theme>` (preserved across view-transition navigations) so it stays consistent. Confirm by toggling theme on index, navigating to a note, and verifying the theme persists.
- **Em-dash audit as content-integrity control**: U+2014 ban is a writing-style enforcement (Tom's CLAUDE.md). Treated as a security/quality gate at build time.
- **Leakage grep (criterion 4)**: Hard-coded list of forbidden names/terms prevents accidental disclosure of colleagues, project codenames, and internal systems. This is **operational security**, not just style. Names like `Sofia`, `Bekzoda`, `Anna`, `Conrad`, `Luke`, `Joakim`, `Adam` are real people; `Triton`, `Investran`, `Dealsplus`, `composite-keys` are employer-internal terms. Public disclosure could harm Tom's employment. Reviewer-Deployer MUST run criterion 4 and block merge on any match.
- **Jarvis honesty grep (criterion 5)**: Self-imposed integrity gate. Public claims about "having built Jarvis" would be false → reputational risk. Reflective first-person framing is permitted; product-pitch language is not.
- **No new runtime dependencies (criterion 14)**: Zero supply-chain expansion. Maintains V3's secure dependency posture.
- **GitHub Actions security**: V4 uses the same deploy workflow as V3 (`actions/configure-pages@v5`, `actions/deploy-pages@v4`). No changes. Least-privilege permissions preserved (`contents: read, pages: write, id-token: write`).
- **PR-not-merge gate (criterion 18)**: Reviewer-Deployer stops at PR creation. Human (Tom) reads diff before merge. This is the final integrity boundary against persona drift. **Do not auto-merge.**
- **CSP**: Inherited from V3's meta CSP (if present). New inline `<script>` for `RevealObserver` requires `'unsafe-inline'` for `script-src` — already required by V3. No new CSP relaxation needed.
- **Subresource Integrity**: N/A — no external resources, same as V3.
- **Privacy**: No analytics added. No tracking. No third-party fetches. Note pages are pure HTML+CSS with one prefetch link strategy (same-origin). GDPR/ePrivacy posture: unchanged, no consent banner required.
- **`gh pr create` and secret exposure**: PR description (per acceptance criteria) includes grep results, build output, Lighthouse scores. **Verify the grep output for criteria 3, 4, 5 does not include the surrounding text of any (rare false-positive) match** — `grep` with default settings prints the matching line, which could leak adjacent content. Use `grep -c` (count only) or `grep -l` (files only) for the PR description when zero matches is the expected result. The criterion says "command and count attached" → use `wc -l`.
- **Markdown sources field and HTML injection**: `sources: [{ label, kind }]` — if `label` contains `<script>`, it renders into `<li>{s.label}</li>`. Astro JSX-style interpolation escapes string children — verify by writing `label: "<b>bold</b>"` once and confirming literal output. Should be safe by default. Reference: https://docs.astro.build/en/basics/astro-syntax/#dynamic-html.
- **CWE-79 (XSS) summary**: Surface is closed by (a) trusted author, (b) Astro auto-escape on expression interpolation, (c) default remark sanitisation of `javascript:` URLs, (d) review gate. Quad-defence; risk is negligible.
- **CWE-918 (SSRF) / CWE-22 (Path Traversal)**: N/A — no server, no filesystem access at runtime.
- **CWE-377 (Insecure Temp Files)**: N/A.
- **CWE-200 (Information Exposure)**: Mitigated by criteria 4 (leakage grep) and 5 (Jarvis grep). Operational security baked into the acceptance gate.

[opus + 1 tool call]

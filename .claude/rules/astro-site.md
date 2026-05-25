# tomscholtes.com Astro site — project rules

Project-scoped rules for the live site (Astro 5 + React 18 islands, GitHub Pages deploy via `tomscholtes93-collab.github.io.git`).

Distilled from DevSwarm v3 / v4 batches (PR #6, PR #7). Migrated to Claude Code Agent Teams 2026-05-24.

## Stack

- **Framework:** Astro 5.x.
- **Islands:** React 18 only where strictly needed (`@astrojs/react`); avoid for new work if JS budget tight.
- **Fonts:** self-hosted via `@fontsource/instrument-serif`, `@fontsource/inter`, `@fontsource/jetbrains-mono`; copied at build via `scripts/copy-fonts.mjs`. No Google Fonts CDN.
- **Build chain:** `check-notes → copy-fonts → make-og → astro build → post-build`. All five must succeed for a clean `dist/`.
- **Deploy:** GitHub Pages (static). No backend runtime. Anything needing a server requires a separate adapter and target.

## Layout invariants (must not change without explicit Tom approval)

- Theme tokens in `src/styles/tokens.css`.
- Typography rules in `src/styles/components.css`.
- Body prose is **justified on screens ≥ 600px** with `hyphens: auto`. Meta paragraphs (`.eyebrow`, `.back`, mono labels) stay left-aligned.
- Hover animation pattern: 200ms underline grow + 1px vertical lift, no color change.
- `prefers-reduced-motion` short-circuits ALL motion. Every transition has a media-query gate.

## Forbidden in any user-facing surface

- **Em-dashes (U+2014).** Grep before handoff: `grep -rP $'\xe2\x80\x94' src/ public/`. Use periods, semicolons, or rewrite.
- **Leakage names** in `src/content/notes/` and any user-facing prose. Full list in `~/Projects/Personal_Website/V5/NOTES_GUIDE.md`. Word-boundary regex check.

## Patterns that work

- **Schema-first content collections.** `src/content/<collection>/config.ts` Zod schema BEFORE any `.md` file. Build fails fast on schema drift.
- **View Transitions** with `transition:name={\`note-title-${entry.slug}\`}` template-literal pattern. Unique transitions per entry.
- **Inline NoteLink** as a small Astro component, not a React island. `<NoteLink slug="...">label</NoteLink>` keeps zero JS overhead.
- **Footer link** to any new section for nav discoverability.
- **Build-time hard gate** at `scripts/check-notes.mjs` already enforces em-dash + leakage in `src/content/notes/`. Wire equivalent gates for any new content collection.

## What NOT to touch

- `src/styles/tokens.css` or any theme variable without Tom-level sign-off.
- `astro.config.mjs` `i18n` block once configured (only architect changes it).
- `.github/workflows/deploy.yml` — assumes Astro at repo root. If a workspace stages a different structure, revert this file to main.

## Workspace caveat

The folder is named `V2/` but it IS the live site root. Don't be fooled by the name. `V3/`, `V4/`, `V5/` are historical or planning material; only `V2/` deploys.

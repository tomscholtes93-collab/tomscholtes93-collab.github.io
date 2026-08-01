# tomscholtes.com Astro site: project rules

Project-scoped rules for the live site (Astro 5 + React 18 islands, GitHub Pages deploy via `tomscholtes93-collab.github.io.git`).

Distilled from DevSwarm v3 / v4 batches (PR #6, PR #7). Migrated to Claude Code Agent Teams 2026-05-24.

**Read `docs/DECISIONS.md` first.** It is the decision record and it outranks
this file. Where the two disagree, the decision record wins. This file was found
to contradict the code on two points on 2026-08-01 and was repaired; treat every
claim here as checkable against the source rather than as settled.

## Stack

- **Framework:** Astro 5.x.
- **Islands:** React 18 only where strictly needed (`@astrojs/react`); avoid for new work if JS budget tight.
- **Fonts:** self-hosted via `@fontsource/instrument-serif`, `@fontsource/inter`, `@fontsource/jetbrains-mono`; copied at build via `scripts/copy-fonts.mjs`. No Google Fonts CDN.
- **Build chain:** `check-i18n → check-notes → copy-fonts → make-og → astro build → post-build`. All six must succeed for a clean `dist/`. Corrected 2026-08-01: this listed five steps and omitted `check-i18n`, which `package.json` runs first and which is the key-parity gate.
- **Deploy:** GitHub Pages (static). No backend runtime. Anything needing a server requires a separate adapter and target.

## Layout invariants (must not change without explicit Tom approval)

- Theme tokens in `src/styles/tokens.css`. It is the ONLY source of design tokens (`docs/DECISIONS.md`).
- Typography rules in `src/styles/components.css`.
- Body prose is **left-aligned, ragged-right**, with `hyphens: manual`. Corrected 2026-08-01: this file said "justified on screens ≥ 600px with `hyphens: auto`" and had said so since before justification was retired on 2026-06-23. The code is `text-align: left; hyphens: manual` at `components.css:568-569`, and the Knuth-Plass enhancer is no longer loaded so `html.kp` is never set. **Do not re-propose justification.**
- Meta paragraphs (`.eyebrow`, `.back`, mono labels) stay left-aligned.
- The notes article surface is owned by `.note-article` alone. `.prose` was dropped from it on 2026-08-01 because both classes sat on the same element at equal specificity and the winner was decided by source order. `.prose` now serves `404.astro` only.
- Hover animation pattern: 200ms underline grow + 1px vertical lift, no color change.
- `prefers-reduced-motion` short-circuits ALL motion. Every transition has a media-query gate.

## Forbidden in any user-facing surface

- **Em-dashes (U+2014).** Grep before handoff: `grep -rP $'\xe2\x80\x94' src/ public/`. Use periods, semicolons, or rewrite.
- **Leakage names** in `src/content/notes/` and any user-facing prose. The executable list is the base64 denylist inside `scripts/check-notes.mjs` and `scripts/check-i18n.mjs`; those two scripts decide. `~/Projects/Personal_Website/V5/NOTES_GUIDE.md` is quarantined as non-authoritative (`docs/DECISIONS.md`) and is kept only as the record of the original rationale.

## Patterns that work

- **Schema-first content collections.** `src/content/<collection>/config.ts` Zod schema BEFORE any `.md` file. Build fails fast on schema drift.
- **View Transitions** with `transition:name={\`note-title-${entry.slug}\`}` template-literal pattern. Unique transitions per entry.
- **Inline NoteLink** as a small Astro component, not a React island. `<NoteLink slug="...">label</NoteLink>` keeps zero JS overhead.
- **Footer link** to any new section for nav discoverability.
- **Build-time hard gate** at `scripts/check-notes.mjs` already enforces em-dash + leakage in `src/content/notes/`. Wire equivalent gates for any new content collection.

## What NOT to touch

- `src/styles/tokens.css` or any theme variable without a matching entry in `docs/DECISIONS.md`.
- `astro.config.mjs` `i18n` block once configured (only architect changes it).
- `.github/workflows/deploy.yml`. It assumes Astro at repo root. If a workspace stages a different structure, revert this file to main.
- Any URL that already serves. There is no per-path 301 on this host, so a moved path is a permanently broken path. Remove links, never addresses.

## Workspace caveat

The folder is named `V2/` but it IS the live site root. Don't be fooled by the name. `V3/`, `V4/`, `V5/` are historical or planning material; only `V2/` deploys.

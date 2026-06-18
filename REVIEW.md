# REVIEW.md

**PR:** #13 (`notes/when-the-assistant-sleeps-20260603`) on `tomscholtes93-collab/tomscholtes93-collab.github.io`
**Reviewer:** Reviewer-Deployer persona
**Date:** 2026-06-04
**Scope:** 4 new locale files for "When the assistant sleeps" follow-up note.

## VERDICT: PASS

PR #13 adds 4 locale files for the follow-up note "When the assistant sleeps". Frontmatter is schema-valid, voice register matches the established reference notes, translations preserve section structure, build gates are green (em-dash, leakage, key-parity, schema), all 4 locale pages emit. No required edits. NoteLink inline pass yields zero placements because no file in scope contains a natural mention of memory-consolidation; per NOTES_GUIDE rule "Skip if no natural mention exists. Do NOT force a mention to justify a link", this is correct behaviour. One optional, low-confidence future-work suggestion noted at the end.

Per orchestrator instruction, no push / no merge. Orchestrating session reads diff and acts.

## A. Voice findings (EN)

- Opens with concrete callback to the prior note ("Two weeks ago I wrote..."), which is exactly the follow-up move `the-remembering-assistant` set up. Reads as continuation, not as standalone marketing.
- Honesty audit is explicit and structurally mirrors the prior note. Three bold-headed sections "What it can do / What it cannot do / What can be undone". Lines up with the "What is built / What is not built" pattern in `the-remembering-assistant.md`.
- "The assistant did not get smarter. It got a sleep cycle." is the strongest first-person line in the piece, anti-marketing as intended. Same register as "I am not trying to ship a Jarvis." in the prior note.
- The cognitive-science detour (hippocampal-to-neocortical) is one paragraph, anchored to a constraint argument ("working memory is small, the world is large"). Does not drift into pop-neuroscience. Reads as principled, not as showing-off.
- No sentences read as landing-page copy. No verbs like "supercharge", "unlock", "revolutionise". No second-person addressing the reader as a product user.
- No em-dash (U+2014) anywhere across the 4 locale files. `grep -rP $'\xe2\x80\x94'` returns nothing.
- Leakage grep across the 4 locale files for the full NOTES_GUIDE leakage list (daughter first name, ex-partner first name, employer firm name, three client-system names, five colleague first names, one proprietary architecture term) using word boundaries returns zero matches.
- Frontmatter clean. `tags: ["memory", "automation", "ai-tooling"]` is exactly 3, lowercase kebab-case. `kind: memory` is a valid schema enum. `publishDate: 2026-06-03` matches today (note authored yesterday, reviewed today; within norm).
- `related: ["the-remembering-assistant", "self-hosted-rag-claude-max"]` is consistent with the back-references those two notes already carry. No circular weirdness.

## B. Translation findings

Section structure across all four locales is identical. Opening callback paragraph, the "the rule still holds, the actor changed" pivot, the sleep-cycle mechanics paragraph, the cognitive-science framing paragraph, the three bold-headed honesty sections (can do / cannot do / can be undone), the framing closer, the "previous note called it forget/keep" closing. No section in EN is missing in DE / FR / RU. No locale introduces extra paragraphs.

### DE

- "Sleep-Time-Konsolidierung" used for the named pattern, "hippocampal-neokortikale Konsolidierung" for the cognitive-science reference. Both are the correct German technical terms.
- "Konsolidierer" used for the actor. Consistent.
- Tags localised to `["gedächtnis", "automatisierung", "ai-tooling"]`. Note that the canonical EN note uses `["memory", "automation", "ai-tooling"]`. Schema does not require tag-key parity across locales, but DE-side tag clouds would group differently than EN. Same observation applies to RU below. Not a defect; informational only.
- Sources labels translated, `kind: memory` kept literal per schema. Good.
- Register: matches the rest of the DE site (essayistic first person, not Sie-form). The `i18n.md` Sie-form rule covers UI strings; notes are first-person reflective content. No issue.
- "Was rückgängig gemacht werden kann" for "What can be undone" reads natural.

### FR

- "consolidation pendant le sommeil" for the named pattern. "consolidation hippocampo-néocorticale" for the biological reference. Both correct French technical terms.
- "consolidateur" for the actor. Good.
- "garde-fous" for "gates" is the right metaphor (used in French technical writing for safety conditions).
- Tags localised to `["mémoire", "automatisation", "ai-tooling"]`. Same observation as DE re tag parity, same non-issue conclusion.
- Vouvoiement not relevant (first-person reflection).
- Closing line "Les cas difficiles, je les vois toujours." uses the same dislocated structure as the EN ("The hard ones, I still see."). Carries the same rhythm. Good translation choice.

### RU

- "sleep-time consolidation" kept literal in the named-pattern sentence with explanatory Russian context, then "гиппокампально-неокортикальной консолидацией" for the cognitive-science term. Reasonable: the named research pattern stays English-recognisable, the broader concept gets the established Russian term.
- "консолидатор" for the actor. Standard.
- "гейты" used for "gates" (transliteration). Modern Russian technical register and matches how the author uses the word in personal prose. Acceptable. Alternative "ограничители" or "пороги" would be more native but more academic; the current choice fits the established voice.
- Tags `["память", "automation", "ai-tooling"]`. Mixed RU + EN. Same parity observation as DE / FR. Not a defect.
- Closing line "Сложные я по-прежнему вижу сам." reads natural and carries the same anti-marketing weight as EN.

No ambiguous technical concepts found in any locale.

## C. NoteLink proposals

NOTES_GUIDE rule: walk `Now.astro`, `src/pages/index.astro`, `src/pages/projects/**/*.astro` (plus locale equivalents under `de/`, `fr/`, `ru/`), find natural mentions of "sleep-time consolidation", "nightly consolidation", "memory consolidation", "consolidator", "overnight consolidation". Wrap first natural occurrence per page only. Skip if no natural mention.

Grep result across the full scope (case-insensitive over `consolidat|sleep-time|nightly|overnight|consolidator|Konsolidi|консолидац`):

| File | Line | Hit | Verdict |
|---|---|---|---|
| `src/pages/projects/exocortex/index.astro` | 192 | `<dd>English, German, Russian, French, used live; legal and tax corpus ingesting overnight in each.</dd>` | NOT a consolidation mention. "Overnight" here refers to OpenKB corpus ingest, a different pipeline. Skip. |
| `src/pages/projects/exocortex/index.astro` | 194 | `<dd>POV video capture from the lenses into a passive memory loop; a calendar-aware morning briefing pipeline...</dd>` | NOT a consolidation mention. "Memory loop" here is the POV-capture pipeline, not the consolidator. Skip. |
| `src/pages/ru/projects/devswarm/index.astro` | 48 | `Финальное состояние, которое я хотел: у вас есть идея поздно ночью, вы говорите её один раз и просыпаетесь к pull request...` | NOT a consolidation mention. Night here is the DevSwarm "ship overnight" metaphor, unrelated to memory consolidation. Skip. |
| `src/components/Now.astro` | n/a | No mention of memory consolidation in any form. Strings flow through `t()` keys; the keys themselves were grepped separately. | Skip. |
| `src/pages/index.astro` | n/a | Composes components only. All prose lives in `src/i18n/*.json`; grep over those JSONs for `consolidat\|sleep\|nightly\|overnight\|consolidator\|memory` returns only two hits, both unrelated (an error-page line about typing from memory, and the notes-index meta-description listing "memory" as a topic). Neither is a natural inline wrap point. Skip. |
| `src/pages/projects/devswarm/index.astro`, `devswarm-cv/index.astro`, `projects/index.astro` | n/a | No mention. | Skip. |
| Locale equivalents under `de/`, `fr/`, `ru/` for the above | n/a | No mention beyond the RU devswarm line 48 already addressed (not the concept). | Skip. |

### Verdict on NoteLink pass

**Zero forced placements.** No file in the NoteLink scope currently contains a natural mention of memory-consolidation that would justify a `<NoteLink slug="when-the-assistant-sleeps">` wrap. Per NOTES_GUIDE rule "Skip if no natural mention exists. Do NOT force a mention to justify a link.", this note ships with zero inline placements.

This is consistent with the V4 baseline noted in NOTES_GUIDE ("4 notes, 3 inline placements total across 3 existing pages. Two of four notes had zero inline placements."). The site simply does not yet describe the sleep-time consolidation pipeline anywhere outside the new note itself. Direction is correct: the note exists, and when future copy mentions the consolidation pipeline (e.g. a new Now-line or an Exocortex stack-row), that future copy can wrap to this slug.

### Optional, low-confidence future-work note

If Tom wants at least one inline placement at some point, the closest natural extension point is the Exocortex stack section. A new `<dt>/<dd>` row could be added to `src/pages/projects/exocortex/index.astro` (and the 3 locale equivalents) describing the sleep-time consolidation pipeline as a stack component, then wrapped. That is an authoring change to existing pages, not a NoteLink change, so it falls outside the scope of this review. Flagging it for future work, not proposing it now.

## D. Build output summary

Command: `npm run build` from `/home/sofia/Projects/Personal_Website/V2`. Exit code 0.

Build chain output (head):

```
> tomscholtes-v3@3.0.0 build
> node scripts/check-i18n.mjs && node scripts/check-notes.mjs && node scripts/copy-fonts.mjs && node scripts/make-og.mjs && astro build && node scripts/post-build.mjs

✓ check-i18n: 200 keys × 4 locales, key-parity + placeholders + em-dash + leakage all clean
✓ check-notes passed: 20 notes checked, 0 issues
fonts: instrument-serif-regular.woff2
... (10 woff2 files total)
og: default.png
```

Build chain summary:
1. `check-i18n`: 200 keys × 4 locales. Key-parity, placeholders, em-dash, leakage all clean.
2. `check-notes`: 20 notes checked (5 per locale × 4 locales), 0 issues.
3. `copy-fonts`: 10 woff2 files copied.
4. `make-og`: default.png generated.
5. `astro build`: 52 pages built in 2.66s. All 4 new pages present:
   - `/notes/when-the-assistant-sleeps/index.html`
   - `/de/notes/when-the-assistant-sleeps/index.html`
   - `/fr/notes/when-the-assistant-sleeps/index.html`
   - `/ru/notes/when-the-assistant-sleeps/index.html`
6. `post-build`: `mirror: thesis.html` (existing behaviour, unchanged).

Build tail confirms `52 page(s) built in 2.66s` and `[build] Complete!`. No new warnings. Vite chunk sizes match the V4 baseline (no client JS budget regression).

## E. CI snapshot

Command: `gh pr checks 13 --repo tomscholtes93-collab/tomscholtes93-collab.github.io`
Result: `no checks reported on the 'notes/when-the-assistant-sleeps-20260603' branch` (exit 1).

This matches the project pattern: there are no PR-level CI checks. The GitHub Pages deploy workflow runs on push to `main`, after merge, not on the PR branch.

PR view (`gh pr view 13 --json state,mergeable,statusCheckRollup,headRefName,baseRefName,title`):
- `state: OPEN`
- `mergeable: MERGEABLE`
- `statusCheckRollup: []`
- `headRefName: notes/when-the-assistant-sleeps-20260603`
- `baseRefName: main`
- `title: feat(notes): when-the-assistant-sleeps in 4 locales`

Branch is ready for the orchestrating session to read the diff and merge.

## Summary table

| Gate | Status |
|---|---|
| Frontmatter schema (Zod, all 4 locales) | PASS |
| Em-dash grep across 4 new locale files | PASS (0 hits) |
| Leakage grep across 4 new locale files | PASS (0 hits) |
| Voice register vs `the-remembering-assistant` and `self-hosted-rag-claude-max` | PASS |
| Honesty audit present (3 bold-headed gates section) | PASS |
| Translation section parity across DE / FR / RU | PASS |
| `npm run build` exit 0 | PASS |
| 4 new locale pages emitted in `dist/` | PASS |
| `check-i18n` line | PASS (200 keys × 4 locales clean) |
| `check-notes` line | PASS (20 notes, 0 issues) |
| NoteLink inline placements (zero forced) | PASS (per "skip if no natural mention" rule) |
| PR mergeable | YES |

End of review. No push performed. Orchestrating session reads diff and merges.

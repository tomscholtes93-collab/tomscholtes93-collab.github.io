# Decision record

The standing decisions that govern this site's design, schema and publication
rules. One entry per decision, dated, with the reason and the revert handle.

A decision here outranks any planning document, prototype, jury result or
external skill file. If a document elsewhere contradicts an entry below, the
entry below wins and the other document is stale.

Zero em-dash (U+2014) in this file, per the site's own gate.

---

## 2026-08-01. Adopted: the type-led reading direction for `/notes/`

**Status: applied.** The blog makeover ships as a typographic pass on the notes
surface, not as a repaint of the homepage.

What it changes: reading size moves from the UI step to the lead step, the
measure is declared in characters rather than pixels, the Cyrillic display
voice becomes a matched sans instead of an accidental system serif, the
author's paragraph-initial bold lead-ins become a styled run-in head, the
paragraph interval becomes exactly one line box, and the accent system is fixed
at the precedence level and given per-theme values.

What it does not change: the homepage, the CV, the footer, `pages.css`, the
spacing ramp, and every type step except `--step-1`, whose cap moves 19px to
19.5px. Loading the homepage after this change shows today's homepage with a
slightly darker terracotta.

**One taste call was made and it is separable.** The default light-theme accent
moves from `#C4623A` to `#AE5230`. The mechanical half of that change (resolve
accents from a `[data-theme][data-accent]` matrix in CSS instead of an inline
style) is a defect repair and is not a matter of taste: the inline style beat
the attribute selector, so eight of the fifteen reachable theme-and-accent
combinations rendered below AA, the worst at 1.03:1. The new hex value is a
separate question, and the shipped colour was the one that was chosen
deliberately. It is darkened here because the shipped value computes 3.65:1 as
body-link text against a 4.5:1 requirement. **To keep the original colour and
still keep the repair,** set the `[data-theme="light"][data-accent="terracotta"]`
row in `tokens.css` back to `#C4623A` / `#8A3F1E`. Nothing else has to move.

---

## 2026-08-01. Retired: the 2026-06-06 homepage competition winner

**Status: retired on the record. Not to be revived without a fresh decision.**

The 2026-06-06 competition ran ten builders, a two-stage jury and produced a
unanimous winner (`builder-01-v2`, aggregate 8.53 of 10). **It was never
deployed.** A different homepage shipped on 2026-06-22 and superseded it, and
that layer was itself deleted on 2026-07-22 in the privacy cut.

It is retired for a concrete reason rather than by neglect: its type system was
Archivo, Newsreader and Space Mono, and **none of those three faces exists in
`public/fonts/` or under `node_modules/@fontsource/`.** Reviving it means a font
migration against an LCP budget that is already the least comfortable number in
the site's audit. Its recommendation to "lift the design tokens out of the
homepage into a shared layer" was never executed and carries no authority over
`tokens.css`.

What survives from it, and is worth keeping: the brief (a cold reader grasping
the value in ten seconds, without misreading the page as a job hunt), and the
requirement that content is fully present without scripts. The second one is
the reason `html.js .reveal` shipped in this series.

---

## 2026-08-01. Pinned: the only design and schema truth

**`src/styles/tokens.css` is the only source of design tokens.** Colour, type
step, spacing, motion and reading tokens are declared there and nowhere else.
No component, page or skill file may declare a competing palette or type ladder.

**`src/content/notes/config.ts` is the only schema for notes.** Frontmatter
fields exist because the Zod schema declares them. A field that is not in the
schema is not a field.

Corollary, learned the expensive way: **when two mechanisms express the same
intent, one of them wins silently.** An inline style against an attribute
selector, a `section` element rule against a class rule, a head script against a
React island, a `.prose h2` element rule against an `.eyebrow` class. Six of the
twelve defects found in the 2026-08-01 audit share exactly that shape. Prefer
one mechanism. When a second one is unavoidable, make the precedence explicit
rather than leaving it to source order.

---

## 2026-08-01. Quarantined: documents that must not seed design or content work

These files exist, are out of date, and are **not** to be read as instructions
for this repo. They are not deleted, because they are the record of what was
once true. They are simply not authoritative.

| document | why it is quarantined |
|---|---|
| `~/.claude/skills/tomscholtes-v3-design/SKILL.md` | Design-system skill last written 2026-06-06. It predates the shipped token file, the 2026-07-22 notes redesign and this series. Its tokens are not `tokens.css`. |
| `~/Projects/Personal_Website/V5/NOTES_GUIDE.md` | Notes authoring guide last written 2026-05-16. `scripts/check-notes.mjs` is the executable version of its rules and is the one that decides. |

`.claude/rules/astro-site.md` was **repaired rather than quarantined**, because
unlike the two above it ships inside this checkout and any agent working here
reads it. It stated that body prose is justified with `hyphens: auto`; the code
retired justification on 2026-06-23 and is left-aligned with `hyphens: manual`.
It also listed a five-step build chain and omitted `check-i18n`, which
`package.json` runs first.

---

## 2026-08-01. Publication rule: machine-authored notes are disclosed, and are not auto-published

**Binding.** A note whose text was produced by a model, in whole or in
substantial part, must carry a provenance line as its **first body line**,
translated into every locale it publishes in. The convention already exists in
this repo: `src/content/notes/*/the-cave-inside-the-cave.md` carries one at line
19 in all four locales.

The notes schema has no `author` field, so a note publishes as the site owner's
first-person text by default. Silence is therefore not neutral: it ships an
undisclosed byline. The disclosure line is the specification, not a courtesy.

**Machine-authored notes ship `status: draft`.** A draft emits no route at all
(`getStaticPaths` filters on `status === 'published'`), so nothing reaches a
public URL until a human flips the field. The flip is the review step; the
schema is what makes it free.

This is why the eighth note in this series shipped as a draft rather than
published, against the sequencing plan that called for same-day publication.

---

## 2026-08-01. Not built: a `urls.lock` deploy gate

**Declined for this series, with a reason rather than a deferral.**

The proposal was a committed lockfile of every published path, with the build
exiting 1 when a locked path vanishes. Three things killed it:

1. **It guards nothing this series does.** The subtraction is unlink-only. The
   net path delta at page granularity is zero: the CV section and the case
   studies own no routes, the case pages and the automation page are static
   passthrough under `public/`, and the locale homepages are re-exports.
2. **Its seed was never specified**, and the candidate seeds disagree. The
   public archive record returns 117 paths, all of them from a 2018 to 2019
   site that previously occupied the domain and none of them current, which
   would exit 1 on the first run and permanently. A `dist` walk locks 23
   noindexed `/lab/` prototype routes plus three locale 404s. The built sitemap
   is the only clean seed at 62 paths.
3. **It cannot express the one operation this repo has already performed.** The
   2026-07-22 privacy cut deliberately retired four paths with no successor.
   A gate that cannot say "retired on purpose" is a gate that gets bypassed the
   first time it is right to bypass it, which trains the author to ignore it.

If it is ever built: seed from the production `sitemap.xml`, page paths only,
and ship the deliberate-retirement override in the same commit as the gate.

---

## 2026-08-01. The CV is demoted by address, not deleted

The CV was the only subtraction target with no URL of its own. It was a
homepage section (`#cv`) plus three locale mirrors, so "unlink but keep every
address alive" had nothing to keep alive for it, and the two available
implementations had opposite consequences.

**Resolved: give it a real route first.** `/cv/` plus the three locale
re-exports shipped **before** the homepage section was removed, so the act is a
demotion by address and is reversible by address. The honest CV outlives the
subtraction, and the demo artifact at
`/projects/cv-onepager-artifact.html` (placeholder employers, relabelled as
fiction on 2026-08-01) is not left as the only page on the site branded as a CV.

---

## 2026-08-01. Declined: adding `noindex` to the demoted collateral

**Declined on its merits, not deferred.** The earlier framing deferred it "until
the exit concludes"; that condition had already fired, which makes a deferral
that nothing ever reopens.

The reason to decline: the case studies and the automation page are being
**re-pointed as evidence** from the essays that cite them, so they are load
bearing for the surface that is being kept. Noindexing a page that an essay
cites as its source is incoherent. Separately, every one of those URLs may be
circulating, and this host serves no per-path 301, so a link that stops
resolving stops resolving permanently.

The paired rule: **unlink only. No URL moves and no URL is removed.** Removing
a section from the homepage removes a link, never a path.

---

## 2026-08-01. The two OG accent literals are a declared exception to "tokens.css is the only source"

**Applied.** `src/lib/og.ts` and `scripts/make-og.mjs` build social preview
images outside the document, in node, where no custom property resolves. Both
therefore hold the accent as a literal, which is a real exception to the rule
that `tokens.css` is the only source of design tokens.

The exception was undeclared and had already drifted: both held `#C4623A`, the
pre-makeover light accent, while `make-og.mjs` painted its own subtitle
`#E37B4F` two rows below, so one card disagreed with itself. Both are now
`#E37B4F`, which is the value the site paints for that accent on a dark surface,
and both carry a comment naming the row they mirror.

Why the dark row and not `#AE5230`: these cards are `#0E0E0C`. The matching
token is `[data-theme="dark"][data-accent="terracotta"]`, 6.64:1 on that
background where the old literal was 4.74:1. `HeroLattice.astro` also holds the
old hex but reads `--accent` from computed style at runtime, so it self-heals
and was left alone.

Revert: set both literals back to `#C4623A`. The images regenerate on every
build, so nothing else has to move.

---

## 2026-08-01. The root URL is the publication, and /about/ exists so nothing loses an address

**Applied.** `/` renders a masthead and the essay feed and nothing else. This
closes critic finding 5, which stayed open through the previous series: the root
URL kept declaring itself a career site after the subtraction. Commit `140874d`
had claimed "Notes become the front door" while `src/pages/index.astro` still
rendered Hero, WorkflowAutomation, Now, Reading, Languages and Contact and
referenced the notes collection zero times.

`/about/` plus three locale mirrors was created one commit EARLIER, deliberately,
so that this change could not orphan anything. It renders Hero, Now, Reading,
Languages and Contact: the same components in the same order, unedited.
`/workflow-automation/` was not re-hosted because it already had its own
address. The CV is at `/cv/` and is now linked from Nav for the first time; it
had been reachable by URL only since it was created.

**The feed is duplicated across `/` and `/notes/`, and that is the decision.**
Both URLs now list the same seven essays from the same `NoteCard` component. The
alternatives were to delete `/notes/` or to noindex one of them. This host serves
no per-path 301, so deleting it breaks every inbound link and every essay's own
back-link; noindex was declined on its merits earlier in this series and
declining it for the homepage and then applying it here would be incoherent. The
mastheads differ (`home.masthead.*` against `notes.index.*`), so the two pages
read as a front door and an archive index rather than as one page served twice.
Revisit only if a feed grows past what one page should list.

The `Blog` node in `JsonLdPerson.astro` keeps its `@id` and `url` at `/notes/`.
That is where the publication was first published, an `@id` is meant to be
stable, and re-pointing it would churn the node for no gain.

Nine `href="/#contact"` links in the nine static `public/case/*` pages were
rewritten to `/about/#contact` in the same commit, because no `src/` edit can
reach those files and the fragment they pointed at moved. The remaining dead
`/#work`, `/#cv`, `/#now` and `/#reading` fragments in the built output are all
inside `/lab/`, which is noindexed, excluded from the sitemap, and made of
self-contained prototypes with their own hardcoded link arrays. Not touched.

Revert: `git revert` the commit. `/about/` survives it and keeps serving, which
is the point of having shipped the route first.

Masthead copy is assembled from strings that already shipped, not written fresh:
`home.hero.lead` supplies the identity sentence, the six-years clause and the
three-part list, and `meta.home.description` supplies the subject noun phrase.
Each locale's version is lifted clause-for-clause from that locale's own already
translated `home.hero.lead`, so no locale received a paraphrase of the English.

---

## Standing: the build is the review

There is no human review step between a push to `main` and production. The
gates are `scripts/check-i18n.mjs` and `scripts/check-notes.mjs`, both exit 1,
and the full chain is:

```
check-i18n -> check-notes -> copy-fonts -> make-og -> astro build -> post-build
```

`npm run build` must pass locally before any commit. Anything that cannot be
expressed as an exit-1 gate has to be expressed as a decision in this file.

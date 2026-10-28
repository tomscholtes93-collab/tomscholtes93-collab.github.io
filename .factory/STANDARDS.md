# STANDARDS

<!-- factory-standards: v1 -->

The canonical, written rules for this repository. Every producer follows them and the
build's Standards review axis treats a violation of any rule below as BLOCKING (a
Fowler-style smell that breaks no rule stays advisory). After the cold start the code
owns this file: change a rule with a reason worth an ADR, never silently.

Each rule is `- **S-NN** [tag] statement`. The tag is either `reviewer` (a person or
the review axis judges it) or `gate:<step>` (the quality gate step that enforces it
mechanically: format, lint, types, test, audit).

These standards implement `.factory/DESIGN.md` and ADRs 0001 and 0002. All existing
rule identifiers are retained. The 2026-10-28 intent and ADRs clarify source
acceptance, operational ownership, publication authority and the authorized Astro
security compatibility upgrade. They do not weaken preservation, independent review
or the audit requirement. S-40 is reviewer-enforced because test execution alone
cannot establish that every added behavior has an adequate regression test.

## Governance

- **S-01** [reviewer] Work only inside the ticket's declared Files scope; a change outside it is a defect.
- **S-02** [reviewer] Nothing is pushed, deployed, paid for or sent to an outside service by a ticket.
- **S-03** [reviewer] A decision that is hard to reverse is recorded as an ADR in docs/adr/ in the same change.
- **S-04** [reviewer] Preserve unrelated dirty files and the original V2 checkout; implement only in the assigned isolated worktree and never reset, clean or overwrite another owner's changes.
- **S-05** [reviewer] Keep site experience, report import and final publication separately gated; absent local report input or deployment credentials must not become dependencies of local site implementation or its review, and the recorded completed source handoff must not be misrepresented as unfinished research.
- **S-06** [reviewer] Required producer and integrated-candidate reviews use the existing Codex-only Factory route and explicit plan-scoped profiles in independent contexts; changed candidate bytes require refreshed affected evidence, and passing tests do not replace review.
- **S-07** [reviewer] The existing publication owner alone performs authorized external publication after verifying authenticated access and all release prerequisites; producer completion, dependency registration and workflow dispatch do not prove publication or delivery.
- **S-08** [reviewer] Preserve original verdicts, failures and evidence references; bind release evidence in the existing operational ledger to the integrated commit and tree, source hash, workflow run and actual public report URL, with the prior deployed commit and concrete safe revert instructions.
- **S-09** [reviewer] Keep F44 as execution and operational-state owner through the existing native/no-journal Factory lane, isolated ticket branches, tracked native milestone ledger and completion evidence; implement the publication handoff as a one-off procedure, without a new runner, release-readiness subsystem, operational receipt schema, credential machinery or dependence on F43 staging producer jobs.

S-02 governs outward publication and other product side effects. The installation
and audit registry requests required by the quality workflow are dependency
validation, not publication authority. They may transmit package metadata, never
report bodies, credentials or private job evidence. Deployment remains an operation
of the existing publication owner outside producer tickets.

## Layering and dependencies

- **S-10** [reviewer] Retain static Astro rendering; routes may compose shared presentation, content queries and report presentation, while report presentation may depend on shared presentation and content queries; lower layers must not import routes or publication-operation code.
- **S-11** [reviewer] Feeds and metadata read publication queries rather than page components; browser code must not import filesystem, process, research-job or deployment modules, and new reading features use semantic markup and progressive enhancement rather than new React islands.
- **S-12** [reviewer] Retain one notes schema and publication-query authority, seeded by `src/content/notes/config.ts` and `src/lib/notes.ts`; the authorized Astro compatibility work may relocate configuration or adapt APIs, but new or touched routes, discovery, feeds, metadata and comments must consume shared status, slug and locale decisions instead of creating independent rules.
- **S-13** [reviewer] The research owner alone supplies substantive report content and corrections; the one-off transformation may mutate the local copy only from the supported complete source with matching SHA-256 and accounted-for permitted transformations, while the existing publication owner references original terminal provenance and technical acceptance in the operational ledger rather than making the importer validate receipts.
- **S-14** [reviewer] Builds consume only local publication content and never fetch research job storage, approval receipts or mutable remote prose; missing import input leaves existing publications unchanged and creates no public substitute, while required checks must still fail if an already integrated report disappears.
- **S-15** [reviewer] Preserve existing note prose, published paths, paragraph addresses and stable unlocalized comment identity; only the content publication unit may change report status, slug or locale availability through the bounded import and authorized publication path, and the slug is immutable after first publication.
- **S-16** [reviewer] The site-experience unit owns shared shell and interface translations; `src/styles/tokens.css` remains the sole design-token authority, with only the existing documented generated-image exceptions, and report components consume these sources without competing palettes or type scales.
- **S-17** [reviewer] Only the existing display-preference subsystem writes persisted preferences and their root-state projection through restoration and user control events; components consume that state and must not add another storage key, root-attribute writer or conflicting inline token override.
- **S-18** [reviewer] The build pipeline alone regenerates pages, fonts, images, sitemap and feeds; do not hand-edit generated output, and do not make external comments or private operational evidence build-time content inputs.
- **S-19** [reviewer] Independent reviewers own their immutable verdicts, and the existing publication owner owns handoff, deployment and revert evidence; product code must neither consume those operational records nor manufacture, overwrite or reinterpret them as acceptance, and must not validate reviews, authentication, workflow identity or release stages.

## Naming

- **S-20** [reviewer] Names say what a thing is or does in this project's own vocabulary; no `util`, `helper` or `misc` modules and no single-letter names outside tiny scopes.
- **S-21** [reviewer] New Astro components and React components use PascalCase names, functions and values use descriptive camelCase names, and non-component module filenames use descriptive kebab-case; preserve existing public filenames and URLs rather than renaming them for style.
- **S-22** [reviewer] New interface text uses the existing locale dictionaries with matching keys and placeholders in EN/DE/FR/RU; preserve localized labels, Cyrillic support, stable English tag keys and positional tag alignment rather than deriving route identity from translated text.
- **S-23** [gate:format] Every selected added or modified supported source file passes the locked Prettier configuration, including the Astro plugin for `.astro` files; the format command fails on formatting differences, parse errors, missing tools or invalid scope selection.
- **S-24** [gate:lint] Every selected added or modified JavaScript, JSX, TypeScript, TSX and Astro source file passes the configured ESLint rules with zero warnings; the lint command fails on parse errors, ignored selected files, missing tools or invalid scope selection.
- **S-25** [gate:types] The configured Astro/TypeScript project passes `astro check` without errors, including Astro templates, typed component props, content schema consumers and imported TypeScript modules.
- **S-26** [reviewer] Report section IDs are unique and stable, contents links refer to those IDs, and presentation or translation changes do not renumber existing paragraph anchors or advertise nonexistent locale editions.

## Error handling

- **S-30** [reviewer] An error is handled at the layer that can act on it; never swallow an exception silently and never use a bare catch-all.
- **S-31** [reviewer] A failure at a system boundary returns a specific, documented error, never a stack trace or internal detail.
- **S-32** [reviewer] The handoff distinguishes missing input, invalid provenance receipt, hash mismatch, missing technical acceptance, incomplete source and unsafe content; the existing publication owner handles receipt and acceptance defects, while the transformation/check handles input and content defects, and each prevents the affected operation with an actionable correction rather than partial publication or invented replacement.
- **S-33** [reviewer] Expected storage or optional-enhancement failures restore usable defaults and leave navigation, prose, citations and static reply links operational; catch only at the responsible boundary and make the handled failure observable in tests.
- **S-34** [reviewer] Build, gate and verification failures return nonzero with the failing step and an actionable diagnostic; never convert missing tools, inaccessible evidence, malformed audit responses or browser startup failure into a pass.
- **S-35** [reviewer] Diagnostics and fallback UI must not expose report source bodies, private filesystem paths, credentials or operational receipts; unavailable comments or translations must have an honest usable fallback instead of a broken control.

S-32 assigns failures to existing owners. It does not authorize executable receipt,
review or credential validators. The recorded source technical acceptance and
publication authority are already supplied. No personal byte-approval is pending.

## Testing

- **S-40** [reviewer] Every behaviour a ticket adds has a test that fails without it.
- **S-41** [reviewer] Tests assert observable behaviour through the public interface, not private implementation.
- **S-42** [gate:test] The test step passes the complete existing `npm run build` chain, including i18n, notes and URL checks, followed by a nonempty automated test suite; a failed build, failed assertion, missing suite or failed preview startup returns nonzero.
- **S-43** [reviewer] Automated coverage exercises publication filtering, locale availability, stable identity and fragments, malformed or missing report input, preference failure and restoration, and menu behavior through rendered output or public module interfaces; synthetic fixtures remain outside public content and do not implement a release-readiness test system.
- **S-44** [reviewer] The report import adds checks against the actual supplied source and rendered report that account for complete substantive text, sections, citations and reading links; counts and headings alone are insufficient, and required imported-content checks may not silently skip because the report has disappeared.
- **S-45** [reviewer] Browser evidence covers widths 320, 390, 768 and 1440, representative routes across all four locales and every imported report edition, with keyboard/touch navigation, Escape dismissal, focus, fragments, back navigation, themes, densities, reduced motion, disabled JavaScript and failed enhancement.
- **S-46** [reviewer] Verify no unintended horizontal document overflow, invisible primary prose, unavailable local assets or unexpected first-party console errors; inspect the embedded CV before correcting its outer-document heading structure and verify canonical, alternate, RSS and comment behavior.
- **S-47** [reviewer] Tests use an owned loopback preview, bounded waits and cleanup of only their own processes; external publication, production writes and research-job access are not test setup.
- **S-48** [reviewer] Retain browser and quality evidence for the exact candidate, compare loading behavior under equivalent baseline conditions and document material regressions; screenshots, transfer counts or successful workflow execution alone do not prove acceptance.
- **S-49** [reviewer] Verify the deployed report body at its actual tomscholtes.com URL against reviewed output, including representative baseline, roadmap and fictional-story content, citations, assets and fragments; reject homepage fallbacks and wrong editions, while the publication owner separately binds deployment to the reviewed integrated commit and retains concrete revert, redeployment and renewed verification instructions.

## Security

- **S-50** [reviewer] No secret, token or credential appears in code, fixtures, logs or commits.
- **S-51** [reviewer] External input is validated at the boundary, and any query built from input uses bound parameters, never string concatenation.
- **S-52** [gate:audit] No dependency has a known high-severity vulnerability.
- **S-53** [reviewer] Preserve the original audit baseline and current full findings, distinguish development/build exposure from published static output without assuming either safe or exploitable, and independently assess changed dependencies and new findings; baseline comparison does not waive S-52.
- **S-54** [reviewer] Validate imported paths, frontmatter, rendered markup and link schemes; prevent path traversal and reads outside the supported export, preserve escaping at HTML/XML boundaries, and do not introduce scripts, event handlers or executable URLs through report content.
- **S-55** [reviewer] Preserve the 2026-07-22 privacy cut and existing content guards; private receipts, hashes of private operational bundles, hidden job paths and restricted material stay outside public source, assets, metadata, feeds and generated output.
- **S-56** [reviewer] Use only the technically accepted report substance and original Tom-branded presentation; do not copy reference-site assets or implementation, invent personal claims or statistics, restore the removed desktop layer, or author U+2014 characters.
- **S-57** [reviewer] Add no tracking, consent interaction, form service, external reading dependency or new browser origin solely for this redesign; retain self-hosted fonts and the existing comments configuration.
- **S-58** [reviewer] Do not suppress audit failures, omit development or optional dependencies to obtain a pass, run `npm audit fix --force`, or turn a targeted security correction into an unapproved framework migration; unresolved high or critical findings keep the gate failed.

S-52 retains the base zero-high-severity requirement. The audit threshold also rejects
critical findings. `.factory/AUDIT-BASELINE.md` records existing high and critical
findings, so the seed is not asserted to satisfy this rule.

Baseline comparison is diagnostic evidence for narrow remediation, not an exception
mechanism. The later INTENT decisions and ADR 0001 authorize the same-framework
security compatibility upgrade needed to satisfy this standard. They supersede any
interpretation of earlier baseline commentary that permits unresolved high or
critical findings to become a green release.

If authorized compatible remediation cannot satisfy the standard, preserve the
failure and resolve the remaining policy or architecture decision through the
existing reviewed ADR or plan-amendment process.

## Allowed dependencies

- **S-60** [reviewer] Only dependencies named in DESIGN.md's stack decision may be added; a new runtime dependency needs an ADR first.
- **S-61** [reviewer] Resolve the design's expressly deferred development tooling with Prettier, `prettier-plugin-astro`, ESLint, `@eslint/js`, `globals`, `eslint-plugin-astro`, `typescript-eslint`, `@astrojs/check`, TypeScript and `@playwright/test`; use Node's built-in test runner and add no browser runtime dependency for the quality workflow.
- **S-62** [reviewer] Lock exact resolved tool versions in `package-lock.json`, verify their engine and peer compatibility with the selected Astro stack and execution/deployment runtimes, and use project-local tools without global installation or opportunistic downloads during checks.
- **S-63** [reviewer] Retain existing runtime dependencies and integrations unless a narrowly scoped, reviewed correction requires a change; version discovery is not permission for an incidental major upgrade.
- **S-64** [reviewer] Apply only the security compatibility upgrade authorized by INTENT and ADR 0001, beginning with the recorded Astro 7.4.1 target and choosing minimum compatible patched integrations and declarations from verified primary metadata and actual audit/build evidence; use the supplied job-local Node.js 24.22.1 and npm 11.19.1, preserve global defaults, and verify collection identity, paragraph transforms, inline whitespace, prose, URLs, fonts and preferences after the change.

The tooling list resolves the delegation in DESIGN section 5. It does not authorize
another runtime stack. Configure Prettier with its Astro plugin and configure
ESLint to parse Astro templates and their TypeScript frontmatter.

Collection configuration locations and query/render APIs may change when required
by the authorized upgrade. Their logical authority and preserved public behavior
remain binding. Observed latest versions in DESIGN are reference evidence, not
instructions to update every package.

## Quality gate

The integration command is `bash scripts/quality-gate.sh`. The implementation stage
must supply the wrapper, bounded format/lint adapters, configurations and test
scripts. Their absence in the seed is work for the walking skeleton, not permission
to substitute the previous build-only integration command.

```text
format: node scripts/check-format.mjs
lint: node scripts/check-lint.mjs
types: npx --no-install astro check
test: npm run build && npm test --silent
audit: npm audit --audit-level=high --include=dev --include=optional --include=peer
```

- **S-70** [reviewer] `scripts/quality-gate.sh` runs these five commands from the repository root in the stated order, stops at the first failure, propagates its exit status and never performs deployment, source rewriting, dependency installation or automatic baseline updates.
- **S-71** [reviewer] Format and lint adapters select relevant added or modified first-party files against fixed baseline `e635f7b4cbe195e6dcfc42a3b517cfcdd3ba9917`, including committed changes, staged and unstaged changes and relevant nonignored untracked files; a missing baseline or failed enumeration is an error, and a moving branch tip must not replace that baseline.
- **S-72** [reviewer] Format/lint scope includes supported application files under `src/`, quality/build sources under `scripts/`, tracked tests under `test/`, changed authored documentation under `docs/`, changed authored text assets under `public/` and relevant root package/tool configuration; exclude dependency trees, generated output, unchanged legacy files and operational Factory evidence, and never exclude a changed application file merely because it fails.
- **S-73** [reviewer] The format adapter invokes the locked local Prettier checker without write mode, explicitly enables `prettier-plugin-astro`, reports its selected files and rejects unsupported selection or unexpected ignores; the lint adapter invokes locked local ESLint with `--max-warnings=0`, explicit Astro/TS/JS/JSX coverage and the same fail-closed selection behavior.
- **S-74** [reviewer] Scope adapters pass filenames as argument arrays with safe option boundaries, handle deletions and renames without silently dropping new paths, and test selection failures and ignored-file bypasses; an empty supported-file set is reported honestly and does not skip types, tests or audit.
- **S-75** [reviewer] Type configuration retains the strict Astro foundation and includes generated Astro declarations and relevant source imports; do not replace `astro check` with `tsc` alone or add broad ignores, unchecked casts or disabled diagnostics solely to make the gate pass.
- **S-76** [reviewer] `npm test --silent` runs tracked Node tests and Playwright tests with deterministic exit propagation and explicit nonempty suite checks; use `test/` so the seed's blanket `tests/` ignore does not silently omit acceptance tests from commits.
- **S-77** [reviewer] Quality evidence identifies candidate commit/tree, runtime/tool versions, selected formatting/linting scope and each executed result; incomplete report integration or unavailable required comparison evidence is recorded as an unmet publication condition, never successful report acceptance or an invented need for new personal approval.
- **S-78** [reviewer] Keep executable publication-specific checks limited to bounded source transformation, source/render fidelity and read-only live-content verification; accept the supported export and expected hash directly, compare complete report substance with accounted-for permitted transformations, and do not require operational receipts, review schemas, authentication records, workflow identity or release stages as checker or importer inputs.

Astro-aware checking covers templates that ordinary TypeScript checking omits.
The build does not replace that check. The audit threshold controls command failure
without hiding lower-severity findings. All five steps apply to this stack.

Source/render comparison and live-content results are technical evidence. The
existing publication owner references them alongside original review verdicts and
deployment records in the operational ledger. No quality or content script becomes
an additional acceptance authority.

The supplied source's provenance, independent technical acceptance and Tom's
publication authority remain distinct. Import explicitly as draft. The existing
publication owner may prepare the published state on an isolated unpublished branch
under that authority so technical reviews cover the exact intended publication.
Preserve first-body-line machine-authorship disclosure and complete all required
reviews and checks before external deployment. Do not require another personal
status flip or claim that Tom personally reviewed the bytes.

## Pitfalls

Lessons from finished runs, appended by `factory retro`. Not normative.

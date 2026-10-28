# SPEC: Tom Scholtes editorial experience and G183 publication

## Problem Statement

The existing site needs clearer reading pathways, navigation and editorial hierarchy while preserving its notes-first purpose, four locales and published addresses. Publicly observed Vortx patterns provide useful references for section labels, sequencing, modular layouts and primary reading actions. They do not justify copying its identity, assets, implementation or animation-dependent presentation.

G183 must become a complete reading document containing the research owner's sourced October 2026 baseline, granular sector roadmap through 2046 and substantial imagined future story. Readers must be able to distinguish facts, assumptions and fiction and follow the report's citations and reading links.

INTENT records a completed 80,088-byte research-owner handoff and independent technical acceptance of the exact source. Tom has already authorized publication under option A. These are separate facts. Neither source provenance nor publication authority establishes technical acceptance of the transformed, integrated website, and neither requires another personal review of the bytes.

Publication requires independent producer and integrated-candidate reviews, browser evidence, authenticated deployment and verification of the actual report URL on tomscholtes.com. Those responsibilities belong to the existing Factory lane and publication owner. This project must not create another release-readiness subsystem.

The recorded browser baseline identifies horizontal overflow at 320px, a mobile menu that does not close with Escape, and no outer-document h1 on `/cv/`. The dependency baseline records unresolved vulnerabilities. These observations identify work to perform; they do not establish acceptance of changed code.

## Solution

Improve the existing static Astro publication through shared components, tokens, semantic HTML and native CSS. Keep Instrument Serif, Inter and JetBrains Mono self-hosted. Retain existing React islands and display controls. Implement new reading navigation with native links and, where useful, `details` and `summary`.

Maintain three separately gated work stages:

1. Establish the quality checks, perform the authorized security compatibility work and improve the site experience using existing content.
2. Transform the supplied report into local publication content, preserve its complete substance and verify its rendered representation.
3. Have the existing publication owner deploy the reviewed integrated candidate through the established GitHub Pages workflow and verify the live report.

Site-experience implementation and local review remain independently launchable. The report handoff and source technical acceptance are already supplied. A missing or mismatched local export is an access or integrity defect to resolve through the supported handoff, not a reason to restart research or await another personal approval. Deployment credentials remain a separate external prerequisite.

The selected architecture follows `.factory/DESIGN.md` and ADRs 0001 and 0002. Existing token, content, publication identity and privacy decisions in `docs/DECISIONS.md` remain applicable except where INTENT explicitly supersedes them. Required independent technical reviews supersede the older build-only review statement. Existing publication authority permits preparation of this report's published state without another personal status flip.

## User Stories

- As a new reader, I can understand the publication and reach notes, topics, archive, projects, About, CV, thesis and contact through clear reading pathways.
- As a returning reader, I can open existing URLs, paragraph links and RSS feeds without losing content or discussion identity.
- As a keyboard or mobile reader, I can navigate, dismiss menus, follow contents links and read without horizontal page overflow or hidden focus.
- As a reader using reduced motion or disabled JavaScript, I can still access navigation, prose, citations and fragment targets.
- As a reader using another locale or display preference, I receive consistent typography and controls and am shown only report editions that actually exist.
- As a G183 reader, I can read the complete report, distinguish evidence categories and follow sources and further reading.
- As the research owner, I retain authority over substantive report content and corrections, and the transformed publication can be compared with my supplied source.
- As the publication owner, I can use existing operational records to identify the reviewed and deployed candidate, verify the public result and revert the release using concrete instructions.

## Implementation Decisions

### Static architecture and ownership

Retain Astro static output, the existing repository, CNAME, Node.js/npm toolchain and `.github/workflows/deploy.yml`. Use the supplied job-local Node.js 24.22.1 and npm 11.19.1 without changing global defaults. The existing deployment workflow selects Node.js 24.

The architecture invariants are:

- **INV-1 Static reading:** Primary navigation, published prose, citations and fragment targets remain usable without client initialization or scroll-triggered revelation.
- **INV-2 Shared appearance state:** Shared tokens and the existing display-preference subsystem exclusively own site-wide appearance state.
- **INV-3 One publication identity:** Routes, discovery, feeds, metadata and comments derive publication status, stable unlocalized slug and actual locale availability from one content authority.
- **INV-4 Source authority:** G183 substance comes exclusively from the supplied research-owner report, with permitted presentation transformations accounted for against that source.
- **INV-5 Operational ownership:** Existing operational owners bind reviews, candidate identity, authentication and deployment evidence. Product code consumes neither those records nor a new release-readiness contract.

Routes compose shared presentation and content queries. Report presentation consumes those same sources. Feeds and metadata consume publication queries rather than page components. Shared components, content queries and content schemas do not import routes or publication-operation code. Browser code does not import filesystem, process, research-job or deployment modules.

Start with the existing notes collection, schema and `src/lib/notes.ts` queries. The authorized Astro upgrade may relocate collection configuration and adapt query or rendering APIs. Preserve the logical schema authority, collection identity and public behavior rather than freezing obsolete file locations. Consolidate touched consumers where needed to keep status, identity and locale availability consistent. Avoid unrelated refactoring.

The research owner owns original report substance and corrections. The existing content publication unit owns local bodies, status, slug and editions. The one-off transformation/check derives source-to-render correspondence. The site-experience unit owns shared shell and interface translations. The existing preference subsystem owns persisted preferences and root-state updates. The build owns generated pages, fonts, images, sitemap and feeds. Independent reviewers own verdicts. The existing publication owner owns handoff, deployment and revert evidence.

### Experience and preservation

Keep the publication masthead and notes as the front door. Apply the section labels, action hierarchy, modular cards and useful sequencing recorded in `.factory/REFERENCE-ANALYSIS.md` through original Tom-branded composition.

Keep existing content and URLs, EN/DE/FR/RU, RSS, comments configuration, reply links, theme and density controls, contact destinations and the 2026-07-22 privacy cut. Preserve reading typography and Cyrillic support. Report components consume existing tokens and preferences instead of introducing another palette, type scale or storage key.

Keep primary prose visible without scroll-triggered revelation. A contents disclosure may collapse navigation on narrow screens; it must not conceal successive parts of the report body. Evidence categories require explicit text labels as well as any visual distinction.

Inspect the embedded CV before correcting the outer page's heading and landmark semantics. Fix the recorded 320px overflow and Escape dismissal defect. Preserve the baseline's working focus behavior, readable no-JavaScript content and reduced-motion behavior. `/tags/` is the actual tags route.

### Supplied report and bounded transformation

The candidate input is the completed 80,088-byte report recorded in INTENT, with SHA-256:

```text
8ac43988f501241c62002f6206f04c04d794e9a7cb888406345a18b99bf23d22
```

The existing publication owner references three distinct facts in the operational ledger:

- Research-owner provenance, including the completed handoff, original source ledger `DONE` and `source_scope_complete=true`.
- Independent technical acceptance of the exact source's scope and public-copy suitability, including its bounded primary-source spot checks and recorded limitations.
- Tom's existing publication authority under option A, without claiming he personally reviewed the report bytes.

The importer receives the supported local export and expected hash. It does not receive or validate a new release contract, review schema, credential record or release-stage state. Neither importer nor build accesses hidden sibling-job storage.

The accepted presentation transformations are heading normalization, contents and reading aids, accurate AI-authorship disclosure, metadata and removal of the opening direct address to Tom. Preserve every substantive section, citation, reading link and the entire story. Substantive corrections remain with the research owner. Source revisions or transformations outside the accepted scope require refreshed affected technical evidence, without introducing another personal byte-approval gate.

A small rerunnable transformation/check verifies input integrity and compares source sections, complete substantive text, citations and reading links with imported and rendered output. Account explicitly for the October 2026 baseline, granular sector roadmap through 2046 and substantial imagined future story. Counts and headings alone cannot prove completeness.

Missing input, mismatched bytes, unsafe markup or unexplained content loss fail the affected operation without altering existing publications. A missing local export does not become a public placeholder or replacement report. Source comparison uses the explicitly supplied export; ordinary builds consume local publication content and do not fetch operational evidence or remote prose.

### Publication identity and candidate preparation

Import explicitly as `status: draft`, because the seed schema defaults to published. Preserve the applicable machine-authorship disclosure as the first body line in every published edition.

Under Tom's existing authority, the publication owner may prepare `status: published` on an isolated, unpublished candidate branch before the required website reviews. This lets producer and integrated-candidate reviews cover the exact intended publication bytes, including status. External deployment still waits for those reviews and all required checks. No production preview endpoint, extra release state machine or personal status-flip gate is needed.

Use the existing notes detail routes, adding only the rendering support needed by the report. Derive title, initial unlocalized slug and actual edition metadata from the supplied source. The slug becomes immutable at first publication. Do not fabricate translations.

Routes, discovery, feeds, sitemap, canonical/alternate metadata and comments must agree about publication status and actual editions. Both initial rendering and post-navigation client behavior must avoid nonexistent translated report pages. An unavailable edition offers an available edition or the selected locale's publication index.

Operational receipts and restricted evidence remain outside public content, metadata, assets and build output. Readers receive the complete report, citations and accurate authorship disclosure, without a new public provenance interface.

### Quality tooling and security compatibility

The frozen integration entry point is `bash scripts/quality-gate.sh`. The walking skeleton must supply the wrapper, bounded format/lint adapters, test command and required tool configuration. Its test step includes the complete existing `npm run build` chain.

Use Prettier with Astro support, ESLint with Astro and TypeScript support, `astro check`, Node's test runner and Playwright. Lock compatible tool versions. Formatting and linting cover relevant added or modified first-party files against the fixed project baseline. Astro-aware type checking and behavioral tests cover the relevant application graph. Do not rewrite untouched legacy source merely to normalize formatting.

S-52 remains binding. High and critical findings, including baseline findings, keep the audit failed. Preserve the original audit and current findings. Baseline comparison supports diagnosis; it does not waive the rule.

INTENT and ADR 0001 authorize a narrow same-framework security compatibility upgrade. Begin with the recorded Astro 7.4.1 remediation target and select the minimum compatible patched framework, integrations and declarations supported by verified primary metadata, actual audit results and production-build evidence. The versions observed in DESIGN are not blanket upgrade instructions. A same-major Astro 5 update cannot resolve the affected range recorded in INTENT.

Keep compatibility changes isolated and justified. Adapt removed collection APIs and the supported rendering path as needed, while preserving content identities, paragraph anchors, inline whitespace, prose, URLs, fonts and preferences. Do not suppress audit results or use `npm audit fix --force`. If the authorized remediation cannot satisfy the quality standard, retain the failed gate and resolve the remaining decision through the existing reviewed amendment process.

### One-off publication procedure

Implement the handoff as documentation and existing operational activity:

1. Reference the completed source receipt, source hash, original technical acceptance, accepted transformations and existing publication authority in the operational ledger. Supply only the local export and expected hash to the importer.
2. Import as draft, prepare the intended publication state on an isolated unpublished branch, and collect source-to-render evidence.
3. Record the integrated commit/tree, original independent producer and integrated-candidate verdicts, quality results and browser evidence. Refresh affected evidence after candidate changes while retaining original failures and actual attempts.
4. Before the external operation, verify existing authenticated repository write access, record the previously deployed commit and actual release commits, and deploy the reviewed candidate through the existing workflow. Record the real run, head commit and deployment result.
5. Verify the actual report URL against the reviewed rendered output and retain desktop/mobile evidence. Record concrete commit-specific revert commands, redeployment and renewed live verification, preserving unrelated later work.

Product scripts may check source/render fidelity and live content. They must not validate review schemas, adjudicate acceptance, inspect authentication, interpret workflow identity or maintain release stages. The existing publication owner and Factory lane perform those operational checks.

F44 remains the execution and operational-state owner. Implementation uses the existing native/no-journal Factory lane, isolated ticket branches, tracked native milestone ledger and completion evidence. Preserve the existing Codex-only route and plan-scoped profiles. Do not create a runner or rely on F43 staging new producer jobs.

Recorded GitHub credential failures remain an unresolved deployment prerequisite until the existing route is verified. They do not prevent local implementation or review and do not authorize replacement credentials or hosting.

## Testing Decisions

### Automated checks

The quality gate executes the five commands in STANDARDS in order and stops on failure. It must not install missing tools opportunistically, rewrite source or silently skip a required step.

Use Node tests for bounded content and quality-tool behavior, and Playwright for rendered behavior against an owned loopback preview. Tests inspect observable results through public interfaces.

Cover:

- Preview startup and successful requests for representative existing routes.
- Published versus draft routes, discovery, feeds and metadata.
- Stable unlocalized identity and actual locale availability on initial load and client navigation.
- Contents and paragraph fragments, canonical URLs, RSS escaping and preserved addresses.
- Missing or mismatched source input, malformed content, unsafe markup and unexplained source-to-render loss.
- Preference restoration, unavailable storage and failed optional enhancement.
- Menu lifecycle, Escape dismissal, focus and narrow-screen overflow.
- Format/lint scope selection, committed and working changes, relevant new files, ignored-file bypasses and tool failures.
- Compatibility-sensitive collection identity, paragraph transforms, inline whitespace, prose, fonts and static output after the authorized framework update.

Generic fixtures remain outside public content and never masquerade as G183 research. Do not build synthetic tests for review-record schemas, credential readiness or release stages.

The report import adds regression checks against the actual local report and its source-derived correspondence. Required report checks fail if imported content disappears or diverges. The rerunnable full source/render comparison receives the supported export explicitly and retains its evidence in the operational ledger. Ordinary builds do not fetch that export or operational records.

The walking skeleton can be tested before report integration. This independence does not permit final report acceptance without the complete comparison.

### Browser acceptance

Retain evidence at 320, 390, 768 and 1440 CSS pixels. Exercise representative routes across EN/DE/FR/RU, including home, notes, note detail, `/tags/`, archive, About, projects and CV. Include every imported report edition.

Check keyboard and touch navigation, visible focus, menu lifecycle, skip navigation, heading and landmark structure, long-title wrapping, direct fragments and browser back navigation. Exercise existing themes and densities, preference restoration, disabled JavaScript, reduced motion and failed optional enhancement.

Verify no unintended horizontal document overflow, hidden prose, unavailable local assets or unexpected first-party console errors. Check self-hosted fonts, Cyrillic text, citations, canonical and alternate metadata, feed inclusion and disabled or unavailable comments.

Compare loading behavior under equivalent baseline conditions and explain material regressions. Recorded request and transfer counts are observations, not performance scores or universal budgets.

### Independent acceptance and live verification

Retain independent reviews of producer changes and the exact integrated candidate through the existing Codex-only Factory route. Passing automated checks does not replace those reviews. Changed candidate bytes require refreshed affected evidence.

After deployment, perform narrowly scoped read-only verification of the actual HTTPS report URL on tomscholtes.com. Compare the report body with the reviewed rendered output and exercise representative baseline, roadmap and fictional-story passages, citations, assets and fragments on desktop and mobile. Reject homepage fallbacks, wrong editions and missing sections. HTTP 200 and workflow success alone do not establish publication.

The publication owner separately confirms that the recorded workflow and deployed head match the reviewed integrated commit. The live-content checker does not consume reviewer or credential records.

Record concrete revert commands using the actual release commits, required reverse order and previously deployed commit. Include redeployment through the existing workflow and renewed public verification. Reversion must preserve unrelated later work.

## Out of Scope

- Copying Vortx text, logos, illustrations, proprietary assets or source implementation.
- Security probing, restricted endpoints, reference-site forms or tracking-consent interaction. Required dependency auditing and local application validation remain in scope.
- Replacement hosting, services, schedulers, runners, supervisors, harvesters, notifiers or research jobs.
- Email publication, invented statistics, testimonials, employers or personal data.
- Restoring the removed desktop layer or private exocortex material.
- Replacing Astro with another framework, incidental dependency upgrades or global runtime changes. The authorized narrow Astro security compatibility upgrade remains in scope.
- Replacement preference storage, new interactive islands for reading or decorative motion, search, pagination or general report-management infrastructure.
- Generalized admission contracts, executable release-readiness systems, extra credential machinery, operational evidence validators or new public provenance interfaces.
- Another personal byte-approval or status-flip gate for the supplied report.
- Unrelated cleanup or changes to the original V2 checkout and its dirty files.
- Authored U+2014 characters.
- Claiming personal source review, technical acceptance, deployment or live delivery without corresponding evidence.

## Requirements

- **REQ-1** (objectives: site-experience, verified-publication) The walking skeleton builds the static site, runs a nonempty behavioral test suite, starts an owned loopback preview that serves an existing page successfully, and passes all five steps of `bash scripts/quality-gate.sh`; this works before report integration and without GitHub deployment credentials.
- **REQ-2** (objectives: site-experience, verified-publication) Implementation uses the isolated worktree based on `e635f7b4cbe195e6dcfc42a3b517cfcdd3ba9917`, preserves pre-existing unrelated changes and leaves the original V2 checkout untouched.
- **REQ-3** (objectives: site-experience, verified-publication) The candidate retains Astro static output, the existing repository, CNAME, complete build chain and GitHub Pages workflow, using the supplied job-local runtime and only the authorized compatibility changes.
- **REQ-4** (objectives: site-experience) The front door remains a publication with a clear masthead, readable notes and working paths to notes, tags, archive, About, projects, CV, thesis and existing contact destinations, using original composition informed by the retained reference analysis.
- **REQ-5** (objectives: site-experience) Shared presentation retains self-hosted Instrument Serif, Inter and JetBrains Mono, Cyrillic support, shared design tokens and the existing theme/density subsystem without a competing palette, type scale or preference store.
- **REQ-6** (objectives: site-experience) Representative pages at 320, 390, 768 and 1440 CSS pixels have no unintended horizontal document overflow, clipped primary content or unusable navigation; the recorded 320px overflow is resolved.
- **REQ-7** (objectives: site-experience) Keyboard and touch users can open and dismiss mobile navigation, Escape closes it, expanded/current states are accurate, focus remains usable, and direct fragment targets are unobscured.
- **REQ-8** (objectives: site-experience) Changed page shells have coherent headings and landmarks, visible keyboard focus and working skip navigation; the CV outer-document heading issue is corrected after inspecting its embedded content without removing public information.
- **REQ-9** (objectives: site-experience, full-g183-report) Primary navigation, prose, citations and fragment targets remain usable with JavaScript disabled, reduced motion enabled or optional enhancement initialization failed; report prose does not require sequential disclosure or scroll revelation.
- **REQ-10** (objectives: site-experience) Theme and density controls preserve supported settings across navigation and reload, and unavailable or malformed preference storage leaves readable defaults and functioning navigation.
- **REQ-11** (objectives: site-experience, verified-publication) Existing content, locale routes, locked URLs, paragraph links, RSS, comments configuration, reply links and contact destinations remain available; `urls.lock` is not rewritten or given successor entries to conceal a removed address.
- **REQ-12** (objectives: site-experience, full-g183-report) Touched routes, discovery surfaces, feeds, sitemap, metadata and comments derive status and stable unlocalized slug from the same publication authority, and drafts produce no public route or discovery entry.
- **REQ-13** (objectives: site-experience, full-g183-report) EN/DE/FR/RU interface behavior remains functional, while report locale links and alternate metadata advertise only actual published editions on initial load and after client navigation; an absent edition offers an available edition or the selected locale's publication index.
- **REQ-14** (objectives: site-experience, full-g183-report) Before report integration, existing pages remain buildable and reviewable without a fabricated report destination or placeholder; missing or mismatched import input fails the affected operation without altering existing publications, and ordinary builds use local content only.
- **REQ-15** (objectives: full-g183-report, verified-publication) The importer verifies the supported local report against SHA-256 `8ac43988f501241c62002f6206f04c04d794e9a7cb888406345a18b99bf23d22`, while the publication owner references completed provenance, exact-source technical acceptance and existing publication authority separately in the operational ledger; no importer dependency on operational receipts or new personal approval is introduced.
- **REQ-16** (objectives: full-g183-report) A rerunnable source-to-render comparison accounts for every substantive source section and its complete text, including the sourced October 2026 baseline, granular sector roadmap through 2046, substantial imagined future story, citations and reading links, without silent omission or substantive substitution.
- **REQ-17** (objectives: full-g183-report) The introduction and relevant sections distinguish baseline facts, forward-looking assumptions and fictional narrative through explicit text labels, with citations near their claims and accessible source and further-reading links.
- **REQ-18** (objectives: full-g183-report) The report has contents links to real sector, time-horizon and narrative sections, unique stable fragment targets and a usable reading layout at all required widths; narrow-screen contents controls do not hide the report body.
- **REQ-19** (objectives: full-g183-report, verified-publication) Import starts explicitly as draft and preserves applicable first-body-line machine-authorship disclosure in every edition; the publication owner prepares the intended published state on an isolated unpublished branch under existing authority so required reviews cover the exact final publication bytes before external deployment.
- **REQ-20** (objectives: full-g183-report, verified-publication) Transformations remain within the accepted presentation scope and are accounted for against the source; substantive corrections stay with the research owner, changes outside accepted scope refresh affected technical evidence, and private receipts, restricted source paths and operational evidence remain absent from public output.
- **REQ-21** (objectives: site-experience, full-g183-report) Comments retain their existing enablement state and shared unlocalized identity; disabled or unavailable comments leave static reply links usable and never block reading or the build.
- **REQ-22** (objectives: site-experience, verified-publication) The five quality commands exercise Astro-aware formatting, linting and type checking, the existing build checks, observable behavioral tests and dependency auditing; missing tools, empty required suites or command failures cannot yield a green gate.
- **REQ-23** (objectives: site-experience, verified-publication) The candidate preserves the original audit evidence and satisfies S-52 using narrowly justified compatible remediation, beginning with the recorded Astro 7.4.1 target; actual audit, production-build and browser checks demonstrate preserved collection identity, prose, inline whitespace, paragraph links, URLs, fonts and preferences without suppression or forced broad upgrades.
- **REQ-24** (objectives: site-experience, full-g183-report, verified-publication) Candidate-bound browser evidence covers the required widths, representative routes in all four locales, display controls, menu lifecycle, fragments, back navigation, disabled scripting, reduced motion, fonts, citations, metadata, feeds and every imported report edition.
- **REQ-25** (objectives: site-experience, verified-publication) Loading behavior is compared under equivalent baseline conditions, material regressions are explained and reviewed, and the experience adds no client framework or new interactive island solely for reading navigation or decorative motion.
- **REQ-26** (objectives: verified-publication) Independent producer and exact integrated-candidate reviews complete through the existing Codex-only plan-scoped route, with original verdicts and affected checks bound to the actual candidate; F44 retains operational ownership through the existing native/no-journal lane, and neither producer self-review nor a successful build supplies acceptance.
- **REQ-27** (objectives: full-g183-report, verified-publication) External publication occurs only after complete report integration, required reviews and checks, and verified existing authenticated repository write access; only the existing publication owner performs the authorized operation through the established workflow.
- **REQ-28** (objectives: full-g183-report, verified-publication) The actual HTTPS report URL on tomscholtes.com serves the reviewed report body and correct edition, with working citations, assets and fragments and verified baseline, roadmap and story passages; the publication owner separately binds deployment identity to the reviewed integrated commit.
- **REQ-29** (objectives: verified-publication) The existing operational ledger records integrated commit and tree, source hash, original reviews, quality and browser results, workflow run, public URL and previous deployed commit, plus concrete commit-specific revert, redeployment and live-verification instructions that preserve unrelated later work.
- **REQ-30** (objectives: site-experience, full-g183-report, verified-publication) The candidate preserves the 2026-07-22 privacy cut, contains no restored desktop/private-exocortex material, copied reference assets, invented personal claims or authored U+2014 characters, and introduces no unauthorized service, research job or email publication.
- **REQ-31** (objectives: full-g183-report, verified-publication) Publication handoff is a documented one-off procedure using existing operational records; executable additions are limited to product quality, bounded content transformation, source/render fidelity and live-content checks, with no review-schema validator, credential checker, workflow-identity interpreter, release-stage engine or importer dependency on a new readiness contract.

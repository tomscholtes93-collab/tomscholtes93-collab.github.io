# Public reference analysis and adaptation map

Observed 2026-10-28 on F44. Scope: ordinary public page loading, owned fresh browser, screenshots, DOM/accessibility inventory and passive REA CDP observation. No restricted endpoint access, form submission, security testing or copied implementation. Captures stay in the publisher job's evidence directory, outside public source.

## Source and tool provenance

- Public reference: https://vortx.lu/fr (the root redirects to /fr).
- Existing destination: https://tomscholtes.com/.
- Tool source: https://github.com/morluto/rea at commit 8f9af920efb39d22b5a915605403b67a1005bc0e, README, LICENSE, DISCLAIMER, scripts/rea.mjs, src/cli/browserCommands.ts and src/browser/CdpBrowserProvider.ts inspected before execution. MIT governs REA-authored code; target assets and third-party code keep their separate rights.
- The upstream README explicitly identifies morluto/rea, rea.tools and rea-agents as official distribution. Other same-name projects include Speedrunlab/reverse-engineer-anything and several copied/forked READMEs. The browser/feature-investigation description best matches Tom's request; exact personal intent remains unconfirmed because he supplied no URL. This choice is explicit and reversible.
- Job-local npm rea-agents 6.8.0 installed with --ignore-scripts --omit=optional. No global MCP registration, binary engine setup or agent configuration change. Current Node22.23.1 is below that release's declared22.23.4 patch minimum; CLI observation succeeded, but full engine compatibility is not claimed. Do not broaden REA execution on this runtime.
- REA list-browser-targets and inspect-web-page returned observed evidence for exact allowed origins in a browser exposing only loopback CDP. Sources, storage values and network payloads were not requested. REA reports that prior requests before attachment are unavailable and artifact identity is not established by runtime observation.
- Playwright 1.64.1 with existing Chrome151.0.7922.34 captured1440x1000 desktop and390x844 mobile. Initial full-page capture required a second settled reduced-motion/scroll pass because reveal animations hide sections outside the viewport. This is observational evidence, not a Lighthouse benchmark or cross-browser certification.

## Pattern decisions

| Dimension | Public reference observation | Original adaptation for Tom |
| --- | --- | --- |
| Information architecture | Grouped services, work examples, agency and resources with clear destinations | Keep Notes as front door, add reading pathways into existing tags, archive, projects and long-form research. No agency/service claims. |
| Navigation | Desktop grouped links, locale control, prominent contact action, mobile menu | Preserve existing locale URLs, CV and contact. Make mobile grouping and active states clear, use native links, visible focus and accurate expanded state. |
| Layout | Alternating full-width sections, split compositions and compact card grids | Use an editorial masthead with a restrained side rail, distinct latest-writing section and original thematic panels within Tom's spacing tokens. No huge scroll sequence. |
| Typography | Clear sans-serif headline/body contrast and mono section labels | Retain Instrument Serif, Inter and JetBrains Mono. Improve scale, line length and label hierarchy within the existing brand. |
| Visual hierarchy | Section eyebrows, strong headings, contrast blocks and consistent CTA emphasis | One primary reading action per section, quieter contextual links, readable article metadata and no fabricated proof metrics. |
| Responsive behavior | Hero and cards stack; mobile menu retains language/theme controls | Fit at320/390/768/1440, no horizontal overflow, comfortable targets and long-title wrapping, no desktop-only story dependency. |
| Interaction and motion | Animated hero, scroll-driven construction sequence, accordions, carousels, theme controls | Keep motion optional and subtle. Use native details/anchors where useful, honor reduced motion, and make content visible with JS disabled. Retain existing theme/density controls. |
| Storytelling | Problem, process, examples and next action form a sequential argument | Introduce what Tom writes, how to explore it and where to read more. G183 future story becomes a full reading experience after completed owner handoff, clearly separated from sourced baseline. |
| Content organization | Resources/cards and thematic sections give several entry points | Surface existing essays by topic with stable tags/archive paths. Preserve full feed and all translations. G183 gets a contents map, sector navigation and source list after import. |
| Calls to action | Clear primary booking and secondary exploration actions | Reading first, then Explore projects/About/Contact. Use Tom's existing contact destination; no invented booking service. |
| Accessibility | Named icon buttons, skip-construction control, reduced-motion handling and cookie controls visible | Prefer semantic main/nav/section landmarks, one h1, native keyboard behavior, skip link, focus indication, contrast and no invisible prose when scripts fail. Test keyboard/menu and reduced motion. |
| Performance | Rich imagery/motion and96 resource entries in the observed session | Preserve static Astro output, self-hosted fonts and no new client framework/island dependency. Existing Tom session had15 resource entries and about230kB transferred versus reference about1.65MB. These one-session transfer counts are directional, cache/network dependent, not performance scores. |
| SEO | Localized pages, descriptive metadata and heading structure | Preserve canonical/hreflang/RSS/sitemap, one descriptive h1, original metadata and article structured data. Do not promise AI citation rankings or copy the reference's marketing claims. |

## Verification and limits

Both observed sites had one h1 and zero horizontal overflow at390 CSS pixels in the settled check. Tom's existing design is already lighter and editorial; the adaptation should improve discoverability and composition without adding the reference's asset weight or taking its identity. Public reference copy, logo, photos and animated objects are not implementation inputs.

Evidence: publisher job evidence/vortx-hero.png, vortx-mobile-settled.png, vortx-desktop-settled.png, tom-hero.png, tom-mobile-settled.png, both *-checks.json, rea-targets.json, rea-vortx.json and rea-tom.json. JSON uses escaped Unicode for faithful source values without literal forbidden punctuation in authored text files.

## Supported runtime successor

The earlier Node22.23.1 REA run was outside the declared patch support range and is retained as history. A verified official job-local Node24.22.1 runtime now satisfies REA6.8.0 requirements. Fresh passive list/inspect operations on both exact public origins succeeded with that runtime. Use publisher evidence/rea-targets-node24.json, rea-vortx-node24.json, rea-tom-node24.json and rea-supported-runtime.json as the supported successor evidence. No global agent configuration or native analysis engine was installed.

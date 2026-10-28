# 02 - Make the notes-first site readable and navigable on every screen

**What to build:** An original Tom-branded editorial experience that helps readers find existing writing and navigate comfortably across screen sizes, locales and display preferences. Deliver the local site improvement independently of report transformation and deployment.

**Blocked by:** 01
**Engine:** codex
**Files:** src/components/** src/layouts/** src/styles/** src/pages/** src/i18n/** src/lib/justify-client.js test/site/**
**Acceptance-test:** npm run build && node scripts/run-tests.mjs --suite site
**Covers:** REQ-2 REQ-4 REQ-5 REQ-6 REQ-7 REQ-8 REQ-9 REQ-10 REQ-11 REQ-14 REQ-21 REQ-24 REQ-25 REQ-30

- [ ] Use `.factory/REFERENCE-ANALYSIS.md`, `.factory/BROWSER-BASELINE.md`, DESIGN and applicable decisions. Adapt section labels, reading actions, hierarchy and restrained modular composition without copying reference assets, text or implementation.
- [ ] Keep the front door a publication with a clear masthead and readable notes. Provide working paths to notes, `/tags/`, archive, About, projects, CV, thesis and existing contact destinations. Preserve existing public information and note prose.
- [ ] Keep `src/styles/tokens.css` as the sole token authority. Retain self-hosted Instrument Serif, Inter and JetBrains Mono, existing reading typography and Cyrillic support. New interface strings use matching keys and placeholders in EN/DE/FR/RU.
- [ ] Resolve the recorded 320px document overflow. At 320, 390, 768 and 1440 CSS pixels, representative pages have usable navigation, wrapping long titles and unclipped primary content without unintended horizontal document scrolling.
- [ ] Mobile navigation works with keyboard and touch. Escape dismisses an open menu, expanded and current states remain accurate, focus remains usable, and navigation/back operations do not leave stale menu state.
- [ ] Inspect the embedded CV before correcting the outer `/cv/` document. Provide coherent headings and landmarks without removing public information. Changed shells have visible focus, working skip navigation and unobscured fragment targets.
- [ ] Preserve primary navigation and readable content with JavaScript disabled, reduced motion enabled and optional enhancement initialization deliberately failed. Prose does not depend on scroll revelation or successive disclosures.
- [ ] Preserve supported theme and density settings across navigation and reload. Exercise absent, malformed and unavailable preference storage. Handle failures within the existing preference subsystem, leaving readable defaults and functioning navigation without another storage key or root-state writer.
- [ ] Preserve locked URLs, paragraph addresses, RSS links, contact and reply destinations and existing comments enablement. Disabled or unavailable comments leave static reply links usable and never prevent reading.
- [ ] Add browser checks under `test/site/` for representative home, notes, note detail, tags, archive, About, projects and CV routes across all four locales and required widths. Assertions detect missing reading pathways, overflow, broken Escape dismissal, missing CV semantics and preference failures.
- [ ] Retain candidate-bound screenshots and browser results for keyboard/touch navigation, fragments, back navigation, display controls, disabled scripting, reduced motion, enhancement failure, font loading and Cyrillic text. Assert no unexpected first-party console errors, missing local assets or hidden primary prose.
- [ ] Compare loading behavior with equivalent retained baseline conditions and document material regressions for independent review. Add no client framework, reading-navigation island, tracking origin, service or decorative asset dependency.
- [ ] Existing pages remain buildable before report integration, without a fabricated G183 destination or placeholder. Preserve the privacy cut and unrelated dirty files.
- [ ] Hand off the local candidate and original evidence for independent review through the existing Factory route. Local report-access defects and GitHub credential failures do not defer this ticket's implementation or review.

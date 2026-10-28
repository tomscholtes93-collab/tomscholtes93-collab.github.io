# Browser baseline before product changes

2026-10-28, F44, clean origin/main static build. Owned local preview, Playwright1.64.1, existing Chrome151, widths320/390/768/1440. Machine evidence and screenshots live in publisher job evidence/baseline-browser-audit.json and baseline-390.png/baseline-1440.png. These are baseline observations, not acceptance of changed bytes.

Proved relevant existing issues for the independent site ticket:

- At320px, root document scrollWidth352, a32px horizontal overflow.390/768/1440 have no horizontal overflow.
- Mobile menu opens with correct expanded state, but Escape does not close it. Focus already stays/returns on the toggle in this test; do not claim a separate focus bug without reproducing it.
- /cv/ returns200 and has no h1 in the outer document. Inspect its actual embedded content and preserve its public information when improving heading/landmark semantics.

Existing positives to preserve:

- Root has exactly one h1 and one main at all tested widths.
- Reduced-motion content is visible. At390 with JavaScript disabled, all seven note headings remain readable and none of the main reveal blocks are opacity0. Do not invent a no-JavaScript content failure.
- Existing notes, about, CV, projects, archive and all three translated homepages return200 with expected canonical URLs and locale labels.
- The tags route is /tags/, as linked by the existing footer. The first generic audit mistakenly tested /notes/tags/ and its404 is an audit error, not a product finding. Corrected verifier uses /tags/.

Extend meaningful UI checks for keyboard navigation, menu lifecycle,320px overflow, unchanged URLs, theme/density persistence, static content without scripts and reduced motion. Keep original Tom-branded content and avoid new runtime dependencies.

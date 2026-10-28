# ADR 0003: Patched static build and executable quality checks

Date: 2026-10-28. Status: implemented locally, pending independent acceptance.

The original Astro 5 build succeeded, but its dependency audit contained one critical and thirteen high findings. The accepted design authorizes an Astro security compatibility upgrade while retaining the framework, static output and existing GitHub Pages workflow.

Use Astro 7.4.1, React integration 7.0.0 and the unified Markdown processor 7.3.5. Keep React 18.3.1 because the integration explicitly supports that version. Use Sharp 0.35.5 for the existing generated images. The job-local Node.js 24.22.1 and npm 11.19.1 satisfy the chosen packages and match the existing workflow's Node 24 major. Global runtime defaults are unchanged. Lock the exact development tools and Node 24 declarations in the package lock.

Move collection discovery to `src/content.config.ts`, retain the schema in `src/content/notes/config.ts`, and use the glob loader with explicit locale-prefixed IDs. Replace removed collection `slug` and instance `render` APIs with their supported equivalents. Public slugs, comment identity and all original Markdown bytes stay unchanged. Keep the unified processor because the site's paragraph citations depend on its rehype plugin. Enable HTML compression explicitly to preserve whitespace behavior between inline elements.

Set trailing-slash handling to `ignore`. The established static host serves both forms, while Astro 7's strict `never` preview rejected the site's existing slash links. This changes preview compatibility without changing the locked route set or canonical-link construction. Browser tests pass `--ignore-lock` to Astro preview: its agent detection otherwise backgrounds the server, outside the test process's lifetime. The foreground instance listens only on loopback and is owned and cleaned up by Playwright.

The strict Astro check also exposed pre-existing untyped experimental pages. Retain those public pages and correct their types and DOM boundaries. Do not remove them from the application graph, weaken strictness or suppress diagnostics. Existing graph pages contained invalid literal JSON expressions inside data script tags; emit the intended existing static data as escaped JSON and verify it parses in served output.

The format and lint adapters enumerate committed and working changes against the fixed original baseline. Checks fail on missing tools, enumeration failures and unexpected ignores. The gate runs format, lint, Astro types, build plus tracked Node/browser tests, then the complete dependency audit. Tests never update baselines, install tools or deploy. Provision the browser explicitly before running them.

The patched audit currently reports zero high or critical findings and two moderate findings in the existing Satori/fflate chain. These remain visible in the retained audit evidence. Their suggested Satori major update is outside this compatibility correction; no forced audit fix or suppression was applied.

The build regenerates the 48 by 48 pixel Tom favicon with different encoded bytes under the patched image dependency. Decoded RGBA pixels are identical to the baseline. No reference-site asset was introduced.

Validation evidence, exact package metadata, original and current audit results, source hashes and browser results are retained in the existing operational job ledger. A successful local quality gate is distinct from report integration, independent acceptance and publication. Deployment still uses the existing workflow and requires its existing authenticated GitHub write route.

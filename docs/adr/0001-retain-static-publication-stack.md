# 0001. Retain the static publication stack with bounded security remediation

## Context

The repository is an established four-locale publication with durable URLs, feeds, paragraph links, reply identity, display controls and a deliberate privacy cut. The requested work improves editorial presentation and publishes a complete externally authored report. Existing Astro components and build scripts implement these surfaces. The supplied execution runtime is Node.js 24.22.1 with npm 11.19.1, and the existing GitHub Pages workflow already selects Node.js 24. INTENT additionally records a critical direct Astro advisory affecting the baseline and authorizes a narrow same-framework compatibility upgrade.

## Decision

Retain Astro static output, the existing repository and the established GitHub Pages workflow. Reuse shared styles, localization, content queries, paragraph anchors, feed generation and self-hosted fonts. Retain existing React islands; new reading navigation uses semantic markup and native links with optional enhancement. Primary content and fragment targets remain available without client initialization.

The current lockfile is a starting point, not a permanent version contract. Begin the security remediation with Astro 7.4.1, the recorded audit-recommended target, and select only the compatible integration and declaration changes needed to pass the actual audit and preservation checks. The target's published metadata accepts the supplied runtime. Current Astro 7.4.3 also accepts it, so the earlier runtime blocker no longer applies. Metadata compatibility does not establish a passing installation, clean audit or unchanged rendering. Verified 2026-10-28 against [target metadata](https://registry.npmjs.org/astro/7.4.1), [target release](https://github.com/withastro/astro/releases/tag/astro%407.4.1) and [current metadata](https://registry.npmjs.org/astro/latest).

Keep the compatibility work isolated and justified by observed failures. Preserve collection identities while adapting the removed legacy content APIs. Retain the paragraph-transform behavior through the supported rendering path, and verify whitespace between inline elements. The upstream guides document these migration risks. They do not authorize changing prose, addresses, fonts or preferences. [Collection migration](https://docs.astro.build/en/guides/upgrade-to/v6/), [rendering migration](https://docs.astro.build/en/guides/upgrade-to/v7/), verified 2026-10-28.

## Alternatives

Next.js static export is viable on the supplied runtime and existing hosting. Installation would add project dependencies without another runtime prerequisite. It would nevertheless replace collection rendering, templates and routing across four locales, requiring the same URLs, paragraph addresses and reply behavior to be reconstructed. That work does not supply a missing capability for this task. [Package metadata](https://registry.npmjs.org/next/latest), [static export documentation](https://nextjs.org/docs/app/guides/static-exports), verified 2026-10-28.

Eleventy is also viable with a project-local installation on this host. Its simpler static templates would require reconnecting islands, content transforms, localization and metadata. The editorial benefit does not justify replacing working integrations. [Official documentation](https://www.11ty.dev/docs/), verified 2026-10-28.

Keeping Astro 5 indefinitely would minimize immediate compatibility work, but it cannot satisfy the recorded affected-version range and existing quality requirement. Conversely, updating every dependency to latest would broaden the change beyond demonstrated need. Neither audit suppression nor forced upgrades provide compatibility evidence.

## Consequences

The project pays a bounded framework compatibility cost while preserving its publication architecture. Dependency choices become owned by the implemented lockfile and evidence, not this document. A successful baseline build is insufficient: the changed candidate needs production-build, content, URL, paragraph-anchor and browser checks, including existing display controls and all locales.

The frozen integration entry point remains `bash scripts/quality-gate.sh`, including `npm run build` and the applicable quality checks. Preserve historical audit findings and actual remediation results; unresolved high or critical findings must not become a green release through exceptions. Independent review and verified live publication remain separate requirements. No new hosting, application service or orchestration component is introduced.

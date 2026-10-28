# 04 - Keep note discovery, translations and discussion on one identity

**What to build:** Consistent note discovery and language navigation that expose only published editions, preserve existing addresses and discussion identity, and provide useful fallback navigation when a translation is absent.

**Blocked by:** 02
**Engine:** codex
**Files:** src/lib/notes.ts src/lib/rss.ts src/components/NoteCard.astro src/components/NotesList.astro src/components/LangSwitcher.astro src/components/GiscusThread.astro src/components/ReplySurface.astro src/components/JsonLdArticle.astro src/layouts/Base.astro src/pages/** src/i18n/** test/publication/**
**Acceptance-test:** npm run build && node scripts/run-tests.mjs --suite publication
**Covers:** REQ-11 REQ-12 REQ-13 REQ-14 REQ-21 REQ-24

- [ ] Build on ticket 02's shared shell and ticket 01's compatible content APIs. Consolidate publication decisions for touched consumers through `src/lib/notes.ts`, retaining the single logical schema authority established by the compatibility work. Do not assume an obsolete configuration location must remain.
- [ ] Home and notes lists, detail routes, related entries, tags, archive, feeds and touched metadata agree about published status and stable unlocalized slug. Drafts emit no public route, card, feed item, sitemap entry or alternate-edition claim.
- [ ] Language links and alternate metadata advertise only actual published note editions. Apply the same rule on initial HTML load and after client navigation. An absent edition offers an available edition or the chosen locale's publication index.
- [ ] Preserve EN/DE/FR/RU site navigation independently of note translation availability. Keep existing tag keys and positional label alignment without inventing report translations or changing existing prose.
- [ ] Preserve canonical URLs, structured-data identity, RSS escaping and paragraph fragments. Do not change `urls.lock` or add successor entries to conceal removed addresses.
- [ ] Comments retain their existing enablement state and shared unlocalized identity across editions. Disabled or unavailable comments leave static reply and citation links usable without making comments a build dependency.
- [ ] Add tests under `test/publication/` for published/draft separation and a partially translated generic note. Exercise rendered routes, discovery, feeds, sitemap, metadata and locale navigation. Synthetic notes exist only in temporary test-owned content, outside the ordinary public collection.
- [ ] Test initial load, client navigation, direct fragments and browser back navigation. Verify canonical/alternate destinations and shared comment identity through observable output, including notes with missing translations.
- [ ] Include regression checks against actual existing notes and locked addresses. Tests fail if drafts become public, absent translations are advertised, identity splits or an existing address disappears.
- [ ] Existing pages continue to build and pass before G183 integration. Add no report placeholder, provisional public slug or fabricated completed-report page.
- [ ] Retain candidate-bound browser and command evidence for independent review. This ticket has no report-input or deployment-credential prerequisite.

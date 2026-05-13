# RESEARCH.md — tomscholtes-v3

## Libraries

| Name | Version | Purpose | Link |
|---|---|---|---|
| Astro | ^5.0.0 | Static site generator, islands architecture, file-based routing, build-time endpoints | https://docs.astro.build/en/getting-started/ |
| @astrojs/react | ^4.2.0 | React 18 integration for two `client:idle` islands | https://docs.astro.build/en/guides/integrations-guide/react/ |
| React + ReactDOM | 18.3.1 | Runtime for `TweaksPanel` / `DisplayPanel` only | https://react.dev/reference/react |
| satori | ^0.12.0 | JSX → SVG renderer for OG image (no headless browser) | https://github.com/vercel/satori |
| @resvg/resvg-js | ^2.6.2 | SVG → PNG rasteriser (native bindings, fast) | https://github.com/yisibl/resvg-js |
| sharp | ^0.33.0 | `astro:assets` image optimisation backend (Astro builtin) | https://sharp.pixelplumbing.com/ |
| @fontsource/instrument-serif | latest | Upstream woff2 source for Instrument Serif | https://www.npmjs.com/package/@fontsource/instrument-serif |
| @fontsource/inter | latest | Upstream woff2 source for Inter | https://fontsource.org/fonts/inter |
| @fontsource/jetbrains-mono | latest | Upstream woff2 source for JetBrains Mono | https://fontsource.org/fonts/jetbrains-mono |
| fonttools (`pyftsubset`) | ≥ 4.50 | One-time subsetting of woff2 to Latin/Latin-Ext/Cyrillic ranges | https://fonttools.readthedocs.io/en/latest/subset/index.html |
| TypeScript | ^5.5 | Typed content modules (`caseStudies.ts`, `headlines.ts`) | https://www.typescriptlang.org/ |
| pa11y-ci | ^3.1 | Automated WCAG AA contrast / a11y audit across all 3 themes | https://github.com/pa11y/pa11y-ci |
| vite-bundle-visualizer | ^1.x | Verify initial JS gz < 15 KB | https://github.com/KusStar/vite-bundle-visualizer |
| actions/configure-pages | v5 | GitHub Pages deploy: configure step | https://github.com/actions/configure-pages |
| actions/deploy-pages | v4 | GitHub Pages deploy: upload + activate | https://github.com/actions/deploy-pages |
| actions/upload-pages-artifact | v3 | Upload `dist/` as Pages artifact | https://github.com/actions/upload-pages-artifact |
| Intersection Observer | Level 1 (REC) | Scroll-reveal trigger | https://www.w3.org/TR/intersection-observer/ |
| CSS Media Queries Level 5 | WD | `prefers-color-scheme`, `prefers-reduced-motion` | https://www.w3.org/TR/mediaqueries-5/ |
| Schema.org Person | live spec | JSON-LD structured data for the home page | https://schema.org/Person |
| Open Graph Protocol | 2014 | `og:title`/`og:image`/`og:description` for link previews | https://ogp.me/ |
| WCAG 2.1 AA | 2018 REC | Contrast + reduced-motion compliance | https://www.w3.org/TR/WCAG21/ |

Crucially, the runtime ships only the React islands' JS — everything else compiles to zero-JS HTML/CSS. The `< 15 KB initial gz` budget is realistic only because Astro's island hydration strategy keeps the rest off the wire.

## Reference patterns

### 1. Astro 5 static config with React integration

Source: Astro docs, "Configuration Reference" — https://docs.astro.build/en/reference/configuration-reference/ and "@astrojs/react" — https://docs.astro.build/en/guides/integrations-guide/react/

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://tomscholtes.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  integrations: [react()],
  vite: {
    build: { cssCodeSplit: true, target: 'es2022' },
  },
});
```

`inlineStylesheets: 'auto'` lets Astro inline tiny stylesheets (< 4 KB by default) into the `<head>`, eliminating a round-trip for small per-route CSS — reference: https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets.

### 2. React island hydrated `client:idle`

Source: Astro docs, "Client Directives" — https://docs.astro.build/en/reference/directives-reference/#client-directives

```astro
---
// src/pages/index.astro
import TweaksPanel from '../components/islands/TweaksPanel.jsx';
import DisplayPanel from '../components/islands/DisplayPanel.jsx';
import { HEADLINES } from '../content/headlines.ts';
---
<TweaksPanel client:idle headlines={HEADLINES} />
<DisplayPanel client:idle />
```

`client:idle` hydrates after `requestIdleCallback` fires (fallback: 200 ms timeout). Best for non-critical interactive UI — the page paints + LCP completes before React touches the DOM. Reference: https://docs.astro.build/en/reference/directives-reference/#clientidle.

### 3. Static build-time OG endpoint with satori + resvg

Source: satori README — https://github.com/vercel/satori and Astro "Endpoints" — https://docs.astro.build/en/guides/endpoints/#static-file-endpoints

```ts
// src/pages/og/default.png.ts
import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ogTemplate } from '../../lib/og';

export const prerender = true;

export const GET: APIRoute = async () => {
  const fontDir = path.resolve('public/fonts');
  const [serif, inter] = await Promise.all([
    fs.readFile(path.join(fontDir, 'instrument-serif-regular.woff2')),
    fs.readFile(path.join(fontDir, 'inter-500.woff2')),
  ]);
  const svg = await satori(ogTemplate(), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Instrument Serif', data: serif, weight: 400, style: 'normal' },
      { name: 'Inter', data: inter, weight: 500, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
```

`export const prerender = true` is required in Astro 5 for static endpoints when the project is not fully static-output (defensive even with `output: 'static'`). Reference: https://docs.astro.build/en/guides/endpoints/#prerendering.

### 4. Satori JSX-as-VDOM (no React runtime)

Source: satori README "JSX without React" — https://github.com/vercel/satori#jsx

```tsx
// src/lib/og.ts — JSX is for shape only; satori parses the tree directly.
export const ogTemplate = () => ({
  type: 'div',
  props: {
    style: {
      width: 1200, height: 630, display: 'flex', flexDirection: 'column',
      background: '#0E0E0C', color: '#E6E1D7', padding: 80,
      fontFamily: 'Instrument Serif',
    },
    children: [
      { type: 'div', props: { style: { fontSize: 96 }, children: 'Tom Scholtes' } },
      { type: 'div', props: {
          style: { fontFamily: 'Inter', fontSize: 32, color: '#C4623A', marginTop: 24 },
          children: 'Six years in Luxembourg fund services.' } },
    ],
  },
});
```

The tree shape mirrors React but no React import is needed at build time. Satori supports a subset of CSS — flexbox yes, grid no, named system fonts no (you must pass `Buffer`s). Reference: https://github.com/vercel/satori#css.

### 5. Flash-of-wrong-theme prevention (inline pre-paint script)

Source: Josh W. Comeau, "The Quest for the Perfect Dark Mode" — https://www.joshwcomeau.com/react/dark-mode/

```astro
---
// src/layouts/Base.astro — fragment in <head>, BEFORE any styled content
---
<script is:inline>
  (function () {
    try {
      var s = localStorage.getItem('theme');
      var d = s || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = d;
      var dens = localStorage.getItem('density'); if (dens) document.documentElement.dataset.density = dens;
      var acc  = localStorage.getItem('accent');  if (acc)  document.documentElement.dataset.accent = acc;
    } catch (e) {}
  })();
</script>
```

`is:inline` is Astro's directive that bypasses bundling, leaves the script verbatim in the output, and runs synchronously — exactly what FOUC prevention needs. Reference: https://docs.astro.build/en/reference/directives-reference/#isinline.

### 6. Self-hosted font preload + `@font-face` with `unicode-range`

Source: web.dev "Preload web fonts" — https://web.dev/articles/codelab-preload-web-fonts and MDN `@font-face` `unicode-range` — https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range

```html
<link rel="preload" href="/fonts/instrument-serif-regular.woff2"
      as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-500.woff2"
      as="font" type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-500-latin.woff2') format('woff2');
  font-weight: 500; font-style: normal; font-display: swap;
  unicode-range: U+0000-024F, U+02BB; /* Latin + Latin-Ext + Uzbek ʻ */
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-500-cyrl.woff2') format('woff2');
  font-weight: 500; font-style: normal; font-display: swap;
  unicode-range: U+0400-04FF;
}
```

`crossorigin` is mandatory on font preload links — browsers always fetch fonts as anonymous CORS, and a non-crossorigin preload double-fetches. Reference: https://web.dev/articles/codelab-preload-web-fonts#cross-origin-fonts. `unicode-range` lets the Cyrillic file load only when a Cyrillic glyph is actually used (rare on a primarily-English CV).

### 7. JSON-LD Person schema

Source: Schema.org `Person` — https://schema.org/Person and Google "Structured Data Person markup" — https://developers.google.com/search/docs/appearance/structured-data/

```astro
---
// src/components/JsonLdPerson.astro
const data = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Tom Scholtes',
  jobTitle: 'Finance ops engineer',
  worksFor: { '@type': 'Organization', name: 'Triton' },
  knowsLanguage: ['en', 'de', 'fr', 'ru', 'lb', 'uz'],
  sameAs: [
    'https://www.linkedin.com/in/tomscholtes',
    'https://github.com/tomscholtes93-collab',
  ],
};
---
<script type="application/ld+json" set:html={JSON.stringify(data)} />
```

`set:html` is Astro's "trust me, this is safe HTML" sink — used here for the JSON payload which is built from typed literals only (no user input). Reference: https://docs.astro.build/en/reference/directives-reference/#sethtml. Validate the output with Google Rich Results Test — https://search.google.com/test/rich-results.

### 8. IntersectionObserver scroll reveal with reduced-motion bypass

Source: MDN "Intersection Observer API" — https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

```html
<script is:inline>
  (function () {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  })();
</script>
```

### 9. Hero card rotator with reduced-motion short-circuit

Source: MDN "setInterval" — https://developer.mozilla.org/en-US/docs/Web/API/setInterval

```js
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cards = document.querySelectorAll('[data-hero-card]');
  var i = 0;
  cards[0].classList.add('hero-card--active');
  setInterval(function () {
    cards[i].classList.remove('hero-card--active');
    i = (i + 1) % cards.length;
    cards[i].classList.add('hero-card--active');
  }, 6000);
})();
```

Pure CSS transition on `.hero-card--active` (opacity + transform crossfade). Total JS ≤ 12 LOC, far under the 1 KB budget.

### 10. GitHub Pages deploy workflow (Pages Actions, not gh-pages branch)

Source: GitHub docs "Publishing with a custom GitHub Actions workflow" — https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages and `withastro/action` — https://github.com/withastro/action

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: frontend/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Note: this approach uses Pages' native artifact mechanism (Settings → Pages → Source: "GitHub Actions"), which **deprecates the legacy `gh-pages` branch flow**. PLAN says "deploy to `gh-pages` branch" — but the modern, recommended approach is the Pages artifact above, which avoids force-pushing to a tracked branch. Either works; the artifact flow is cleaner. Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow.

### 11. `pyftsubset` invocation for woff2 subsetting

Source: fonttools docs — https://fonttools.readthedocs.io/en/latest/subset/index.html

```bash
pyftsubset Inter-Medium.ttf \
  --unicodes="U+0000-024F,U+02BB" \
  --layout-features='*' \
  --flavor=woff2 \
  --output-file=public/fonts/inter-500-latin.woff2
```

`--layout-features='*'` keeps OpenType ligatures + kerning (otherwise advanced typography breaks). `--flavor=woff2` produces a Brotli-compressed woff2 directly. Run once, commit the output, do not regenerate per build.

## Gotchas

- **Astro 5 endpoint exports renamed**: Astro 5 uses `export const GET`, `POST`, etc. (HTTP-method-named exports). The pre-4.0 `get()`/`post()` lowercase + `export const get` patterns are removed. Reference: https://docs.astro.build/en/guides/upgrade-to/v5/#removed-deprecated-get-and-post-functions.
- **`prerender = true` on endpoints in static mode**: With `output: 'static'`, all routes prerender by default. But mixed-output projects need explicit `export const prerender = true` on the OG endpoint. Set it defensively even in pure static mode.
- **Satori cannot fetch fonts over HTTP at build time without explicit support**: You must pass font `Buffer`s via the `fonts` option. `fs.readFile()` woff2 files directly from `public/fonts/`. Satori **does not** support TTF/OTF — must be woff2 or a raw font format satori-supported (see https://github.com/vercel/satori#fonts). Note: as of satori 0.10+, woff2 IS supported; older versions required ttf.
- **Satori CSS subset is narrow**: No `grid`, no `box-shadow` blur radius, no `linear-gradient` with stops > 2 colors in all versions, no `background-image: url(...)`. Use flexbox and solid colors. Reference: https://github.com/vercel/satori#css.
- **resvg-js font fallback**: resvg only rasterises what satori produced — if satori couldn't lay out a glyph (missing weight, missing range), resvg renders a tofu box. Always pass every font weight you reference in the satori tree.
- **`@astrojs/react` and React 18.3 strict mode**: Islands re-mount in `<StrictMode>` during dev, doubling effect invocations. `localStorage.setItem` is idempotent so this is harmless, but any side-effect-heavy `useEffect` should be guarded.
- **`client:idle` does not wait for hydration on initial paint**: That's the *point*, but it means initial server-rendered island HTML must be visually identical to the post-hydration state. If `TweaksPanel`'s closed state differs from its open state, render the closed state on the server side.
- **React island state and SSR-DOM mismatch**: Server-side render Astro islands with React 18's `renderToString`. State that depends on `window`/`localStorage` (e.g., current theme) must be **read again** in a `useEffect` post-hydration; render-time access of `window` throws. Use `useSyncExternalStore` with a server snapshot or guard with `typeof window !== 'undefined'`.
- **`set:html` and JSON-LD**: `JSON.stringify` correctly escapes `<` to `\u003c` ONLY if you specify it manually — by default it does NOT. **A JSON-LD payload containing the substring `</script>` will break out of the script tag.** Always sanitise: `JSON.stringify(data).replace(/</g, '\\u003c')` before `set:html`. Reference: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-for-javascript-contexts.
- **`set:html` is the XSS sink**: Any *non-constant* input flowing into `set:html` is XSS-attackable. The JSON-LD payload is constant TypeScript data → safe. Still, escape the `<` defensively.
- **Astro `<script>` tags are bundled by default**: A bare `<script>...</script>` in an `.astro` component gets ESM-bundled, hashed, and emitted as a `.js` file. Use `is:inline` to prevent bundling and keep the script in HTML — required for the pre-paint theme script (must run before bundled JS loads). Reference: https://docs.astro.build/en/guides/client-side-scripts/#opting-out-of-processing.
- **CNAME and `.nojekyll` must be in `public/`**: Astro copies `public/` to `dist/` verbatim. `public/CNAME` → `dist/CNAME`. The `.nojekyll` file must be exactly empty (0 bytes). Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#static-site-generators.
- **`CNAME` must end in `\n`**: GitHub Pages parses `CNAME` line-by-line. A missing trailing newline can confuse some toolchains. Acceptance criterion 13 specifies `tomscholtes.com\n` — use `printf 'tomscholtes.com\n' > public/CNAME` to guarantee.
- **`trailingSlash: 'never'` and GitHub Pages**: GitHub Pages serves `/projects/devswarm/` as `projects/devswarm/index.html` when trailing slash is present. With `trailingSlash: 'never'`, links should target `/projects/devswarm` (no slash) — GitHub Pages handles the redirect. Verify on staging.
- **`output: 'static'` + dynamic routes**: PLAN has no dynamic routes, but if added, each must have `getStaticPaths()` exported. Reference: https://docs.astro.build/en/reference/routing-reference/#getstaticpaths.
- **`view-transitions` and React islands**: Astro 5 supports `<ViewTransitions />`. **Do not enable** — it interferes with React island state across navigations (islands re-mount, losing local state). PLAN doesn't request it; resist adding it.
- **`prefers-reduced-motion` is reactive**: Listen for `change` events on the MQL if you want OS-level toggles to take effect without reload. Not required by PLAN, but a nice polish.
- **`localStorage.theme` and SSR**: Theme cannot be known at build time. The HTML ships with no `data-theme` attribute; the pre-paint script sets it before any styled element paints. Make sure CSS targets `html[data-theme="light"]` AND `html[data-theme="dark"]` with explicit selectors — no `:root` fallback that could flash. Or set a default `data-theme="light"` on `<html>` directly in `Base.astro` so the cascade works pre-script.
- **Lighthouse "Performance ≥ 95" is fragile on GitHub Pages**: GitHub Pages serves over a CDN but with no Brotli (gzip only). Self-hosting fonts removes the third-party DNS hop. Defer non-critical CSS via `media="print" onload="this.media='all'"` if needed. Reference: https://web.dev/articles/defer-non-critical-css.
- **`pa11y-ci` and JS-rendered content**: pa11y uses headless Chrome and waits for `networkidle`. With `client:idle` islands, the panel UI may not be rendered when pa11y measures. Use `pa11y --wait 1000` or the JS-CI config's `wait` setting.
- **`vite-bundle-visualizer` integration with Astro**: Astro uses Vite under the hood. Add the visualiser as a Vite plugin in `astro.config.mjs` under `vite.plugins`. Reference: https://github.com/btd/rollup-plugin-visualizer (which is what `vite-bundle-visualizer` wraps).
- **`@resvg/resvg-js` requires native bindings**: It ships prebuilt binaries for common platforms (linux-x64-gnu, darwin-arm64, etc.). On a fresh GitHub Actions Ubuntu runner this works out of the box. If the build runs on an exotic arch (musl, freebsd) it falls back to JS port or fails. Stick to `runs-on: ubuntu-latest`.
- **Fontsource subsetting**: `@fontsource` packages already provide subsetted woff2 files (e.g., `@fontsource/inter/files/inter-latin-500-normal.woff2`). You can skip `pyftsubset` entirely if you accept fontsource's pre-defined subsets. But fontsource subsets do NOT include U+02BB (Uzbek), so for full PLAN compliance, run `pyftsubset` on the full Inter file to produce a custom range. Reference: https://fontsource.org/docs/getting-started/install.
- **Inline SVG and `currentColor`**: `<path stroke="currentColor">` inherits from the element's CSS `color`. To switch fills by theme, use `fill="var(--accent)"` etc. — works in inline SVG, NOT in `<img src="...svg">`. PLAN uses inline → good.
- **JSON-LD `worksFor` and ATS scrapers**: Some ATS bots scrape JSON-LD for current employer. PLAN explicitly puts "Triton" in structured data while keeping body copy anonymised ("Working in Controlling"). This is a deliberate tradeoff; document it in the colophon or honesty audit. Reviewer should flag it.
- **Acceptance criterion 1 false positive**: `! grep -rqi "not taking on commercial work" dist/` — if any source comment or removed-content marker survives into `dist/`, it fails. Ensure V2's old strings are not preserved in HTML comments.
- **Acceptance criterion 2 — "journey", "unlock", "transformative" forbidden words**: Be especially careful in alt text, ARIA labels, and the OG image text. A casual "journey" in a colophon would silently fail the build.
- **Acceptance criterion 6 — Jarvis honesty grep**: Any matches must comply with §2 honesty table. Adopt a single canonical phrase ("[references to a Jarvis-style assistant comply with §2: this is *not* an autonomous agent]") and use it consistently, or remove all references.
- **GitHub Pages caching**: First-time `gh-pages` deploys can take 5–10 min to propagate. Custom-domain HTTPS may take up to 24h for the certificate to provision the first time. Plan staging windows accordingly. Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages.
- **`view-transitions` polyfill**: Not enabled, but if a third-party Astro component pulls it in, bundle size balloons. Audit `npm ls` for unexpected deps.
- **OG image absolute URL**: Twitter/iMessage require `og:image` to be an **absolute** URL with scheme. `https://tomscholtes.com/og/default.png` (not `/og/default.png`). PLAN says this — preserve it.
- **OG image dimensions**: 1200×630 is Twitter's "summary_large_image" minimum and Facebook's recommended. iMessage previews use the same. Smaller images get downscaled with quality loss. Reference: https://developers.facebook.com/docs/sharing/webmasters/images/.

## Security

- **Static site → no server-side attack surface**: No SSR, no server endpoints at runtime, no form submissions, no API. The only build-time endpoint (`/og/default.png`) executes at build, not at request time. The runtime surface is HTML + CSS + ≤ 15 KB of React island JS.
- **XSS sinks audit**: The only `set:html` use is the JSON-LD payload, fed from typed TS literals. **Mitigation**: escape `<` to `\u003c` in the stringified JSON before `set:html` to prevent any future injection if data becomes dynamic. Reference: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-for-javascript-contexts.
- **`localStorage` and XSS**: TweaksPanel/DisplayPanel read/write `localStorage.theme`/`.density`/`.accent`. Values are read into `document.documentElement.dataset.X`, which the browser treats as plain attribute strings (not HTML-interpreted). Even if `localStorage.theme = '<script>alert(1)</script>'`, it would render as a literal attribute value, not execute. Safe by construction.
- **Content Security Policy (CSP)**: Static site with inline CSS, inline JS, inline `<script>` for pre-paint, and inline `<script type="application/ld+json">`. A meta CSP for this project should be:
  ```html
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    style-src 'self' 'unsafe-inline';
    script-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    base-uri 'self';
    form-action 'none';
    frame-ancestors 'none';">
  ```
  `'unsafe-inline'` is regrettable but required because PLAN mandates the inline pre-paint script and inline JSON-LD. A stricter alternative (nonce-based CSP) requires a server, which PLAN forbids. For GitHub Pages, you cannot set CSP headers (no `_headers` file support), so meta CSP is the only option. Reference: https://content-security-policy.com/.
- **GitHub Pages and headers**: Pages serves with a fixed set of headers and doesn't honour `_headers` or `_redirects` files. Security headers like `X-Frame-Options`, `Strict-Transport-Security`, and `X-Content-Type-Options` are set by Pages defaults (HSTS yes, X-Frame-Options no). To set arbitrary headers, you would need Cloudflare Pages or a custom CDN — out of scope. Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#https-enforcement.
- **HTTPS enforcement**: GitHub Pages with custom domain auto-provisions a Let's Encrypt cert and serves HTTPS. Enforce in repo Settings → Pages → "Enforce HTTPS". Mandatory for any contemporary site.
- **Subresource Integrity (SRI)**: N/A — zero external resources. The PLAN's no-CDN rule is the supply-chain control.
- **Supply chain — Astro + React + satori + resvg**: Build-time dependencies are extensive (Astro pulls ~1000+ transitive packages). Mitigations:
  - Use `npm ci` (not `npm install`) in CI to enforce lockfile.
  - Commit `package-lock.json`.
  - Enable Dependabot or Renovate with grouped security PRs.
  - Use `npm audit --omit=dev` to scope to runtime — runtime here is ~React only.
  - Consider `npm ci --ignore-scripts` if any postinstall scripts are suspect; this disables `sharp` native binary fetch — verify on a clean install first.
- **`sharp` postinstall and native bindings**: `sharp` runs a postinstall script to fetch prebuilt binaries. This is a supply-chain trust point. `sharp` is maintained by the libvips author and widely trusted. Reference: https://sharp.pixelplumbing.com/install.
- **`@resvg/resvg-js` postinstall**: Same shape. Trust the author (`yisibl`, established). Pin versions, audit on update.
- **GitHub Actions security**:
  - Use `permissions: { contents: read, pages: write, id-token: write }` (least privilege).
  - The deploy workflow uses OIDC for Pages auth (no long-lived secrets).
  - Pin actions by major version (`@v5`, `@v4`) — for stricter posture, pin by SHA per OWASP Top 10 CI/CD recommendations: https://owasp.org/www-project-top-10-ci-cd-security-risks/.
  - `concurrency: { group: pages, cancel-in-progress: true }` prevents two deploys racing.
- **`workflow_dispatch` exposure**: Allows manual deploys. Restrict via repo permissions; only collaborators with `write` can trigger. Acceptable.
- **Privacy**:
  - No analytics, no third-party scripts, no fonts.googleapis.com, no CDN. Zero third-party requests = zero leaked IPs.
  - Per GDPR / CJEU C-252/21 (2023), embedding Google Fonts without consent is unlawful in the EU. Self-hosting eliminates that risk entirely.
  - No cookies (only first-party `localStorage`). No consent banner required.
- **JSON-LD and PII leakage**: The JSON-LD Person schema includes name, employer, languages, and `sameAs` social URLs. This is **intentional public info** for ATS/SEO. Do not include email, phone, or address in JSON-LD. Tom's email appears only in `Contact.astro` as a `mailto:` link — also public-by-design on a CV site.
- **`mailto:` and scraping**: Bots scrape `mailto:` aggressively. Mitigations are weak (JS obfuscation, image-as-email) and harm accessibility. Accept the spam; rely on the mail provider's filtering.
- **Theme persistence and fingerprinting**: `prefers-color-scheme`, `prefers-reduced-motion`, `localStorage.theme` are read locally and never transmitted. No fingerprinting surface introduced.
- **OG image generation at build**: Reads woff2 files from `public/fonts/`. No network access, no user input. Safe.
- **Open Redirect**: No redirects at the application layer. GitHub Pages enforces same-origin. N/A.
- **CWE-915 (Mass assignment) / CWE-79 (XSS) / CWE-352 (CSRF)**: All N/A — static content, no forms, no state-changing endpoints.
- **Honesty audit as security control**: §2's grep gates (no "Jarvis", no "Swarm V0", no "Cloudflare Worker") are **integrity controls on public claims**. False statements on a CV are a reputational/legal risk; the gate enforces accuracy. Treat the audit as a security check, not just an editorial preference.

[opus + 1 tool call]

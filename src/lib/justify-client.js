/*
 * Knuth-Plass justification upgrade (tex-linebreak).
 *
 * The browser's native `text-align: justify` is a greedy line-breaker and leaves
 * wide inter-word gaps ("rivers"). This script re-lays the SAME elements the CSS
 * already justifies using the Knuth-Plass algorithm (as TeX/LaTeX use), which
 * balances spacing across the whole paragraph for even, book-like text.
 *
 * Design notes:
 *  - Source of truth is the CSS. We only upgrade elements whose *computed*
 *    text-align is `justify`. Below 600px the CSS sets it to `start`, so this is
 *    a no-op on mobile automatically.
 *  - We snapshot each element's original innerHTML + style attribute before
 *    touching it, so a resize across the 600px breakpoint (or an Astro view
 *    transition) can fully restore the pure-CSS state and re-evaluate.
 *  - Hyphenation patterns are lazy-loaded per page language (code-split), so each
 *    page only fetches the one dictionary it needs.
 *  - Runs on `astro:page-load` (initial load + every View Transition nav) and via
 *    a one-shot fallback on plain documents (the standalone workflow page).
 *  - Fails open: any error leaves the native CSS justification in place.
 */
import { createHyphenator, justifyContent } from 'tex-linebreak';

const CANDIDATE_SELECTOR =
  'p, li, dd, .lead, .lede, .sub, .blurb, .body, .note, .hero-lead, .sec-sub';

let origin = new Map(); // el -> { html, style }
let hyphenate = null;
let currentLang = null;
let lastWidth = 0;
let resizeWired = false;
let astroSeen = false;

function pageLang() {
  const l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  return ['en', 'de', 'fr', 'ru'].includes(l) ? l : 'en';
}

async function loadPatterns(lang) {
  switch (lang) {
    case 'de': return (await import('hyphenation.de')).default;
    case 'fr': return (await import('hyphenation.fr')).default;
    case 'ru': return (await import('hyphenation.ru')).default;
    default:   return (await import('hyphenation.en-us')).default;
  }
}

async function ensureHyphenate() {
  const lang = pageLang();
  if (hyphenate && currentLang === lang) return;
  currentLang = lang;
  hyphenate = createHyphenator(await loadPatterns(lang));
}

function snapshot(el) {
  if (!origin.has(el)) {
    origin.set(el, { html: el.innerHTML, style: el.getAttribute('style') });
  }
}

function restoreAll() {
  for (const [el, o] of origin) {
    if (!el.isConnected) continue;
    el.innerHTML = o.html;
    if (o.style == null) el.removeAttribute('style');
    else el.setAttribute('style', o.style);
  }
}

function collectParagraphs() {
  return Array.from(document.querySelectorAll(CANDIDATE_SELECTOR)).filter((el) => {
    if (getComputedStyle(el).textAlign !== 'justify') return false;
    const txt = el.textContent ? el.textContent.trim() : '';
    if (txt.length < 30) return false;               // skip tiny labels
    if (el.querySelector('p, li, dd')) return false; // target leaf prose, not wrappers
    return true;
  });
}

function run() {
  restoreAll();           // reset to pure-CSS state, then re-evaluate at current width
  if (!hyphenate) return;
  // Opt into all-width justification (incl. mobile). The `html.kp` CSS rule makes
  // mobile prose compute as `justify` so collectParagraphs() picks it up; the JS
  // then evens the spacing. If anything fails below, we drop the class so mobile
  // reverts to ragged rather than showing native-justify rivers.
  document.documentElement.classList.add('kp');
  const paras = collectParagraphs();
  if (!paras.length) return;
  // Record each element's correct (CSS) width BEFORE justifying. We are in the
  // pure-CSS state here (restoreAll ran above), so these are the right widths.
  const cssWidth = new Map(paras.map((el) => [el, el.getBoundingClientRect().width]));
  paras.forEach(snapshot);

  const revert = (el) => {
    const o = origin.get(el);
    if (!o) return;
    el.innerHTML = o.html;
    if (o.style == null) el.removeAttribute('style');
    else el.setAttribute('style', o.style);
  };

  try {
    justifyContent(paras, hyphenate);
    // Safety net: tex-linebreak wraps each line in a `white-space: nowrap` span.
    // If a line cannot be broken short enough (e.g. a long German compound word),
    // the element GROWS wider than its column, which can stretch parent containers
    // and cause horizontal page scroll. Revert any element that grew past its
    // CSS width back to native wrapping.
    for (const el of paras) {
      if (el.getBoundingClientRect().width - (cssWidth.get(el) || 0) > 1) revert(el);
    }
    // Last-resort: if the page still scrolls sideways, drop KP entirely here.
    const root = document.documentElement;
    if (root.scrollWidth - root.clientWidth > 1) {
      restoreAll();
      root.classList.remove('kp');
    }
  } catch (_e) {
    restoreAll();                                    // undo partial layout
    document.documentElement.classList.remove('kp'); // desktop keeps justify via @media; mobile -> ragged
  }
}

async function boot() {
  origin = new Map();     // previous document's elements are gone after a nav
  try {
    await ensureHyphenate();
  } catch (_e) {
    return;               // no hyphenator -> leave native CSS justification
  }
  lastWidth = window.innerWidth;
  run();

  if (!resizeWired) {
    resizeWired = true;
    let t;
    window.addEventListener('resize', () => {
      if (Math.abs(window.innerWidth - lastWidth) < 1) return; // ignore mobile URL-bar jitter
      lastWidth = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(run, 180);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => run()).catch(() => {});
  }
}

// Astro pages (ClientRouter): fires on initial load and after every navigation.
document.addEventListener('astro:page-load', () => { astroSeen = true; boot(); });

// Fallback for plain documents (the standalone workflow page) where astro:page-load
// never fires. Give Astro a tick first so we don't double-run on Astro pages.
function fallbackBoot() {
  setTimeout(() => { if (!astroSeen) boot(); }, 60);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fallbackBoot);
} else {
  fallbackBoot();
}

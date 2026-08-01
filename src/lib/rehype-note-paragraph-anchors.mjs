/* Give every top-level paragraph of an essay an address.
   ==========================================================================

   A reader replying to a 6000-word essay needs to be able to say WHICH part
   they are replying to. This adds `id="pN"` to each top-level paragraph and
   appends a small link to that id, so citing a passage is a copyable URL like
   /notes/token-economy-principle/#p12 rather than a paraphrase.

   BUILD TIME, NOT RUNTIME, and that is deliberate. The ids have to exist in
   the served bytes or a shared #p12 link resolves to nothing for a visitor
   with JavaScript off, for a crawler, and inside an email client's preview.
   The whole point of the address is that it survives being pasted somewhere
   this site does not control.

   APPENDED AS THE LAST CHILD, NOT PREPENDED, and this is load-bearing.
   components.css styles paragraph-initial run-in heads with
   `.note-article > p > strong:first-child` and gives them a wider interval via
   `p:has(> strong:first-child)`. There are 22 such lead-ins across five of the
   seven essays, mirrored in the translations. Prepending the anchor would make
   the <a> the first child, both selectors would stop matching, and the only
   authored hierarchy in six essays that contain zero headings would silently
   revert to default browser bold. Appending changes no existing selector.
   Where the marker APPEARS is a CSS question, and on a wide viewport it is
   lifted out of the flow into the left margin lane, so DOM order costs nothing.

   TOP-LEVEL ONLY. The transform walks the root's direct children, so a
   paragraph inside a blockquote or a list item is not numbered: those are not
   independent passages, and numbering them would make the sequence jump around
   in a way that is worse than not having it.

   The label is localized from the locale segment of the file path, because
   these files live at src/content/notes/<locale>/<slug>.md. There is no other
   locale signal available inside a rehype transform. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCALES = ['en', 'de', 'fr', 'ru'];
const LABEL_KEY = 'notes.detail.para.label';

/* Read the dictionaries rather than importing them. An `import ... with
   { type: 'json' }` inside a plugin loaded from astro.config.mjs is one more
   thing that can differ between the local node and the CI node; readFileSync
   behaves identically on both. */
const LABELS = Object.fromEntries(
  LOCALES.map((l) => {
    const dict = JSON.parse(readFileSync(resolve(HERE, `../i18n/${l}.json`), 'utf8'));
    return [l, dict[LABEL_KEY] ?? 'Paragraph {n}'];
  }),
);

const LOCALE_FROM_PATH = /[\\/]content[\\/]notes[\\/](en|de|fr|ru)[\\/]/;

export function rehypeNoteParagraphAnchors() {
  return function transform(tree, file) {
    const path = file?.path ?? file?.history?.[0] ?? '';
    const m = String(path).match(LOCALE_FROM_PATH);
    // Only the notes collection is numbered. Anything else passes through
    // untouched, so adding a second collection later cannot inherit this.
    if (!m) return;
    const label = LABELS[m[1]] ?? LABELS.en;

    let n = 0;
    for (const node of tree.children ?? []) {
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      // A paragraph holding nothing but an image is a figure, not a passage.
      const meaningful = (node.children ?? []).some(
        (c) => (c.type === 'text' && c.value.trim() !== '') ||
               (c.type === 'element' && c.tagName !== 'img'),
      );
      if (!meaningful) continue;

      n += 1;
      const id = `p${n}`;
      node.properties = { ...(node.properties ?? {}), id };
      node.children.push({
        type: 'element',
        tagName: 'a',
        properties: {
          className: ['para-anchor'],
          href: `#${id}`,
          'aria-label': label.replace('{n}', String(n)),
        },
        children: [{ type: 'text', value: String(n) }],
      });
    }
  };
}

export default rehypeNoteParagraphAnchors;

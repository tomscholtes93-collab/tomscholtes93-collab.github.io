/* The single configuration file for replies on the essays.
   ==========================================================================

   There are TWO layers, and they are independent on purpose.

   LAYER 1, always on, nothing to configure. `ReplySurface.astro` renders a
   reply block on every essay in all four locales: an addressable id on every
   paragraph, a link that opens a prefilled GitHub issue, and a mailto for a
   reader with no GitHub account. It is entirely static. No third-party script,
   no runtime origin, no rate limit, nothing that can die.

   LAYER 2, off until the four values below are filled in. giscus renders real
   threads under the reply block. It is off because it CANNOT be turned on from
   a terminal: the giscus GitHub App has to be installed on the repository
   through a browser OAuth grant, and `repoId` and `categoryId` have to be read
   off giscus.app. Shipping it enabled without those would ship a dead widget.
   Activation is four steps and they are written down in
   ~/assistant/orchestrator/jobs/wbm-frontdoor-comments-20260801/GISCUS-ACTIVATION.md.

   THREAD IDENTITY IS EFFECTIVELY PERMANENT. giscus finds a thread by matching
   a discussion title against `data-term`. Change the term after threads have
   accumulated and every existing thread is orphaned: the old discussions stay
   in the repository but no page finds them, and the next visitor starts an
   empty thread. There is no migration path short of renaming discussions by
   hand. So the term is chosen once, here, and it is the essay SLUG.

   The slug, NOT the pathname, and that is the whole reason `mapping` is
   'specific' rather than 'pathname'. Every essay exists at four addresses
   (/notes/x/, /de/notes/x/, /fr/notes/x/, /ru/notes/x/) and pathname mapping
   would give one essay four separate conversations, splitting a small audience
   four ways and hiding a German reader's reply from an English one. Mapping by
   slug gives one essay ONE conversation, which every locale of that essay
   joins. The per-locale `lang` still goes to giscus, so the widget's own
   chrome is translated even though the thread is shared.

   QUARANTINE. Comments are fetched and rendered CLIENT-SIDE, by giscus's own
   iframe, at read time. No externally authored byte is ever fetched at build
   time, written into src/content/notes/** or src/i18n/*.json, or committed.
   Those two trees are guarded by exit-1 build gates (check-notes.mjs,
   check-i18n.mjs), so a stranger's em-dash or a denylisted name landing there
   would be a deploy freeze any reader could trigger at will. This is not a
   preference; it is the reason the reply path is an outbound link and an
   iframe rather than a build input. */

export interface CommentsConfig {
  /** Layer 2 only. Layer 1 does not read this and is never disabled by it. */
  enabled: boolean;
  /** owner/name. Used by BOTH layers: Layer 1 builds its issue URL from it. */
  repo: string;
  /** From giscus.app after installing the app. Opaque node id, starts R_. */
  repoId: string;
  /** From giscus.app. The Discussions category to open threads in, starts DIC_. */
  categoryId: string;
}

export const comments: CommentsConfig = {
  enabled: false,
  repo: 'tomscholtes93-collab/tomscholtes93-collab.github.io',
  repoId: '',
  categoryId: '',
};

/** True only when Layer 2 has everything it needs. A half-filled config
    renders Layer 1 alone rather than a broken widget. */
export function giscusReady(c: CommentsConfig = comments): boolean {
  return c.enabled && c.repo.includes('/') && c.repoId !== '' && c.categoryId !== '';
}

/** The Layer 1 target: a prefilled issue on a public repository with Issues
    already enabled. `template` selects .github/ISSUE_TEMPLATE/essay-reply.yml,
    which is what applies the `reply` label; the label cannot be applied from a
    query parameter by someone without triage permission on the repository, so
    the template carries it instead. `essay` prefills the template's field of
    that id. If the template is ever renamed the link degrades to a blank issue
    form rather than to an error. */
export function replyIssueUrl(opts: { title: string; url: string }): string {
  const p = new URLSearchParams({
    template: 'essay-reply.yml',
    title: `Reply: ${opts.title}`,
    essay: opts.url,
  });
  return `https://github.com/${comments.repo}/issues/new?${p.toString()}`;
}

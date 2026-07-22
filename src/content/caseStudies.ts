export const CASE_IDS: readonly string[] = ['01', '02', '03', '04', '05', '06', '07'] as const;

// Language-agnostic detail-page slugs, keyed by case number. The detail pages
// live as standalone static HTML under public/case/<slug>/index.html and are
// served verbatim at the same URL for every locale (like /workflow-automation/).
export const CASE_SLUG: Record<string, string> = {
  '01': 'automated-regulatory-notes',
  '02': 'annual-accounts-quality-review',
  '03': 'confidential-document-anonymisation',
  '04': 'cross-platform-mailbox-intelligence',
  '05': 'process-documentation',
  '06': 'fund-accounting-platform-integration',
  '07': 'ai-skill-architecture',
  '08': 'cross-system-reconciliation',
  '09': 'email-automation',
};

// Cases 08 + 09 are pattern write-ups that are intentionally English-only across
// every locale (they are generic architecture sketches, not translated copy).
export interface ExtraCase {
  n: string;
  title: string;
  metric: string;
  label: string;
  blurb: string;
  tags: string[];
  slug: string;
}

export const EXTRA_CASES: ExtraCase[] = [
  {
    n: '08',
    title: 'Cross-system fund-data reconciliation architecture',
    metric: 'Pattern',
    label: 'designed',
    blurb:
      'Designed a bridging architecture for reconciling two source-of-truth platforms in a fund-administration setting while the underlying master data model was still being scoped. Generic pattern. Proposed internally; not deployed.',
    tags: ['Data integration', 'Master data', 'Internal proposal'],
    slug: 'cross-system-reconciliation',
  },
  {
    n: '09',
    title: 'End-to-end email automation',
    metric: 'Pattern',
    label: 'personal automation architecture',
    blurb:
      'An incoming message triggers an agent that fetches attachments, reads them, searches across knowledge systems, delegates research, and once the answer is well grounded drafts a reply and proposes which attachments to attach. A self-review loop runs the draft through a second model until it has no further comments, then hands a clean output to a human reviewer who owns the decision.',
    tags: ['Agentic', 'Self-review loop', 'Human-in-the-loop'],
    slug: 'email-automation',
  },
];

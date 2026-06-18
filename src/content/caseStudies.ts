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

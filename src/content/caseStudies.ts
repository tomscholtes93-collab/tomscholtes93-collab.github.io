export type CaseStudy = {
  n: string;
  title: string;
  metric: string;
  label: string;
  blurb: string;
  tags: string[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    n: '01',
    title: 'Automated Regulatory Notes Generation',
    metric: 'Indicative',
    label: 'order of magnitude time savings on this pattern',
    blurb:
      "A pattern for how a Claude skill can read a trial balance, identify entity type, and generate disclosure notes in a firm's chosen style. Tables, movement schedules, narrative.",
    tags: ['Claude skills', 'Word generation', 'LuxGAAP'],
  },
  {
    n: '02',
    title: 'Annual Accounts Quality Review',
    metric: 'Pre-audit',
    label: 'automated cross-checker',
    blurb:
      'How I think about pre-audit cross-checking. A pattern that takes annual accounts (PDF) and source reconciliation (Excel), checks every cross-reference between primary statements and notes, and flags inconsistencies before the auditor finds them.',
    tags: ['PDF parsing', 'Excel', 'QA automation'],
  },
  {
    n: '03',
    title: 'Confidential Document Anonymisation',
    metric: 'Hours to minutes',
    label: 'share registers for KYC/AML reviews',
    blurb:
      'A pattern for aggregating raw transactional share-register data into net positions per shareholder per share class, applying rule-based redaction for non-strategic shareholders, and producing print-ready Excel and PDF.',
    tags: ['Data aggregation', 'Compliance', 'Multi-format'],
  },
  {
    n: '04',
    title: 'Cross-Platform Mailbox Intelligence',
    metric: 'Daily',
    label: 'morning briefing automation',
    blurb:
      'A pattern for triaging email and meeting-transcript backlogs into prioritised morning briefings. Surfaces unanswered messages, follow-ups, and half-finished commitments, organised by priority and workstream.',
    tags: ['M365', 'Outlook', 'Triage'],
  },
  {
    n: '05',
    title: 'Process Documentation & Knowledge Transfer',
    metric: 'Onboarding',
    label: 'structured payment and accounting guide',
    blurb:
      'Patterns for documenting payment and accounting workflows in a way new joiners can self-serve. Payment flow, exception handling, approval routing, recharge and intercompany cases.',
    tags: ['Technical writing', 'Process mapping'],
  },
  {
    n: '06',
    title: 'Fund Accounting Platform Integration',
    metric: 'Implementation',
    label: 'contribution to platform rollout',
    blurb:
      "Patterns I've worked through during fund-accounting platform rollouts. Pref-share reconciliation logic, waterfall validation approaches, edge-case discovery.",
    tags: ['Reconciliation', 'Vendor collab', 'Validation'],
  },
  {
    n: '07',
    title: 'AI Skill Architecture & Reusable Tooling',
    metric: 'Library',
    label: 'of reusable Claude skill patterns',
    blurb:
      'A library of small, opinionated AI skill patterns. Notes generation, quality review, anonymisation, mailbox triage, classification. Each with deterministic inputs and outputs. From single-purpose skills to five-persona orchestration → DevSwarm v1, see Projects.',
    tags: ['Skill design', 'Knowledge eng.', 'Infrastructure'],
  },
  {
    n: '08',
    title: 'Investran ↔ Dealsplus composite-keys bridge',
    metric: 'Pattern',
    label: 'designed',
    blurb:
      'Designed a composite-keys bridging architecture for Investran ↔ Dealsplus reconciliation while the instrument master was still being scoped. Proposed internally; not deployed.',
    tags: ['Data integration', 'Composite keys', 'Internal proposal'],
  },
];

export type Headline = { key: string; pre: string; em: string; post: string; label: string };

export const HEADLINES: Record<string, Headline> = {
  editorial: {
    key: 'editorial',
    pre: 'Six years in Luxembourg fund services, ',
    em: 'quietly',
    post: ' automating the desk underneath me.',
    label: 'Editorial · "quietly automating"',
  },
  bold: {
    key: 'bold',
    pre: 'Building AI tools for ',
    em: 'the work',
    post: ' I do every day.',
    label: 'Bold · "for the work"',
  },
  plain: {
    key: 'plain',
    pre: 'Finance operations, ',
    em: 'augmented by AI',
    post: '.',
    label: 'Plain · "augmented by AI"',
  },
  punchy: {
    key: 'punchy',
    pre: 'Less manual work. ',
    em: 'More controls',
    post: ' that hold.',
    label: 'Punchy · "controls that hold"',
  },
};

export const DEFAULT_HEADLINE = 'editorial';

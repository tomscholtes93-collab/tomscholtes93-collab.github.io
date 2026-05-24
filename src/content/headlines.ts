export type HeadlineId = 'editorial' | 'bold' | 'plain' | 'punchy';

export const HEADLINE_IDS: readonly HeadlineId[] = ['editorial', 'bold', 'plain', 'punchy'] as const;

export const DEFAULT_HEADLINE: HeadlineId = 'editorial';

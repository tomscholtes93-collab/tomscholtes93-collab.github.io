export type NowId = 'working' | 'building' | 'running' | 'learning' | 'offclock';

export const NOW_IDS: readonly NowId[] = ['working', 'building', 'running', 'learning', 'offclock'] as const;

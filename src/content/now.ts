export type NowId = 'email' | 'frontier' | 'orchestration' | 'compute' | 'research';

export const NOW_IDS: readonly NowId[] = ['email', 'frontier', 'orchestration', 'compute', 'research'] as const;

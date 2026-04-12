import { createQueryKeys } from '@Api/utils';

export const interactionsKeys = createQueryKeys({
	commentsByPoem: (poemId: string, params?: { parentId?: string }) =>
		['interactions', 'poem-comments', poemId, params?.parentId ?? null] as const,
});

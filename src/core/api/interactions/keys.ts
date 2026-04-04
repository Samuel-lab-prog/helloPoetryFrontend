import { createQueryKeys } from '@Api/utils';

export const interactionsKeys = createQueryKeys({
	commentsByPoem: (poemId: string, parentId?: string) =>
		['interactions', 'poem-comments', poemId, parentId ?? null] as const,
});

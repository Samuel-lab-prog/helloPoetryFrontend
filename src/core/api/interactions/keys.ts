import { createQueryKeys } from '../utils';

export const interactionsKeys = createQueryKeys({
	commentsByPoem: (poemId: string, parentId?: string) =>
		['interactions', 'poem-comments', poemId, parentId ?? null] as const,
});

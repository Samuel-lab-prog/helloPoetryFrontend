import { createQueryKeys } from '@Api/utils';

export const interactionsKeys = createQueryKeys({
	commentsBase: () => ['interactions', 'poem-comments'] as const,
	commentsByPoem: (poemId: string, params?: { parentId?: string; authScope?: string }) =>
		[
			'interactions',
			'poem-comments',
			poemId,
			params?.parentId ?? null,
			params?.authScope ?? null,
		] as const,
});

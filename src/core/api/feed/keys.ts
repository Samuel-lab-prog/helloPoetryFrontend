import { createQueryKeys } from '@Api/utils';

export const feedKeys = createQueryKeys({
	all: () => ['feed'] as const,
	home: (params: { isAuthenticated: boolean; userId: number | null; limit: number }) =>
		['home-feed', params] as const,
	homeBase: () => ['home-feed'] as const,
});

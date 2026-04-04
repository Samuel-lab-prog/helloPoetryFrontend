import { createQueryKeys } from '@Api/utils';

export const feedKeys = createQueryKeys({
	all: () => ['feed'] as const,
});

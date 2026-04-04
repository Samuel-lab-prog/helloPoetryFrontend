import { createQueryKeys } from '@Api/utils';

export const authKeys = createQueryKeys({
	all: () => ['auth'] as const,
});

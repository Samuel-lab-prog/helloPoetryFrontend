import { createQueryKeys } from '@core/api/utils';

export const feedKeys = createQueryKeys({
	all: () => ['feed'] as const,
});

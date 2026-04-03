import { createQueryKeys } from '@core/api/utils';

export const friendsKeys = createQueryKeys({
	all: () => ['friends'] as const,
	requests: () => ['friends', 'requests'] as const,
});

import { createQueryKeys } from '../utils';

export const friendsKeys = createQueryKeys({
	all: () => ['friends'] as const,
	requests: () => ['friends', 'requests'] as const,
});

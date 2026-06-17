import { createQueryKeys } from '@Api/utils';

export const moderationKeys = createQueryKeys({
	all: () => ['moderation'] as const,
	pendingPoems: () => ['moderation', 'pending-poems'] as const,
	userSanctions: (userId: string) => ['moderation', 'users', userId, 'sanctions'] as const,
	userSanctionStatus: (userId: string) =>
		['moderation', 'users', userId, 'sanctions', 'active'] as const,
});

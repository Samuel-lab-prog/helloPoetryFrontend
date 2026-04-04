import { createQueryKeys } from '@Api/utils';

export const moderationKeys = createQueryKeys({
	all: () => ['moderation'] as const,
	pendingPoems: () => ['moderation', 'pending-poems'] as const,
});

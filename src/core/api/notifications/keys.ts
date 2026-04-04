import { createQueryKeys } from '@Api/utils';

export const notificationsKeys = createQueryKeys({
	all: () => ['notifications'] as const,
	byId: (id: string) => ['notification', id] as const,
	page: (params?: { onlyUnread?: boolean; limit?: number; nextCursor?: string }) =>
		['notifications', 'page', params ?? {}] as const,
});

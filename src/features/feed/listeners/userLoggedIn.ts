import { feedKeys } from '@features/feed/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

const homeFeedKey = (userId: number, limit = 8) =>
	['home-feed', { isAuthenticated: true, userId, limit }] as const;

export async function onUserLoggedIn(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: feedKeys.all() }),
		queryClient.invalidateQueries({ queryKey: homeFeedKey(payload.userId) }),
	]);
}

import { friends } from '@features/friends/api/endpoints';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onUserLoggedIn(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	void queryClient;
	void payload;
	await friends.getMyFriendRequests.prefetch();
}

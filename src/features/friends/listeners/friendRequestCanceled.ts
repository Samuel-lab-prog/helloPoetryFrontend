import { friendsKeys } from '@features/friends/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onFriendRequestCanceled(
	queryClient: QueryClient,
	payload: AppEvents['friendRequestCanceled'],
): Promise<void> {
	void payload;
	await queryClient.refetchQueries({ queryKey: friendsKeys.requests() });
}

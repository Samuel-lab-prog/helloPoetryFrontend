import { friendsKeys } from '@features/friends/api/keys';
import { userKeys } from '@features/users/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onFriendRequestCanceled(
	queryClient: QueryClient,
	payload: AppEvents['friendRequestCanceled'],
): Promise<void> {
	const profileKey = userKeys.profile(String(payload.authorId));

	await Promise.all([
		queryClient.refetchQueries({ queryKey: friendsKeys.requests() }),
		queryClient.refetchQueries({ queryKey: profileKey }),
	]);
}

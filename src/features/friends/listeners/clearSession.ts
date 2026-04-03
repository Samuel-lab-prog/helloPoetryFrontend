import { friendsKeys } from '@features/friends/api/keys';
import type { QueryClient } from '@tanstack/react-query';

export async function clearFriendsSessionQueries(queryClient: QueryClient): Promise<void> {
	const key = friendsKeys.requests();
	await queryClient.cancelQueries({ queryKey: key });
	queryClient.removeQueries({ queryKey: key });
}

import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { feedKeys } from '@root/features/feed/api/keys';
import { friendsKeys } from '@root/features/friends/api/keys';
import { notificationsKeys } from '@root/features/notifications/api/keys';
import { poemKeys } from '@root/features/poems/api/keys';
import { userKeys } from '@root/features/users/api/keys';
import type { QueryClient } from '@tanstack/react-query';

export async function clearSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [
		poemKeys.mine(),
		poemKeys.saved(),
		poemKeys.collections(),
		friendsKeys.requests(),
		notificationsKeys.all(),
		feedKeys.all(),
		['home-feed'] as const,
		userKeys.anyProfile(),
		userKeys.anySearch(),
	];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

export function clearStoredSessionData(): void {
	useUserBootstrapStore.getState().clearBootstrap();
	useAuthClientStore.getState().setUnreadNotificationsCount(0);
}

export async function clearUserDataFromCache(queryClient: QueryClient): Promise<void> {
	clearStoredSessionData();
	await clearSessionQueries(queryClient);
}

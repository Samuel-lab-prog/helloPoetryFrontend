import { apiKeys } from '@root/core/api';
import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import type { QueryClient } from '@tanstack/react-query';

export async function clearSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [
		apiKeys.poems.mine(),
		apiKeys.poems.saved(),
		apiKeys.poems.collections(),
		apiKeys.friends.requests(),
		apiKeys.notifications.all(),
		apiKeys.feed.all(),
		['home-feed'] as const,
		apiKeys.users.anyProfile(),
		apiKeys.users.anySearch(),
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

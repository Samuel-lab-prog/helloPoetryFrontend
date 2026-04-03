import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { userKeys } from '@features/users/api/keys';
import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import type { QueryClient } from '@tanstack/react-query';

export async function clearSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [userKeys.anyProfile(), userKeys.anySearch()];

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

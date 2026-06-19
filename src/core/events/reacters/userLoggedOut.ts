import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import type { AppEvents } from '@root/core/events/eventBus';
import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import type { QueryClient } from '@tanstack/react-query';

import { clearSessionBoundQueries } from './sessionQueries';

function clearStoredSessionData(): void {
	useUserBootstrapStore.getState().clearBootstrap();
	useAuthClientStore.getState().setUnreadNotificationsCount(0);
}

export async function onUserLoggedOut(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedOut'],
): Promise<void> {
	void payload;

	clearStoredSessionData();
	await clearSessionBoundQueries(queryClient);
}

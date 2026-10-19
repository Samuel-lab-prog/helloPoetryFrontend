import type { AppEvents } from '@root/core/events/eventBus';
import { getAuthSessionPort } from '@root/core/ports/authSession';
import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import type { QueryClient } from '@tanstack/react-query';

import { clearSessionBoundQueries } from './sessionQueries';

function clearStoredSessionData(): void {
	useUserBootstrapStore.getState().clearBootstrap();
	getAuthSessionPort().setUnreadNotificationsCount(0);
}

export async function onUserLoggedOut(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedOut'],
): Promise<void> {
	void payload;

	clearStoredSessionData();
	await clearSessionBoundQueries(queryClient);
}

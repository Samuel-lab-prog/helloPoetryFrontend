import type { AuthClient } from '@Api/auth/types';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';

export const defaultTestAuthClient: AuthClient = {
	id: 123,
	role: 'author',
	status: 'active',
};

export function clearTestAuthClient() {
	window.localStorage.clear();
	useAuthClientStore.setState({
		authClient: null,
		unreadNotificationsCount: 0,
	});
}

export function getTestAuthClient(): AuthClient | null {
	return useAuthClientStore.getState().authClient;
}

export function getTestUnreadNotificationsCount(): number {
	return useAuthClientStore.getState().unreadNotificationsCount;
}

export function setTestAuthClient(
	client: AuthClient = defaultTestAuthClient,
	unreadNotificationsCount = 0,
) {
	useAuthClientStore.setState({
		authClient: client,
		unreadNotificationsCount,
	});
}

export function setTestAuthStatus(
	status: AuthClient['status'],
	client: AuthClient = defaultTestAuthClient,
) {
	setTestAuthClient({
		...client,
		status,
	});
}

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

export function setTestAuthClient(
	client: AuthClient = defaultTestAuthClient,
	unreadNotificationsCount = 0,
) {
	useAuthClientStore.setState({
		authClient: client,
		unreadNotificationsCount,
	});
}

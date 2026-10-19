import type { AuthSessionPort } from '@core/ports/authSession';

import { useAuthClientStore } from '../public/stores/useAuthClientStore';
import { getAuthCacheScope } from '../public/utils/authCacheScope';

export const authSessionPort: AuthSessionPort = {
	getCurrentIdentity: () => {
		const authClient = useAuthClientStore.getState().authClient;
		return authClient ? { id: authClient.id, status: authClient.status } : null;
	},
	getCurrentCacheScope: () => getAuthCacheScope(useAuthClientStore.getState().authClient),
	setUnreadNotificationsCount: (count) =>
		useAuthClientStore.getState().setUnreadNotificationsCount(count),
	clearAuthClient: () => useAuthClientStore.getState().clearAuthClient(),
};

import { ErrorPage } from '@core/pages/Error';
import { eventBus } from '@root/core/events/eventBus';

import { useAuthClientStore } from '../stores/useAuthClientStore';
import { resolveAuthRouteError } from '../utils/routeErrorPresentation';

export function AuthRouteErrorPage() {
	function handleSessionExpired() {
		const authStore = useAuthClientStore.getState();
		const userId = authStore.authClient?.id ?? null;
		authStore.clearAuthClient();
		void eventBus.publish('userLoggedOut', {
			userId,
			reason: 'sessionExpired',
			loggedOutAt: new Date().toISOString(),
		});
	}

	return (
		<ErrorPage resolveAuthError={resolveAuthRouteError} onSessionExpired={handleSessionExpired} />
	);
}

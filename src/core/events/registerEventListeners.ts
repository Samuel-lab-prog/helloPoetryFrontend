import type { QueryClient } from '@tanstack/react-query';
import { eventBus } from './eventBus';
import { bootstrapUserDataOnLogin, clearUserDataFromCache } from './reacters';

export function registerEventListeners(queryClient: QueryClient): void {
	eventBus.subscribe('userLoggedIn', bootstrapUserDataOnLogin.bind(null, queryClient));
	eventBus.subscribe('userLoggedOut', clearUserDataFromCache.bind(null, queryClient));
}

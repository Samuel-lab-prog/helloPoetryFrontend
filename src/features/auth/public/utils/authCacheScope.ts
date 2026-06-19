import type { AuthClient } from '@Api/auth/types';

import { useAuthClientStore } from '../stores/useAuthClientStore';

export const ANONYMOUS_AUTH_CACHE_SCOPE = 'anonymous';

type AuthCacheClient = Pick<AuthClient, 'id' | 'status'> | null | undefined;

export function getAuthCacheScope(authClient: AuthCacheClient): string {
	const id = authClient?.id;
	if (!id || id <= 0) return ANONYMOUS_AUTH_CACHE_SCOPE;
	return `user:${id}:${authClient.status}`;
}

export function getCurrentAuthCacheScope(): string {
	return getAuthCacheScope(useAuthClientStore.getState().authClient);
}

export function useAuthCacheScope(): string {
	return useAuthClientStore((state) => getAuthCacheScope(state.authClient));
}

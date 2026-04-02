import { useAuthClientStore } from '../stores/useAuthClientStore';

/**
 * Custom hook to check if the user is authenticated.
 * @returns A boolean indicating whether the user is authenticated.
 */
export function useIsAuthenticated(): boolean {
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);
	const isAuthenticated = authClientId > 0;
	return isAuthenticated;
}

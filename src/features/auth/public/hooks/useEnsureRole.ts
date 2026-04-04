import type { UserRole } from '@Api/users/types';

import { useAuthClientStore } from '../../public/stores/useAuthClientStore';

/**
 * Custom hook to check if the current user has one of the allowed roles.
 * @param allowedRoles - An array of roles that are allowed access.
 * @returns A boolean indicating whether the user has an allowed role.
 */
export function useEnsureRole(allowedRoles: UserRole[]): boolean {
	const authClient = useAuthClientStore((state) => state.authClient);
	if (!authClient) return false;
	return allowedRoles.includes(authClient.role);
}

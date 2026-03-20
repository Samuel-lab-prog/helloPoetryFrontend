import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import type { UserRole } from '@root/core/api/users/types';

export function useEnsureRole(allowedRoles: UserRole[]): boolean {
	const authClient = useAuthClientStore((state) => state.authClient);
	if (!authClient) return false;
	return allowedRoles.includes(authClient.role);
}

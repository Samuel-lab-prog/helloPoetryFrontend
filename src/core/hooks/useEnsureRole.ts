import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';

type UserRole = 'admin' | 'moderator' | 'user';

export function useEnsureRole(allowedRoles: UserRole[]): boolean {
	const authClient = useAuthClientStore((state) => state.authClient);
  if (!authClient) return false;
	return allowedRoles.includes(authClient.role);
}



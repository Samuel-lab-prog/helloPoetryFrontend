import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import type { UserPrivateProfile } from '@Api/users/types';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useQuery } from '@tanstack/react-query';

export function useMyProfile() {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: userKeys.profile(String(clientId)),
		enabled: !!clientId,
		staleTime: Infinity,
		queryFn: () =>
			users.getProfile.query(String(clientId)).queryFn() as Promise<UserPrivateProfile>,
	});

	return {
		profile: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isMissingClient: !clientId,
		refetch: query.refetch,
	};
}

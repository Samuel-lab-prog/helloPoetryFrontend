import { useQuery } from '@tanstack/react-query';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { api } from '@root/core/api';

export function useMyPoems(enabled = true) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		...api.poems.getMyPoems.query(),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
	});

	return {
		poems: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

import { useQuery } from '@tanstack/react-query';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api } from '@root/core/api';

export function useMyPoems(enabled = true) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: ['my-poems', clientId],
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5,
		queryFn: () => api.poems.getMyPoems.query().queryFn(),
	});

	return {
		poems: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

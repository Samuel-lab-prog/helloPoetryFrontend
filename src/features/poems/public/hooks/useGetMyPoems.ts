import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { poems } from '@root/features/poems/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export function useMyPoems(enabled = true) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		...poems.getMyPoems.query(),
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

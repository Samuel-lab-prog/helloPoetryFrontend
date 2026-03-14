import { useQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';

export function usePoem(id: number) {
	const stringId = String(id);
	const query = useQuery({
		queryKey: api.poems.getPoem.query(stringId).queryKey,
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		enabled: !!id,
		queryFn: () => api.poems.getPoem.query(stringId).queryFn(),
	});
	return {
		poem: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

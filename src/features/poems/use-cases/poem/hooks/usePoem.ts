import { api } from '@root/core/api';
import { useQuery } from '@tanstack/react-query';

export function usePoem(id: number) {
	const stringId = String(id);
	const query = useQuery({
		...api.poems.getPoem.query(stringId),
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		enabled: !!id,
	});
	return {
		poem: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

import { useQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';

export function useAuthorPoems(authorId: number) {
	const query = useQuery({
		...api.poems.getAuthorPoems.query(String(authorId)),
		retry: 2,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return {
		poems: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

import { useQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';

export function useAuthorPoems(authorId: number) {
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;

	const query = useQuery({
		queryKey: ['author-poems', authorId],
		enabled: isValidAuthorId,
		retry: 2,
		staleTime: 1000 * 60 * 5,
		queryFn: () => api.poems.getAuthorPoems.query(String(authorId)).queryFn(),
	});

	return {
		poems: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

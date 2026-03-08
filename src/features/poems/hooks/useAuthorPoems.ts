import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPoemType } from '../types';

export function useAuthorPoems(authorId: number) {
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;

	const query = useQuery({
		queryKey: ['author-poems', authorId],
		enabled: isValidAuthorId,
		retry: 2,
		staleTime: 1000 * 60 * 5,
		queryFn: () =>
			createHTTPRequest<FullPoemType[]>({
				path: '/poems/authors',
				params: [authorId],
			}),
	});

	return {
		poems: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

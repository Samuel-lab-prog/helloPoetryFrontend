import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPoemType } from '../types/types';

export function useAuthorPoems(authorId: number) {
	const query = useQuery({
		queryKey: ['author-poems', authorId],
		enabled: !!authorId,
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

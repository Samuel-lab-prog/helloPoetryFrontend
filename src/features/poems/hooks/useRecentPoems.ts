import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { PaginatedPoemsType } from '../types';

type UseRecentPoemsOptions = {
	limit?: number;
};

export function useRecentPoems({ limit = 4 }: UseRecentPoemsOptions) {
	const query = useQuery({
		queryKey: ['poems-recent', { limit }],
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		queryFn: () =>
			createHTTPRequest<PaginatedPoemsType>({
				path: '/poems',
				query: { limit, orderBy: 'createdAt', orderDirection: 'desc' },
			}),
	});

	return {
		poems: query.data?.poems ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

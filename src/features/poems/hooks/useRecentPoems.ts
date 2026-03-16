import { useQuery } from '@tanstack/react-query';
import type { PaginatedPoemsType } from '../types';
import { api } from '@root/core/api';

type UseRecentPoemsOptions = {
	limit?: number;
};

export function useRecentPoems({ limit = 4 }: UseRecentPoemsOptions) {
	const query = useQuery({
		queryKey: ['poems-recent', { limit }],
		retry: 3,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		queryFn: () =>
			api.poems.getPoems
				.query({ limit, orderBy: 'createdAt', orderDirection: 'desc' })
				.queryFn() as Promise<PaginatedPoemsType>,
	});

	return {
		poems: query.data?.poems ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

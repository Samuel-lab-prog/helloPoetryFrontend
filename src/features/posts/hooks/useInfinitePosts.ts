import { useInfiniteQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { PaginatedPoemsType } from '../types/types';

type OrderOption = 'newest' | 'oldest';
type UseInfinitePostsOption = {
	order: OrderOption;
	limit?: number;
};

export function useInfinitePosts({ order, limit = 8 }: UseInfinitePostsOption) {
	const query = useInfiniteQuery({
		queryKey: ['poems', { order, limit }],
		staleTime: 1000 * 60 * 60 * 24 * 7,
		retry: 3,
		initialPageParam: undefined as number | undefined,

		queryFn: ({ pageParam }) =>
			createHTTPRequest<PaginatedPoemsType>({
				path: '/poems',
				query: {
					limit,
					cursor: pageParam,
					orderBy: 'createdAt',
					orderDirection: order === 'newest' ? 'desc' : 'asc',
				},
			}),

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	return {
		poems: query.data?.pages.flatMap((page) => page.poems) ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		fetchNextPage: query.fetchNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage: query.hasNextPage,
	};
}

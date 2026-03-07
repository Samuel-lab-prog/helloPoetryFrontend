import { useInfiniteQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { PaginatedPostsType } from '../types/types';

type OrderOption = 'newest' | 'oldest';
type UseInfinitePostsOption = {
	tag?: string;
	order: OrderOption;
	limit?: number;
};

export function useInfinitePosts({
	tag,
	order,
	limit = 8,
}: UseInfinitePostsOption) {
	const query = useInfiniteQuery({
		queryKey: ['posts', { tag, order, limit }],
		staleTime: 1000 * 60 * 60 * 24 * 7,
		retry: 3,
		initialPageParam: undefined as number | undefined,

		queryFn: ({ pageParam }) =>
			createHTTPRequest<PaginatedPostsType>({
				path: '/posts',
				query: {
					limit,
					cursor: pageParam,
					tag,
					orderBy: 'createdAt',
					orderDirection: order === 'newest' ? 'desc' : 'asc',
				},
			}),

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	return {
		posts: query.data?.pages.flatMap((page) => page.posts) ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		fetchNextPage: query.fetchNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage: query.hasNextPage,
	};
}

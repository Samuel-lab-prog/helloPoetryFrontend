import { useInfiniteQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { PaginatedPoemsType } from '../types';

type OrderOption = 'newest' | 'oldest';
type UseInfinitePoemsOption = {
	order: OrderOption;
	tags?: string[];
	searchTitle?: string;
	limit?: number;
};

export function useInfinitePoems({
	order,
	tags = [],
	searchTitle = '',
	limit = 8,
}: UseInfinitePoemsOption) {
	const normalizedTags = tags.map((tag) => tag.trim()).filter(Boolean);
	const normalizedSearchTitle = searchTitle.trim();

	const query = useInfiniteQuery({
		queryKey: [
			'poems',
			{
				order,
				tags: normalizedTags,
				searchTitle: normalizedSearchTitle,
				limit,
			},
		],
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
					tags: normalizedTags.length > 0 ? normalizedTags : undefined,
					searchTitle: normalizedSearchTitle || undefined,
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

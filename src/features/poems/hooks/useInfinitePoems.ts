import { useInfiniteQuery } from '@tanstack/react-query';
import type { PaginatedPoemsType } from '../types';
import { api } from '@root/core/api';

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
			api.poems.getPoems
				.query({
					limit,
					cursor: pageParam,
					orderBy: 'createdAt',
					orderDirection: order === 'newest' ? 'desc' : 'asc',
					tags: normalizedTags.length > 0 ? normalizedTags : undefined,
					searchTitle: normalizedSearchTitle || undefined,
				})
				.queryFn() as Promise<PaginatedPoemsType>,

		getNextPageParam: (lastPage) => {
			if (!lastPage.hasMore) return undefined;
			return lastPage.nextCursor ?? lastPage.poems.at(-1)?.id ?? undefined;
		},
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

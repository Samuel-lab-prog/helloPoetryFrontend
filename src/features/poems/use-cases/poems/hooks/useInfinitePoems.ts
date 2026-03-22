import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@root/core/api';
import type { PaginatedPoemsType } from '../../../types';
import type { OrderOption } from './usePoemsFilters';

type UseInfinitePoemsOption = {
	order: OrderOption;
	tags?: string[];
	searchTitle?: string;
	limit?: number;
};

type PoemsSearchParams = {
	limit: number;
	orderBy: 'createdAt';
	orderDirection: 'asc' | 'desc';
	tags?: string[];
	searchTitle?: string;
};

function normalizeTags(tags: string[]) {
	return tags.map((tag) => tag.trim()).filter(Boolean);
}

function normalizeSearchTitle(searchTitle: string) {
	return searchTitle.trim() || undefined;
}

function getBaseParams(
	order: OrderOption,
	limit: number,
	tags: string[],
	searchTitle: string | undefined,
): PoemsSearchParams {
	return {
		limit,
		orderBy: 'createdAt',
		orderDirection: order === 'newest' ? 'desc' : 'asc',
		tags: tags.length > 0 ? tags : undefined,
		searchTitle,
	};
}

function getNextCursor(lastPage: PaginatedPoemsType) {
	if (!lastPage.hasMore) return undefined;
	// Fallback to last poem id when the API does not return nextCursor.
	return lastPage.nextCursor ?? lastPage.poems.at(-1)?.id ?? undefined;
}

export function useInfinitePoems({
	order,
	tags = [],
	searchTitle = '',
	limit = 8,
}: UseInfinitePoemsOption) {
	const normalizedTags = normalizeTags(tags);
	const normalizedSearchTitle = normalizeSearchTitle(searchTitle);
	const baseParams = getBaseParams(order, limit, normalizedTags, normalizedSearchTitle);

	const query = useInfiniteQuery({
		// Keep the cache key aligned with the API query shape.
		queryKey: api.poems.getPoems.query(baseParams).queryKey,
		staleTime: 1000 * 60 * 60 * 24 * 7,
		retry: 3,
		initialPageParam: undefined as number | undefined,

		queryFn: ({ pageParam }) =>
			api.poems.getPoems
				.query({
					...baseParams,
					cursor: pageParam,
				})
				.queryFn() as Promise<PaginatedPoemsType>,

		getNextPageParam: getNextCursor,
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

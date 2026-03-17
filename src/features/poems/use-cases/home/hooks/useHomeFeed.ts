import { useQuery } from '@tanstack/react-query';
import { type AppErrorType } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api } from '@root/core/api';
import type { FeedPoemType, PaginatedPoemsType, PoemPreviewType } from '../../../types';

type FeedSource = 'feed' | 'recent';

type UseHomeFeedOptions = {
	isAuthenticated: boolean;
	limit?: number;
};

function toPoemPreviewType(item: FeedPoemType): PoemPreviewType {
	return {
		id: item.id,
		title: item.title,
		slug: item.slug,
		createdAt: item.createdAt,
		likesCount: item.likesCount,
		commentsCount: item.commentsCount,
		tags: item.tags.map((name, index) => ({
			id: index + 1,
			name,
		})),
		author: {
			id: item.author.id,
			name: item.author.name,
			nickname: item.author.nickname,
			avatarUrl: item.author.avatarUrl,
		},
	};
}

export function useHomeFeed({ isAuthenticated, limit = 8 }: UseHomeFeedOptions) {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: ['home-feed', { isAuthenticated, userId: clientId, limit }],
		retry: 2,
		staleTime: 1000 * 60 * 5,
		queryFn: async (): Promise<{
			source: FeedSource;
			poems: PoemPreviewType[];
		}> => {
			if (isAuthenticated) {
				try {
					const payload = (await api.feed.getFeed.query().queryFn()) as FeedPoemType[];
					return { source: 'feed', poems: payload.map(toPoemPreviewType) };
				} catch (error) {
					const appError = error as AppErrorType;
					if (
						appError.statusCode !== 401 &&
						appError.statusCode !== 403 &&
						appError.statusCode !== 404
					) {
						throw error;
					}
				}
			}

			const payload = (await api.poems.getPoems
				.query({
					limit,
					orderBy: 'createdAt',
					orderDirection: 'desc',
				})
				.queryFn()) as PaginatedPoemsType;
			return { source: 'recent', poems: payload.poems ?? [] };
		},
	});

	return {
		poems: query.data?.poems ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isPersonalizedFeed: query.data?.source === 'feed',
	};
}

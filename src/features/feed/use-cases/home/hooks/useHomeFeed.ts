import { feed } from '@Api/feed/endpoints';
import { feedKeys } from '@Api/feed/keys';
import { getPoemsQueryPort } from '@core/ports/poems';
import { useAuthCacheScope } from '@features/auth/public';
import type { PaginatedPoemsType, PoemPreviewType } from '@features/poems/public/types';
import type { FeedPoem } from '@root/core/api/feed/types';
import { useQuery } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

type FeedSource = 'feed' | 'recent';

type UseHomeFeedOptions = {
	isAuthenticated: boolean;
	limit?: number;
};

type HomeFeedResult = {
	source: FeedSource;
	poems: PoemPreviewType[];
};

function toPoemPreviewType(item: FeedPoem): PoemPreviewType {
	return {
		id: item.id,
		title: item.title,
		slug: item.slug,
		excerpt: item.excerpt ?? null,
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

function shouldFallbackToRecent(error: unknown) {
	const appError = error as AppErrorType;
	return appError.statusCode === 404;
}

async function fetchPersonalizedFeed(): Promise<PoemPreviewType[]> {
	const payload = (await feed.getFeed.query().queryFn()) as FeedPoem[];
	return payload.map(toPoemPreviewType);
}

async function fetchRecentPoems(limit: number): Promise<PoemPreviewType[]> {
	const poemsQueryPort = getPoemsQueryPort();
	const payload = (await poemsQueryPort.getRecentPoems({ limit })) as PaginatedPoemsType;
	return payload.poems ?? [];
}

export function useHomeFeed({ isAuthenticated, limit = 8 }: UseHomeFeedOptions) {
	const authScope = useAuthCacheScope();

	const query = useQuery({
		queryKey: feedKeys.home({ isAuthenticated, authScope, limit }),
		retry: 2,
		staleTime: 1000 * 60 * 5,
		queryFn: async (): Promise<HomeFeedResult> => {
			if (isAuthenticated) {
				try {
					const poems = await fetchPersonalizedFeed();
					return { source: 'feed', poems };
				} catch (error) {
					if (!shouldFallbackToRecent(error)) throw error;
				}
			}

			const poems = await fetchRecentPoems(limit);
			return { source: 'recent', poems };
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

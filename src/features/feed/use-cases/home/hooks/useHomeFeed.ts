import { feed } from '@Api/feed/endpoints';
import { getPoemsQueryPort } from '@core/ports/poems';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
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
	// Auth-related errors (or missing feed) should fall back to a public recent feed.
	return appError.statusCode === 401 || appError.statusCode === 403 || appError.statusCode === 404;
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
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		// Include auth + user in key so the cache refreshes when identity changes.
		queryKey: ['home-feed', { isAuthenticated, userId: clientId, limit }],
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

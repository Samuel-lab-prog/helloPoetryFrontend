import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';
import type { PaginatedPoemsType, PoemPreviewType } from '../types/types';

type FeedSource = 'feed' | 'recent';

type UseHomeFeedOptions = {
	isAuthenticated: boolean;
	limit?: number;
};

type RawFeedPoem = {
	id: number;
	title: string;
	slug: string;
	tags?: string[];
	author?: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl?: string | null;
	};
};

function toPoemPreviewType(item: RawFeedPoem): PoemPreviewType {
	return {
		id: item.id,
		title: item.title,
		slug: item.slug,
		tags: (item.tags ?? []).map((name, index) => ({
			id: index + 1,
			name,
		})),
		author: {
			id: item.author?.id ?? -1,
			name: item.author?.name ?? 'Autor desconhecido',
			nickname: item.author?.nickname ?? 'desconhecido',
			avatarUrl: item.author?.avatarUrl ?? '',
		},
	};
}

function normalizePoemsPayload(payload: unknown): PoemPreviewType[] {
	const mapArray = (items: unknown[]) =>
		items
			.filter((item): item is RawFeedPoem => {
				if (!item || typeof item !== 'object') return false;
				const poem = item as Record<string, unknown>;
				return (
					typeof poem.id === 'number' &&
					typeof poem.title === 'string' &&
					typeof poem.slug === 'string'
				);
			})
			.map(toPoemPreviewType);

	if (Array.isArray(payload)) return mapArray(payload);

	if (!payload || typeof payload !== 'object') {
		return [];
	}

	const data = payload as Record<string, unknown>;

	if (Array.isArray(data.poems)) return mapArray(data.poems);
	if (Array.isArray(data.items)) return mapArray(data.items);
	if (Array.isArray(data.feed)) return mapArray(data.feed);
	if (data.data && typeof data.data === 'object') {
		const nested = data.data as Record<string, unknown>;
		if (Array.isArray(nested.poems)) return mapArray(nested.poems);
		if (Array.isArray(nested.items)) return mapArray(nested.items);
	}

	return [];
}

export function useHomeFeed({
	isAuthenticated,
	limit = 8,
}: UseHomeFeedOptions) {
	const query = useQuery({
		queryKey: ['home-feed', { isAuthenticated, limit }],
		retry: 2,
		staleTime: 1000 * 60 * 5,
		queryFn: async (): Promise<{
			source: FeedSource;
			poems: PoemPreviewType[];
		}> => {
			if (isAuthenticated) {
				try {
					const payload = await createHTTPRequest<unknown>({
						path: '/feed/',
						query: {
							limit,
							orderBy: 'createdAt',
							orderDirection: 'desc',
						},
					});
					return { source: 'feed', poems: normalizePoemsPayload(payload) };
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

			const payload = await createHTTPRequest<PaginatedPoemsType>({
				path: '/poems',
				query: { limit, orderBy: 'createdAt', orderDirection: 'desc' },
			});
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

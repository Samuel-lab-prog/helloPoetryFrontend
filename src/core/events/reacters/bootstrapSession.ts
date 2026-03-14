import type { QueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@features/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';
import type { FeedPoemType, PaginatedPoemsType, PoemPreviewType } from '@features/poems';
import type { AppEvents } from '../eventBus';
import type { UserPrivateProfile } from '../../api/users/types';
import { clearSessionQueries } from './clearSession';

const INITIAL_FEED_LIMIT = 8;
const POETS_SEARCH_LIMIT = 10;
const NOTIFICATIONS_FETCH_LIMIT = 50;

const homeFeedKey = (userId: number, limit: number) =>
	['home-feed', { isAuthenticated: true, userId, limit }] as const;

function mapFeedPoem(item: FeedPoemType): PoemPreviewType {
	return {
		id: item.id,
		title: item.title,
		slug: item.slug,
		createdAt: item.createdAt,
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

async function fetchInitialFeed(limit: number): Promise<{
	source: 'feed' | 'recent';
	poems: PoemPreviewType[];
}> {
	try {
		const payload = (await api.feed.getFeed.query().queryFn()) as FeedPoemType[];
		return { source: 'feed', poems: payload.map(mapFeedPoem) };
	} catch (error) {
		const appError = error as AppErrorType;
		if (appError.statusCode !== 401 && appError.statusCode !== 403 && appError.statusCode !== 404)
			throw error;
	}

	const payload = (await api.poems.getPoems
		.query({
			limit,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		})
		.queryFn()) as PaginatedPoemsType;

	return { source: 'recent', poems: payload.poems ?? [] };
}

export async function bootstrapUserDataOnLogin(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	await clearSessionQueries(queryClient);

	const profileKey = apiKeys.users.profile(String(payload.userId));
	const myProfile = (await api.users.getProfile.fetch(
		String(payload.userId),
	)) as UserPrivateProfile;

	const authStore = useAuthClientStore.getState();
	authStore.setAuthClient({ id: payload.userId, role: payload.role, status: payload.status });
	authStore.setUnreadNotificationsCount(myProfile.unreadNotificationsCount);

	queryClient.setQueryData(profileKey, myProfile);

	await Promise.all([
		queryClient.fetchQuery({
			queryKey: homeFeedKey(payload.userId, INITIAL_FEED_LIMIT),
			queryFn: () => fetchInitialFeed(INITIAL_FEED_LIMIT),
		}),
		api.poems.getMyPoems.prefetch(),
		api.friends.getMyFriendRequests.prefetch(),
		api.poems.getSavedPoems.prefetch(),
		api.poems.getCollections.prefetch(),
		api.notifications.getNotifications.prefetch({
			onlyUnread: false,
			limit: NOTIFICATIONS_FETCH_LIMIT,
		}),
		api.users.getUsers.prefetch({
			searchNickname: undefined,
			limit: POETS_SEARCH_LIMIT,
			orderBy: 'nickname',
			orderDirection: 'asc',
		}),
	]);
}

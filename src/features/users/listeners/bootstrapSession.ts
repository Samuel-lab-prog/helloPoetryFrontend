import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { feed } from '@features/feed/api/endpoints';
import type { FeedPoemType } from '@features/feed/public/types';
import { friends } from '@features/friends/api/endpoints';
import { notifications } from '@features/notifications/api/endpoints';
import { poems } from '@features/poems/api/endpoints';
import type { PaginatedPoemsType, PoemPreviewType } from '@features/poems/public/types';
import { users } from '@features/users/api/endpoints';
import { userKeys } from '@features/users/api/keys';
import type { UserPrivateProfile, UserRole, UserStatus } from '@features/users/public/types';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';

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
		excerpt: item.excerpt ?? null,
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
		const payload = (await feed.getFeed.query().queryFn()) as FeedPoemType[];
		return { source: 'feed', poems: payload.map(mapFeedPoem) };
	} catch (error) {
		const appError = error as AppErrorType;
		if (appError.statusCode !== 401 && appError.statusCode !== 403 && appError.statusCode !== 404) {
			throw error;
		}
	}

	const payload = (await poems.getPoems
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
	const authStore = useAuthClientStore.getState();
	authStore.setAuthClient({
		id: payload.userId,
		role: payload.role as UserRole,
		status: payload.status as UserStatus,
	});

	await clearSessionQueries(queryClient);

	const profileKey = userKeys.profile(String(payload.userId));
	try {
		const myProfile = (await users.getProfile.fetch(String(payload.userId))) as UserPrivateProfile;
		authStore.setUnreadNotificationsCount(myProfile.unreadNotificationsCount);
		queryClient.setQueryData(profileKey, myProfile);
	} catch {
		authStore.setUnreadNotificationsCount(0);
	}

	await Promise.allSettled([
		queryClient.fetchQuery({
			queryKey: homeFeedKey(payload.userId, INITIAL_FEED_LIMIT),
			queryFn: () => fetchInitialFeed(INITIAL_FEED_LIMIT),
		}),
		poems.getMyPoems.prefetch(),
		friends.getMyFriendRequests.prefetch(),
		poems.getSavedPoems.prefetch(),
		poems.getCollections.prefetch(),
		notifications.getNotifications.prefetch({
			onlyUnread: false,
			limit: NOTIFICATIONS_FETCH_LIMIT,
		}),
		users.getUsers.prefetch({
			searchNickname: undefined,
			limit: POETS_SEARCH_LIMIT,
			orderBy: 'nickname',
			orderDirection: 'asc',
		}),
	]);
}

import type { QueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@features/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import {
	useUserBootstrapStore,
	type UserMyProfileSnapshot,
} from '@root/core/stores/useUserBootstrapStore';
import { api } from '@root/core/api';
import type {
	FeedPoemType,
	FullPoemType,
	PoemCollectionType,
	PoemPreviewType,
	SavedPoemType,
	UsersPage as PoetsSearchPageType,
} from '@features/poems';
import type { MyFriendRequestsType, NotificationsPageType } from '@features/users';
import type { AppEvents } from './eventBus';

const INITIAL_FEED_LIMIT = 8;
const POETS_SEARCH_LIMIT = 10;

const QUERY_KEYS = {
	myProfile: (userId: number) => ['my-profile', userId] as const,
	myPoems: (userId: number) => ['my-poems', userId] as const,
	myFriendRequests: (userId: number) => ['my-friend-requests', userId] as const,
	savedPoems: (userId: number) => ['saved-poems', userId] as const,
	poemCollections: (userId: number) => ['poem-collections', userId] as const,
	notifications: (userId: number, onlyUnread: boolean) =>
		['notifications', userId, { onlyUnread }] as const,
	poetsSearch: (searchNickname: string, limit: number) =>
		['poets-search', searchNickname, limit] as const,
	authenticatedHomeFeed: (userId: number, limit: number) =>
		['home-feed', { isAuthenticated: true, userId, limit }] as const,
};

async function clearSessionQueries(queryClient: QueryClient): Promise<void> {
	await queryClient.cancelQueries({ queryKey: ['my-profile'] });
	await queryClient.cancelQueries({ queryKey: ['my-poems'] });
	await queryClient.cancelQueries({ queryKey: ['my-friend-requests'] });
	await queryClient.cancelQueries({ queryKey: ['saved-poems'] });
	await queryClient.cancelQueries({ queryKey: ['poem-collections'] });
	await queryClient.cancelQueries({ queryKey: ['notifications'] });
	await queryClient.cancelQueries({ queryKey: ['poets-search'] });
	await queryClient.cancelQueries({ queryKey: ['home-feed'] });

	queryClient.removeQueries({ queryKey: ['my-profile'] });
	queryClient.removeQueries({ queryKey: ['my-poems'] });
	queryClient.removeQueries({ queryKey: ['my-friend-requests'] });
	queryClient.removeQueries({ queryKey: ['saved-poems'] });
	queryClient.removeQueries({ queryKey: ['poem-collections'] });
	queryClient.removeQueries({ queryKey: ['notifications'] });
	queryClient.removeQueries({ queryKey: ['poets-search'] });
	queryClient.removeQueries({ queryKey: ['home-feed'] });
}

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
		if (appError.statusCode !== 401 && appError.statusCode !== 403 && appError.statusCode !== 404) {
			throw error;
		}
	}

	const payload = (await api.poems.getPoems
		.query({
			limit,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		})
		.queryFn()) as { poems: PoemPreviewType[] };

	return { source: 'recent', poems: payload.poems ?? [] };
}

export async function bootstrapUserDataOnLogin(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	await clearSessionQueries(queryClient);

	const myProfile = await queryClient.fetchQuery({
		queryKey: QUERY_KEYS.myProfile(payload.userId),
		queryFn: () =>
			api.users.getProfile
				.query(String(payload.userId))
				.queryFn() as Promise<UserMyProfileSnapshot>,
	});

	useAuthClientStore.setState({
		authClient: { id: payload.userId, role: payload.role, status: payload.status },
		unreadNotificationsCount: myProfile.unreadNotificationsCount,
	});

	queryClient.setQueryData(QUERY_KEYS.myProfile(payload.userId), myProfile);

	await Promise.all([
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.authenticatedHomeFeed(payload.userId, INITIAL_FEED_LIMIT),
			queryFn: () => fetchInitialFeed(INITIAL_FEED_LIMIT),
		}),
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.myPoems(payload.userId),
			queryFn: () => api.poems.getMyPoems.query().queryFn() as Promise<FullPoemType[]>,
		}),
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.myFriendRequests(payload.userId),
			queryFn: () =>
				api.friends.getMyFriendRequests.query().queryFn() as Promise<MyFriendRequestsType>,
		}),
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.savedPoems(payload.userId),
			queryFn: () => api.poems.getSavedPoems.query().queryFn() as Promise<SavedPoemType[]>,
		}),
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.poemCollections(payload.userId),
			queryFn: () => api.poems.getCollections.query().queryFn() as Promise<PoemCollectionType[]>,
		}),
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.notifications(payload.userId, false),
			queryFn: () =>
				api.notifications.getNotifications
					.query({ onlyUnread: false, limit: 50 })
					.queryFn() as Promise<NotificationsPageType>,
		}),
		queryClient.fetchQuery({
			queryKey: QUERY_KEYS.poetsSearch('', POETS_SEARCH_LIMIT),
			queryFn: () =>
				api.users.getUsers
					.query({
						limit: POETS_SEARCH_LIMIT,
						orderBy: 'nickname',
						orderDirection: 'asc',
					})
					.queryFn() as Promise<PoetsSearchPageType>,
		}),
	]);
}

export async function clearUserDataFromCache(queryClient: QueryClient): Promise<void> {
	useUserBootstrapStore.getState().clearBootstrap();
	useAuthClientStore.getState().setUnreadNotificationsCount(0);
	await clearSessionQueries(queryClient);
}

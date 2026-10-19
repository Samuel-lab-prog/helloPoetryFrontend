import { friends } from '@Api/friends/endpoints';
import { interactionsKeys } from '@Api/interactions/keys';
import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import { eventBus } from '@root/core/events/eventBus';
import { type AuthSessionPort, registerAuthSessionPort } from '@root/core/ports/authSession';
import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import { QueryClient } from '@tanstack/react-query';

import { onCommentCreated } from '../reacters/commentCreated';
import { onUserLoggedIn } from '../reacters/userLoggedIn';
import { onUserLoggedOut } from '../reacters/userLoggedOut';
import { registerEventListeners } from '../registerEventListeners';

vi.mock('@Api/notifications/infiniteQuery', () => ({
	NOTIFICATIONS_PAGE_LIMIT: 50,
	prefetchNotificationsInfiniteQuery: vi.fn().mockResolvedValue(undefined),
}));

function makeAuthSessionPort(): AuthSessionPort {
	return {
		getCurrentIdentity: vi.fn(() => ({ id: 41, status: 'active' })),
		getCurrentCacheScope: vi.fn(() => 'user:41:active'),
		setUnreadNotificationsCount: vi.fn(),
		clearAuthClient: vi.fn(),
	};
}

describe('auth session event integration', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		useUserBootstrapStore.getState().clearBootstrap();
	});

	it('uses the current user cache scope when refreshing comments', async () => {
		const authSession = makeAuthSessionPort();
		const queryClient = new QueryClient();
		const refetch = vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined);
		registerAuthSessionPort(authSession);

		await onCommentCreated(queryClient, {
			poemId: 9,
			parentId: 2,
			createdAt: '2026-10-18T00:00:00.000Z',
		});

		expect(authSession.getCurrentCacheScope).toHaveBeenCalledOnce();
		expect(refetch).toHaveBeenCalledWith({
			queryKey: interactionsKeys.commentsByPoem('9', {
				parentId: '2',
				authScope: 'user:41:active',
			}),
		});
		vi.mocked(authSession.getCurrentCacheScope).mockReturnValue('user:82:active');
		await onCommentCreated(queryClient, {
			poemId: 9,
			createdAt: '2026-10-18T00:00:01.000Z',
		});
		expect(refetch).toHaveBeenCalledWith({
			queryKey: interactionsKeys.commentsByPoem('9', { authScope: 'user:82:active' }),
		});
		expect(refetch).toHaveBeenCalledWith({ queryKey: poemKeys.byId('9') });
		queryClient.clear();
	});

	it('sets the unread notification count from the profile after login', async () => {
		const authSession = makeAuthSessionPort();
		const queryClient = new QueryClient();
		const profile = {
			id: 41,
			name: 'Ana',
			nickname: 'ana',
			unreadNotificationsCount: 7,
		} as Awaited<ReturnType<typeof users.getProfile.fetch>>;
		registerAuthSessionPort(authSession);
		queryClient.setQueryData(userKeys.profile('old-user'), { id: 'old-user' });
		vi.spyOn(users.getProfile, 'fetch').mockResolvedValue(profile);
		vi.spyOn(poems.getMyPoems, 'prefetch').mockResolvedValue(undefined);
		vi.spyOn(poems.getSavedPoems, 'prefetch').mockResolvedValue(undefined);
		vi.spyOn(poems.getCollections, 'prefetch').mockResolvedValue(undefined);
		vi.spyOn(friends.getMyFriendRequests, 'prefetch').mockResolvedValue(undefined);
		vi.spyOn(users.getUsers, 'prefetch').mockResolvedValue(undefined);

		await onUserLoggedIn(queryClient, {
			userId: 41,
			role: 'author',
			status: 'active',
			loggedInAt: '2026-10-18T00:00:00.000Z',
		});

		expect(authSession.setUnreadNotificationsCount).toHaveBeenCalledWith(7);
		expect(queryClient.getQueryData(userKeys.profile('old-user'))).toBeUndefined();
		expect(queryClient.getQueryData(userKeys.profile('41'))).toEqual(profile);
		queryClient.clear();
	});

	it('clears unread counts, bootstrap data, and session-bound queries after logout', async () => {
		const authSession = makeAuthSessionPort();
		const queryClient = new QueryClient();
		registerAuthSessionPort(authSession);
		useUserBootstrapStore.getState().setBootstrap({
			userPoems: [],
			friends: [],
			profile: {
				id: 41,
				name: 'Ana',
				nickname: 'ana',
				bio: '',
				avatarUrl: null,
				role: 'author',
				status: 'active',
				email: 'ana@example.com',
				emailVerifiedAt: null,
				unreadNotificationsCount: 7,
				blockedUsersIds: [],
			},
		});
		queryClient.setQueryData(userKeys.profile('41'), { id: 41 });

		await onUserLoggedOut(queryClient, {
			userId: 41,
			reason: 'manual',
			loggedOutAt: '2026-10-18T00:00:00.000Z',
		});

		expect(authSession.setUnreadNotificationsCount).toHaveBeenCalledWith(0);
		expect(useUserBootstrapStore.getState().bootstrap).toBeNull();
		expect(queryClient.getQueryData(userKeys.profile('41'))).toBeUndefined();
		queryClient.clear();
	});

	it('registers each logout listener only once when initialized repeatedly', async () => {
		const authSession = makeAuthSessionPort();
		const queryClient = new QueryClient();
		registerAuthSessionPort(authSession);
		registerEventListeners(queryClient);
		registerEventListeners(queryClient);

		try {
			await eventBus.publish('userLoggedOut', {
				userId: 41,
				reason: 'manual',
				loggedOutAt: '2026-10-18T00:00:00.000Z',
			});
			expect(authSession.setUnreadNotificationsCount).toHaveBeenCalledOnce();
		} finally {
			const cleanup = (globalThis as Record<string, unknown>)['__hellopoetry_event_listeners__'];
			if (typeof cleanup === 'function') cleanup();
			delete (globalThis as Record<string, unknown>).__hellopoetry_event_listeners__;
			queryClient.clear();
		}
	});
});

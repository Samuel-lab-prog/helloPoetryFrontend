/* eslint-disable no-restricted-imports */
import type { QueryClient } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import { useAuthClientStore } from '@features/auth';
import type {
	FullPoemType,
	SavedPoemType,
	PoemCollectionType,
	UsersPage as PoetsSearchPageType,
} from '@features/poems';
import type { MyFriendRequestsType, NotificationsPageType } from '@features/users';
import {
	useUserBootstrapStore,
	type UserMyProfileSnapshot,
} from '@features/auth/stores/useUserBootstrapStore';
import { eventBus } from './eventBus';

export function registerEventListeners(queryClient: QueryClient): void {
	eventBus.subscribe('userLoggedIn', async (payload) => {
		const myProfile = await queryClient.fetchQuery({
			queryKey: ['my-profile', payload.userId],
			queryFn: () =>
				createHTTPRequest<UserMyProfileSnapshot>({
					path: '/users',
					params: [payload.userId, 'profile'],
				}),
		});

		useAuthClientStore.getState().setUnreadNotificationsCount(myProfile.unreadNotificationsCount);
		queryClient.setQueryData(['my-profile', payload.userId], myProfile);

		await createHTTPRequest<unknown>({
			path: '/feed/',
			query: { limit: 8, orderBy: 'createdAt', orderDirection: 'desc' },
		});

		void queryClient
			.prefetchQuery({
				queryKey: ['my-poems'],
				queryFn: () => createHTTPRequest<FullPoemType[]>({ path: '/poems/me' }),
			})
			.catch(() => {});

		await Promise.all([
			queryClient.prefetchQuery({
				queryKey: ['my-friend-requests', payload.userId],
				queryFn: () =>
					createHTTPRequest<MyFriendRequestsType>({
						path: '/friends/requests',
					}),
			}),
			queryClient.prefetchQuery({
				queryKey: ['saved-poems'],
				queryFn: () => createHTTPRequest<SavedPoemType[]>({ path: '/poems/saved' }),
			}),
			queryClient.prefetchQuery({
				queryKey: ['poem-collections'],
				queryFn: () => createHTTPRequest<PoemCollectionType[]>({ path: '/poems/collections' }),
			}),
			queryClient.prefetchQuery({
				queryKey: ['notifications', { onlyUnread: false }],
				queryFn: () =>
					createHTTPRequest<NotificationsPageType>({
						path: '/notifications',
						query: { onlyUnread: false, limit: 50 },
					}),
			}),
			queryClient.prefetchQuery({
				queryKey: ['poets-search', '', 10],
				queryFn: () =>
					createHTTPRequest<PoetsSearchPageType>({
						path: '/users',
						query: {
							limit: 10,
							orderBy: 'nickname',
							orderDirection: 'asc',
						},
					}),
			}),
		]);
	});

	eventBus.subscribe('userLoggedOut', () => {
		useUserBootstrapStore.getState().clearBootstrap();
		queryClient.removeQueries({ queryKey: ['my-profile'] });
		queryClient.removeQueries({ queryKey: ['my-friend-requests'] });
		queryClient.removeQueries({ queryKey: ['saved-poems'] });
		queryClient.removeQueries({ queryKey: ['poem-collections'] });
		queryClient.removeQueries({ queryKey: ['notifications'] });
		queryClient.removeQueries({ queryKey: ['poets-search'] });
	});
}

/* eslint-disable no-restricted-imports */
import type { QueryClient } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import type { FullPoemType } from '@features/poems';
import {
	useUserBootstrapStore,
	type UserMyProfileSnapshot,
	type UserLoginBootstrap,
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

		const bootstrap: UserLoginBootstrap = {
			userPoems: myProfile.stats.poems,
			friends: myProfile.stats.friends,
			profile: {
				id: myProfile.id,
				name: myProfile.name,
				nickname: myProfile.nickname,
				bio: myProfile.bio,
				avatarUrl: myProfile.avatarUrl,
				role: myProfile.role,
				status: myProfile.status,
				email: myProfile.email,
				emailVerifiedAt: myProfile.emailVerifiedAt,
				blockedUsersIds: myProfile.blockedUsersIds,
			},
		};

		useUserBootstrapStore.getState().setBootstrap(bootstrap);
		queryClient.setQueryData(['my-profile', payload.userId], myProfile);

		await queryClient.prefetchQuery({
			queryKey: ['my-poems'],
			queryFn: () => createHTTPRequest<FullPoemType[]>({ path: '/poems/me' }),
		});
	});

	eventBus.subscribe('userLoggedOut', () => {
		useUserBootstrapStore.getState().clearBootstrap();
		queryClient.removeQueries({ queryKey: ['my-profile'] });
	});
}

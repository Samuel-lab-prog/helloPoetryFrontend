import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { users } from '@features/users/api/endpoints';
import { userKeys } from '@features/users/api/keys';
import type { UserPrivateProfile, UserRole, UserStatus } from '@features/users/public/types';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

import { clearSessionQueries } from './clearSession';

const POETS_SEARCH_LIMIT = 10;

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

	await users.getUsers.prefetch({
		searchNickname: undefined,
		limit: POETS_SEARCH_LIMIT,
		orderBy: 'nickname',
		orderDirection: 'asc',
	});
}

import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { feedKeys } from '@features/feed/api/keys';
import { friends } from '@features/friends/api/endpoints';
import { notifications } from '@features/notifications/api/endpoints';
import { poems } from '@features/poems/api/endpoints';
import { users } from '@features/users/api/endpoints';
import { userKeys } from '@features/users/api/keys';
import type { UserPrivateProfile, UserRole, UserStatus } from '@features/users/public/types';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

const POETS_SEARCH_LIMIT = 10;
const NOTIFICATIONS_FETCH_LIMIT = 50;

const homeFeedKey = (userId: number, limit = 8) =>
	['home-feed', { isAuthenticated: true, userId, limit }] as const;

async function clearUserSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [userKeys.anyProfile(), userKeys.anySearch()];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

export async function onUserLoggedIn(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	const authStore = useAuthClientStore.getState();
	authStore.setAuthClient({
		id: payload.userId,
		role: payload.role as UserRole,
		status: payload.status as UserStatus,
	});

	await clearUserSessionQueries(queryClient);

	const profileKey = userKeys.profile(String(payload.userId));
	try {
		const myProfile = (await users.getProfile.fetch(String(payload.userId))) as UserPrivateProfile;
		authStore.setUnreadNotificationsCount(myProfile.unreadNotificationsCount);
		queryClient.setQueryData(profileKey, myProfile);
	} catch {
		authStore.setUnreadNotificationsCount(0);
	}

	await Promise.allSettled([
		poems.getMyPoems.prefetch(),
		poems.getSavedPoems.prefetch(),
		poems.getCollections.prefetch(),
		friends.getMyFriendRequests.prefetch(),
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
		queryClient.invalidateQueries({ queryKey: feedKeys.all() }),
		queryClient.invalidateQueries({ queryKey: homeFeedKey(payload.userId) }),
	]);
}

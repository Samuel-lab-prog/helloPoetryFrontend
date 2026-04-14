import { feedKeys } from '@Api/feed/keys';
import { friends } from '@Api/friends/endpoints';
import { notifications } from '@Api/notifications/endpoints';
import { poems } from '@Api/poems/endpoints';
import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import type { UserPrivateProfile } from '@Api/users/types';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

const POETS_SEARCH_LIMIT = 10;
const NOTIFICATIONS_FETCH_LIMIT = 50;

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
		queryClient.invalidateQueries({ queryKey: feedKeys.homeBase() }),
	]);
}

import { friends } from '@Api/friends/endpoints';
import {
	NOTIFICATIONS_PAGE_LIMIT,
	prefetchNotificationsInfiniteQuery,
} from '@Api/notifications/infiniteQuery';
import { poems } from '@Api/poems/endpoints';
import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import type { UserPrivateProfile } from '@Api/users/types';
import type { AppEvents } from '@root/core/events/eventBus';
import { getAuthSessionPort } from '@root/core/ports/authSession';
import type { QueryClient } from '@tanstack/react-query';

import { clearSessionBoundQueries } from './sessionQueries';

const POETS_SEARCH_LIMIT = 10;

export async function onUserLoggedIn(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	const authSession = getAuthSessionPort();

	await clearSessionBoundQueries(queryClient);

	const profileKey = userKeys.profile(String(payload.userId));
	try {
		const myProfile = (await users.getProfile.fetch(String(payload.userId))) as UserPrivateProfile;
		authSession.setUnreadNotificationsCount(myProfile.unreadNotificationsCount);
		queryClient.setQueryData(profileKey, myProfile);
	} catch {
		authSession.setUnreadNotificationsCount(0);
	}

	await Promise.allSettled([
		poems.getMyPoems.prefetch(),
		poems.getSavedPoems.prefetch(),
		poems.getCollections.prefetch(),
		friends.getMyFriendRequests.prefetch(),
		prefetchNotificationsInfiniteQuery(queryClient, {
			onlyUnread: false,
			limit: NOTIFICATIONS_PAGE_LIMIT,
		}),
		users.getUsers.prefetch({
			searchNickname: undefined,
			limit: POETS_SEARCH_LIMIT,
			orderBy: 'nickname',
			orderDirection: 'asc',
		}),
	]);
}

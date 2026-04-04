import { feedKeys } from '@Api/feed/keys';
import { friendsKeys } from '@Api/friends/keys';
import { notificationsKeys } from '@Api/notifications/keys';
import { poemKeys } from '@Api/poems/keys';
import { userKeys } from '@Api/users/keys';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import type { AppEvents } from '@root/core/events/eventBus';
import { useUserBootstrapStore } from '@root/core/stores/useUserBootstrapStore';
import type { QueryClient } from '@tanstack/react-query';

const homeFeedKey = ['home-feed'] as const;

async function clearUserSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [userKeys.anyProfile(), userKeys.anySearch()];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

async function clearFeedSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [feedKeys.all(), homeFeedKey];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

async function clearPoemSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [poemKeys.mine(), poemKeys.saved(), poemKeys.collections()];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

async function clearFriendsSessionQueries(queryClient: QueryClient): Promise<void> {
	const key = friendsKeys.requests();
	await queryClient.cancelQueries({ queryKey: key });
	queryClient.removeQueries({ queryKey: key });
}

async function clearNotificationsSessionQueries(queryClient: QueryClient): Promise<void> {
	const key = notificationsKeys.all();
	await queryClient.cancelQueries({ queryKey: key });
	queryClient.removeQueries({ queryKey: key });
}

function clearStoredSessionData(): void {
	useUserBootstrapStore.getState().clearBootstrap();
	useAuthClientStore.getState().setUnreadNotificationsCount(0);
}

async function clearUserDataFromCache(queryClient: QueryClient): Promise<void> {
	clearStoredSessionData();
	await clearUserSessionQueries(queryClient);
}

export async function onUserLoggedOut(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedOut'],
): Promise<void> {
	void payload;

	await Promise.all([
		clearUserDataFromCache(queryClient),
		clearFeedSessionQueries(queryClient),
		clearPoemSessionQueries(queryClient),
		clearFriendsSessionQueries(queryClient),
		clearNotificationsSessionQueries(queryClient),
	]);
}

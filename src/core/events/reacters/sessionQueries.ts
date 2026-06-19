import { feedKeys } from '@Api/feed/keys';
import { friendsKeys } from '@Api/friends/keys';
import { interactionsKeys } from '@Api/interactions/keys';
import { notificationsKeys } from '@Api/notifications/keys';
import { poemKeys } from '@Api/poems/keys';
import { userKeys } from '@Api/users/keys';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

async function removeQueryFamily(queryClient: QueryClient, queryKey: QueryKey): Promise<void> {
	await queryClient.cancelQueries({ queryKey });
	queryClient.removeQueries({ queryKey });
}

export async function clearSessionBoundQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [
		userKeys.anyProfile(),
		userKeys.anySearch(),
		feedKeys.all(),
		feedKeys.homeBase(),
		poemKeys.byIdBase(),
		poemKeys.all(),
		poemKeys.minimal(),
		interactionsKeys.commentsBase(),
		friendsKeys.all(),
		notificationsKeys.all(),
	];

	await Promise.all(keysToClear.map((queryKey) => removeQueryFamily(queryClient, queryKey)));
}

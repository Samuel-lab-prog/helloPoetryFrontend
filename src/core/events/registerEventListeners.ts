import { onCommentCreated } from '@features/interactions/listeners/commentCreated';
import { onPoemCreated } from '@features/poems/listeners/poemCreated';
import { onPoemLiked } from '@features/poems/listeners/poemLiked';
import { bootstrapUserDataOnLogin } from '@features/users/listeners/bootstrapSession';
import { clearUserDataFromCache } from '@features/users/listeners/clearSession';
import {
	onFriendRequestCanceled,
	onFriendRequestCancelSettled,
} from '@features/users/listeners/friendRequestCanceled';
import type { QueryClient } from '@tanstack/react-query';

import { eventBus } from './eventBus';

const GLOBAL_KEY = '__hellopoetry_event_listeners__';

export function registerEventListeners(queryClient: QueryClient): void {
	if ((globalThis as Record<string, unknown>)[GLOBAL_KEY]) return;

	const unsubscribeLogin = eventBus.subscribe(
		'userLoggedIn',
		bootstrapUserDataOnLogin.bind(null, queryClient),
	);
	const unsubscribeLogout = eventBus.subscribe(
		'userLoggedOut',
		clearUserDataFromCache.bind(null, queryClient),
	);
	const unsubscribeComment = eventBus.subscribe(
		'commentCreated',
		onCommentCreated.bind(null, queryClient),
	);
	const unsubscribePoemCreated = eventBus.subscribe(
		'poemCreated',
		onPoemCreated.bind(null, queryClient),
	);
	const unsubscribePoemLiked = eventBus.subscribe('poemLiked', onPoemLiked.bind(null, queryClient));
	const unsubscribeFriendRequestCanceled = eventBus.subscribe(
		'friendRequestCanceled',
		onFriendRequestCanceled.bind(null, queryClient),
	);
	const unsubscribeFriendRequestCancelSettled = eventBus.subscribe(
		'friendRequestCancelSettled',
		onFriendRequestCancelSettled.bind(null, queryClient),
	);

	(globalThis as Record<string, unknown>)[GLOBAL_KEY] = () => {
		unsubscribeLogin();
		unsubscribeLogout();
		unsubscribeComment();
		unsubscribePoemCreated();
		unsubscribePoemLiked();
		unsubscribeFriendRequestCanceled();
		unsubscribeFriendRequestCancelSettled();
	};
}

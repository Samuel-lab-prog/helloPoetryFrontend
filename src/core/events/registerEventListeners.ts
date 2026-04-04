import type { QueryClient } from '@tanstack/react-query';

import { eventBus } from './eventBus';
import { onCommentCreated } from './reacters/commentCreated';
import { onFriendRequestCanceled } from './reacters/friendRequestCanceled';
import { onFriendRequestCancelSettled } from './reacters/friendRequestCancelSettled';
import { onPoemCreated } from './reacters/poemCreated';
import { onPoemLiked } from './reacters/poemLiked';
import { onUserLoggedIn } from './reacters/userLoggedIn';
import { onUserLoggedOut } from './reacters/userLoggedOut';

const GLOBAL_KEY = '__hellopoetry_event_listeners__';

export function registerEventListeners(queryClient: QueryClient): void {
	if ((globalThis as Record<string, unknown>)[GLOBAL_KEY]) return;

	const unsubscribeLogin = eventBus.subscribe(
		'userLoggedIn',
		onUserLoggedIn.bind(null, queryClient),
	);

	const unsubscribeLogout = eventBus.subscribe(
		'userLoggedOut',
		onUserLoggedOut.bind(null, queryClient),
	);

	const unsubscribeCommentCreated = eventBus.subscribe(
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
		unsubscribeCommentCreated();
		unsubscribePoemCreated();
		unsubscribePoemLiked();
		unsubscribeFriendRequestCanceled();
		unsubscribeFriendRequestCancelSettled();
	};
}

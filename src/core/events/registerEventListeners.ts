import { clearFeedSessionQueries } from '@features/feed/listeners/clearSession';
import {
	onPoemCreated as onFeedPoemCreated,
	onPoemLiked as onFeedPoemLiked,
} from '@features/feed/listeners/poemEvents';
import { onUserLoggedIn as onFeedUserLoggedIn } from '@features/feed/listeners/userLoggedIn';
import { clearFriendsSessionQueries } from '@features/friends/listeners/clearSession';
import { onFriendRequestCanceled as onFriendsRequestCanceled } from '@features/friends/listeners/friendRequestCanceled';
import { onUserLoggedIn as onFriendsUserLoggedIn } from '@features/friends/listeners/userLoggedIn';
import { onCommentCreated as onInteractionsCommentCreated } from '@features/interactions/listeners/commentCreated';
import { clearNotificationsSessionQueries } from '@features/notifications/listeners/clearSession';
import { onUserLoggedIn as onNotificationsUserLoggedIn } from '@features/notifications/listeners/userLoggedIn';
import { clearPoemSessionQueries } from '@features/poems/listeners/clearSession';
import { onCommentCreated as onPoemCommentCreated } from '@features/poems/listeners/commentCreated';
import { onPoemCreated } from '@features/poems/listeners/poemCreated';
import { onPoemLiked } from '@features/poems/listeners/poemLiked';
import { onUserLoggedIn as onPoemsUserLoggedIn } from '@features/poems/listeners/userLoggedIn';
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

	const unsubscribeLoginUsers = eventBus.subscribe(
		'userLoggedIn',
		bootstrapUserDataOnLogin.bind(null, queryClient),
	);
	const unsubscribeLoginFeed = eventBus.subscribe(
		'userLoggedIn',
		onFeedUserLoggedIn.bind(null, queryClient),
	);
	const unsubscribeLoginPoems = eventBus.subscribe(
		'userLoggedIn',
		onPoemsUserLoggedIn.bind(null, queryClient),
	);
	const unsubscribeLoginFriends = eventBus.subscribe(
		'userLoggedIn',
		onFriendsUserLoggedIn.bind(null, queryClient),
	);
	const unsubscribeLoginNotifications = eventBus.subscribe(
		'userLoggedIn',
		onNotificationsUserLoggedIn.bind(null, queryClient),
	);

	const unsubscribeLogoutUsers = eventBus.subscribe(
		'userLoggedOut',
		clearUserDataFromCache.bind(null, queryClient),
	);
	const unsubscribeLogoutFeed = eventBus.subscribe(
		'userLoggedOut',
		clearFeedSessionQueries.bind(null, queryClient),
	);
	const unsubscribeLogoutPoems = eventBus.subscribe(
		'userLoggedOut',
		clearPoemSessionQueries.bind(null, queryClient),
	);
	const unsubscribeLogoutFriends = eventBus.subscribe(
		'userLoggedOut',
		clearFriendsSessionQueries.bind(null, queryClient),
	);
	const unsubscribeLogoutNotifications = eventBus.subscribe(
		'userLoggedOut',
		clearNotificationsSessionQueries.bind(null, queryClient),
	);

	const unsubscribeCommentInteractions = eventBus.subscribe(
		'commentCreated',
		onInteractionsCommentCreated.bind(null, queryClient),
	);
	const unsubscribeCommentPoems = eventBus.subscribe(
		'commentCreated',
		onPoemCommentCreated.bind(null, queryClient),
	);

	const unsubscribePoemCreatedPoems = eventBus.subscribe(
		'poemCreated',
		onPoemCreated.bind(null, queryClient),
	);
	const unsubscribePoemCreatedFeed = eventBus.subscribe(
		'poemCreated',
		onFeedPoemCreated.bind(null, queryClient),
	);

	const unsubscribePoemLikedPoems = eventBus.subscribe(
		'poemLiked',
		onPoemLiked.bind(null, queryClient),
	);
	const unsubscribePoemLikedFeed = eventBus.subscribe(
		'poemLiked',
		onFeedPoemLiked.bind(null, queryClient),
	);

	const unsubscribeFriendRequestCanceledUsers = eventBus.subscribe(
		'friendRequestCanceled',
		onFriendRequestCanceled.bind(null, queryClient),
	);
	const unsubscribeFriendRequestCanceledFriends = eventBus.subscribe(
		'friendRequestCanceled',
		onFriendsRequestCanceled.bind(null, queryClient),
	);
	const unsubscribeFriendRequestCancelSettled = eventBus.subscribe(
		'friendRequestCancelSettled',
		onFriendRequestCancelSettled.bind(null, queryClient),
	);

	(globalThis as Record<string, unknown>)[GLOBAL_KEY] = () => {
		unsubscribeLoginUsers();
		unsubscribeLoginFeed();
		unsubscribeLoginPoems();
		unsubscribeLoginFriends();
		unsubscribeLoginNotifications();
		unsubscribeLogoutUsers();
		unsubscribeLogoutFeed();
		unsubscribeLogoutPoems();
		unsubscribeLogoutFriends();
		unsubscribeLogoutNotifications();
		unsubscribeCommentInteractions();
		unsubscribeCommentPoems();
		unsubscribePoemCreatedPoems();
		unsubscribePoemCreatedFeed();
		unsubscribePoemLikedPoems();
		unsubscribePoemLikedFeed();
		unsubscribeFriendRequestCanceledUsers();
		unsubscribeFriendRequestCanceledFriends();
		unsubscribeFriendRequestCancelSettled();
	};
}

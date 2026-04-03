import type { QueryClient } from '@tanstack/react-query';

import { eventBus } from './eventBus';
import {
	bootstrapUserDataOnLogin,
	clearUserDataFromCache,
	onCommentCreated,
	onPoemCreated,
	onPoemLiked,
} from './reacters';

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

	(globalThis as Record<string, unknown>)[GLOBAL_KEY] = () => {
		unsubscribeLogin();
		unsubscribeLogout();
		unsubscribeComment();
		unsubscribePoemCreated();
		unsubscribePoemLiked();
	};
}

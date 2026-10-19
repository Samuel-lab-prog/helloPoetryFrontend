import { friends, poems, users } from '@Api';
import {
	NOTIFICATIONS_PAGE_LIMIT,
	prefetchNotificationsInfiniteQuery,
} from '@Api/notifications/infiniteQuery';
import { queryClient } from '@QueryClient';

const prefetchedRoutes = new Set<string>();
const PREFETCH_POETS_LIMIT = 10;

function schedulePrefetch(work: () => void) {
	if (typeof window === 'undefined') return;
	if ('requestIdleCallback' in window) window.requestIdleCallback(() => work());
	else setTimeout(work, 0);
}

function prefetchChunkForRoute(to: string) {
	if (to === '/') return import('../../features/feed/use-cases/home/Page');
	if (to === '/poets') return import('../../features/users/use-cases/poets-search/Page');
	if (to === '/poems/new') return import('../../features/poems/use-cases/create-poem/Page');
	if (to === '/login') return import('../../features/auth/use-cases/login/Page');
	if (to === '/register') return import('../../features/users/use-cases/register/Page');
	if (to === '/notifications')
		return import('../../features/notifications/use-cases/notifications/Page');
	if (to === '/my-profile') return import('../../features/users/use-cases/my-profile/Page');
	if (to === '/my-profile/collections')
		return import('../../features/users/use-cases/my-profile-collections/Page');
	if (to === '/my-profile/friend-requests')
		return import('../../features/users/use-cases/my-profile-friend-requests/Page');
	if (to === '/my-profile/poems')
		return import('../../features/users/use-cases/my-profile-poems/Page');
	if (to === '/my-profile/saved-poems')
		return import('../../features/users/use-cases/my-profile-saved-poems/Page');
	if (to === '/admin') return import('../../features/poems/use-cases/admin/Page');
	if (to === '/admin/moderation')
		return import('../../features/moderation/use-cases/poem-moderation/Page');
	if (to.startsWith('/authors/')) return import('../../features/users/use-cases/author/Page');
	if (to.startsWith('/poems/') && to.includes('/immersive'))
		return import('../../features/poems/use-cases/poem-immersive/Page');
	if (to.startsWith('/poems/')) return import('../../features/poems/use-cases/poem/Page');
	return Promise.resolve();
}

function prefetchDataForRoute(to: string, userId?: number) {
	if (to === '/poets') {
		void users.getPublicUsers.prefetch({
			limit: PREFETCH_POETS_LIMIT,
			searchNickname: undefined,
		});
		return;
	}

	if (!userId) return;

	if (to === '/notifications') {
		void prefetchNotificationsInfiniteQuery(queryClient, {
			onlyUnread: false,
			limit: NOTIFICATIONS_PAGE_LIMIT,
		});
		return;
	}

	if (to.startsWith('/my-profile')) {
		void users.getProfile.prefetch(String(userId));
		void poems.getMyPoems.prefetch();
		void poems.getSavedPoems.prefetch();
		void poems.getCollections.prefetch();
		void friends.getMyFriendRequests.prefetch();
	}
}

export function createRoutePrefetcher(userId?: number) {
	return (to: string) => {
		const cacheKey = `${to}:${userId ?? 'guest'}`;
		if (prefetchedRoutes.has(cacheKey)) return;
		prefetchedRoutes.add(cacheKey);

		schedulePrefetch(() => {
			void prefetchChunkForRoute(to);
			prefetchDataForRoute(to, userId);
		});
	};
}

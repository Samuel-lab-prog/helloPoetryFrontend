import { notifications } from '@Api/notifications/endpoints';
import { notificationsKeys } from '@Api/notifications/keys';
import type { NotificationsPage } from '@Api/notifications/types';
import { type InfiniteData, infiniteQueryOptions, type QueryClient } from '@tanstack/react-query';

export const NOTIFICATIONS_PAGE_LIMIT = 50;

export type NotificationsInfiniteData = InfiniteData<NotificationsPage, string | undefined>;

type NotificationsInfiniteQueryParams = {
	onlyUnread?: boolean;
	limit?: number;
};

function getNextNotificationsPageParam(lastPage: NotificationsPage | undefined) {
	return lastPage?.hasMore && lastPage.nextCursor ? String(lastPage.nextCursor) : undefined;
}

export function notificationsInfiniteQueryOptions({
	onlyUnread = false,
	limit = NOTIFICATIONS_PAGE_LIMIT,
}: NotificationsInfiniteQueryParams = {}) {
	return infiniteQueryOptions({
		queryKey: notificationsKeys.infinitePage({ onlyUnread, limit }),
		staleTime: 1000 * 60 * 5,
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			notifications.getNotifications
				.query({ onlyUnread, limit, nextCursor: pageParam })
				.queryFn() as Promise<NotificationsPage>,
		getNextPageParam: getNextNotificationsPageParam,
	});
}

export function prefetchNotificationsInfiniteQuery(
	queryClient: QueryClient,
	params: NotificationsInfiniteQueryParams = {},
) {
	return queryClient.prefetchInfiniteQuery(notificationsInfiniteQueryOptions(params));
}

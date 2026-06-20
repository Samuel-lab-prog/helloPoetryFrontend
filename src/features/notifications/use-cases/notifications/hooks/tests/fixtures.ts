import {
	NOTIFICATIONS_PAGE_LIMIT,
	type NotificationsInfiniteData,
} from '@Api/notifications/infiniteQuery';
import { notificationsKeys } from '@Api/notifications/keys';
import type { NotificationItem, NotificationsPage } from '@Api/notifications/types';
import type { QueryClient } from '@tanstack/react-query';

export const unreadNotification: NotificationItem = {
	id: 1,
	userId: 123,
	type: 'POEM_LIKED',
	actorId: 456,
	entityId: 10,
	entityType: 'POEM',
	aggregatedCount: 1,
	data: { poemId: 10, poemTitle: 'A poem' },
	createdAt: '2026-06-20T12:00:00.000Z',
	updatedAt: '2026-06-20T12:00:00.000Z',
	readAt: null,
};

export const readNotification: NotificationItem = {
	...unreadNotification,
	id: 2,
	readAt: '2026-06-20T12:05:00.000Z',
};

export function notificationsPage(
	notificationsList: NotificationItem[],
	options: Pick<NotificationsPage, 'hasMore' | 'nextCursor'> = { hasMore: false },
): NotificationsPage {
	return {
		notifications: notificationsList,
		...options,
	};
}

export function getNotificationsCacheKey() {
	return notificationsKeys.infinitePage({
		onlyUnread: false,
		limit: NOTIFICATIONS_PAGE_LIMIT,
	});
}

export function seedNotifications(queryClient: QueryClient) {
	queryClient.setQueryData<NotificationsInfiniteData>(getNotificationsCacheKey(), {
		pages: [
			notificationsPage([unreadNotification], { hasMore: true, nextCursor: 2 }),
			notificationsPage([readNotification]),
		],
		pageParams: [undefined, '2'],
	});
}

export function getNotificationIds(data: NotificationsInfiniteData | undefined) {
	return data?.pages.flatMap((page) => page.notifications).map((item) => item.id);
}

import { createHTTPRequest } from '@Utils';

import { createMutationEndpoint, createQueryEndpoint } from '../utils';
import { notificationsKeys } from './keys';
import type { GetNotificationsParams, NotificationItem, NotificationsPage } from './types';

const getNotifications = createQueryEndpoint<[GetNotificationsParams?], NotificationsPage>({
	key: notificationsKeys.page,

	fn: (params = {}) =>
		createHTTPRequest<NotificationsPage>({
			method: 'GET',
			path: `/notifications`,
			query: params,
		}),
});

const getNotificationById = createQueryEndpoint<[string], NotificationItem>({
	key: notificationsKeys.byId,

	fn: (id) =>
		createHTTPRequest<NotificationItem>({
			method: 'GET',
			path: `/notifications/${id}`,
		}),
});

const markNotificationAsRead = createMutationEndpoint<string, NotificationItem>({
	fn: (id) =>
		createHTTPRequest<NotificationItem>({
			method: 'PATCH',
			path: `/notifications/${id}/read`,
		}),

	invalidate: [notificationsKeys.all],
});

const deleteNotification = createMutationEndpoint<string, NotificationItem>({
	fn: (id) =>
		createHTTPRequest<NotificationItem>({
			method: 'DELETE',
			path: `/notifications/${id}`,
		}),

	invalidate: [notificationsKeys.all],
});

const deleteAllNotifications = createMutationEndpoint<void, void>({
	fn: () =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/notifications/all`,
		}),

	invalidate: [notificationsKeys.all],
});

const markAllAsRead = createMutationEndpoint<void, void>({
	fn: () =>
		createHTTPRequest<void>({
			method: 'PATCH',
			path: `/notifications/mark-all-read`,
		}),

	invalidate: [notificationsKeys.all],
});

export const notifications = {
	getNotifications,
	getNotificationById,
	markNotificationAsRead,
	deleteNotification,
	deleteAllNotifications,
	markAllAsRead,
};

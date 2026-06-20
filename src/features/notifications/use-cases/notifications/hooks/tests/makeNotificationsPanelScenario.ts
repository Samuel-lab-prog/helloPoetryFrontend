import { notifications } from '@Api/notifications/endpoints';
import type { NotificationsInfiniteData } from '@Api/notifications/infiniteQuery';
import type { NotificationItem } from '@Api/notifications/types';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotificationsPanel } from '../useNotificationsPanel';
import { getNotificationsCacheKey, seedNotifications, unreadNotification } from './fixtures';

export function makeNotificationsPanelScenario() {
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {} as Record<string, unknown>,
		asLoggedOutUser() {
			clearTestAuthClient();
			return scenario;
		},
		asAuthenticatedUser(options: { unreadNotificationsCount?: number } = {}) {
			setTestAuthClient(undefined, options.unreadNotificationsCount ?? 0);
			return scenario;
		},
		withCachedNotifications() {
			seedNotifications(queryClient);
			return scenario;
		},
		withMarkAsReadSuccess(notification: NotificationItem = unreadNotification) {
			scenario.mocks.markNotificationAsRead = vi
				.spyOn(notifications.markNotificationAsRead, 'mutate')
				.mockResolvedValue({
					...notification,
					readAt: notification.readAt ?? '2026-06-20T12:10:00.000Z',
				});
			return scenario;
		},
		withDeleteFailure(message = 'delete failed') {
			scenario.mocks.deleteNotification = vi
				.spyOn(notifications.deleteNotification, 'mutate')
				.mockRejectedValue(new Error(message));
			return scenario;
		},
		watchingNotificationRequests() {
			scenario.mocks.getNotifications = vi.spyOn(notifications.getNotifications, 'query');
			return scenario;
		},
		render(onlyUnread = false) {
			return renderHook(() => useNotificationsPanel(onlyUnread), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		getCachedNotifications() {
			return queryClient.getQueryData<NotificationsInfiniteData>(getNotificationsCacheKey());
		},
	};

	return scenario;
}

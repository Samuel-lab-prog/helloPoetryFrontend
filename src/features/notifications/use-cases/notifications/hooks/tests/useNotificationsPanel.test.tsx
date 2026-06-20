// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getNotificationIds, unreadNotification } from './fixtures';
import { makeNotificationsPanelScenario } from './makeNotificationsPanelScenario';

describe('FEATURE HOOK - Notifications - useNotificationsPanel', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does not request notifications while logged out', async () => {
		const scenario = makeNotificationsPanelScenario()
			.asLoggedOutUser()
			.watchingNotificationRequests();

		const { result } = scenario.render();

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.notifications).toEqual([]);
		expect(scenario.mocks.getNotifications).not.toHaveBeenCalled();
	});

	it('flattens cached notification pages for authenticated users', async () => {
		const scenario = makeNotificationsPanelScenario()
			.asAuthenticatedUser()
			.withCachedNotifications();

		const { result } = scenario.render();

		await waitFor(() => expect(result.current.notifications).toHaveLength(2));

		expect(result.current.notifications.map((notification) => notification.id)).toEqual([1, 2]);
		expect(result.current.hasMoreNotifications).toBe(false);
	});

	it('marks a notification as read optimistically and decrements unread count', async () => {
		const scenario = makeNotificationsPanelScenario()
			.asAuthenticatedUser({ unreadNotificationsCount: 1 })
			.withCachedNotifications()
			.withMarkAsReadSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.markAsRead(unreadNotification.id);
		});

		const cache = scenario.getCachedNotifications();
		expect(cache?.pages[0]?.notifications[0]?.readAt).not.toBeNull();
		expect(useAuthClientStore.getState().unreadNotificationsCount).toBe(0);
	});

	it('restores notifications and unread count when delete fails', async () => {
		const scenario = makeNotificationsPanelScenario()
			.asAuthenticatedUser({ unreadNotificationsCount: 1 })
			.withCachedNotifications()
			.withDeleteFailure();

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.deleteNotification(unreadNotification.id);
			}),
		).rejects.toThrow('delete failed');

		const cache = scenario.getCachedNotifications();
		expect(getNotificationIds(cache)).toEqual([1, 2]);
		expect(useAuthClientStore.getState().unreadNotificationsCount).toBe(1);
	});
});

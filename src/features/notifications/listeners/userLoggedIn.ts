import { notifications } from '@features/notifications/api/endpoints';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

const NOTIFICATIONS_FETCH_LIMIT = 50;

export async function onUserLoggedIn(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	void queryClient;
	void payload;
	await notifications.getNotifications.prefetch({
		onlyUnread: false,
		limit: NOTIFICATIONS_FETCH_LIMIT,
	});
}

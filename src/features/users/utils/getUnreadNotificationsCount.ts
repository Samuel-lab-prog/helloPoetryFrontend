import { createHTTPRequest } from '@features/base';

type NotificationsPage = {
	notifications: { id: number }[];
	hasMore: boolean;
	nextCursor?: number;
};

export async function getUnreadNotificationsCount(): Promise<number> {
	const limit = 100;
	let cursor: number | undefined;
	let total = 0;
	let hasMore = true;

	while (hasMore) {
		const page = await createHTTPRequest<NotificationsPage>({
			path: '/notifications',
			query: {
				onlyUnread: true,
				limit,
				cursor,
			},
		});

		total += page.notifications.length;
		hasMore = page.hasMore;
		cursor = page.nextCursor;
	}

	return total;
}

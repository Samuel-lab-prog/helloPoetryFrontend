import type { NotificationItem } from '@Api/notifications/types';

export function getNotificationBody(item: NotificationItem): string {
	const body = item.data?.body?.trim();
	if (body) return body;
	if (item.aggregatedCount > 1)
		return `You received ${item.aggregatedCount} notifications of this type.`;

	return 'No additional details.';
}

export function getNotificationActorName(item: NotificationItem): string {
	return (
		item.data?.requesterNickname ??
		item.data?.likerNickname ??
		item.data?.commenterNickname ??
		item.data?.dedicatorNickname ??
		item.data?.replierNickname ??
		item.data?.newFriendNickname ??
		'User'
	);
}

export function getNotificationLink(item: NotificationItem) {
	const poemId = item.data?.poemId;
	const poemSlug = item.data?.poemSlug;
	if (poemId && poemId > 0 && poemSlug) return `/poems/${poemSlug}/${poemId}`;
	if (poemId && poemId > 0) return `/poems/${poemId}`;

	if (item.entityType === 'POEM' && item.entityId) return `/poems/${item.entityId}`;

	const userId = item.data?.newFriendId ?? item.data?.requesterId;
	if (userId && userId > 0) return `/authors/${userId}`;

	if (item.entityType === 'USER' && item.entityId) return `/authors/${item.entityId}`;

	return null;
}

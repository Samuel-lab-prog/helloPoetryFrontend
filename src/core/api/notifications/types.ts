export type NotificationPayload = {
	avatarUrl?: string | null;
	actorAvatarUrl?: string | null;
	title?: string;
	body?: string;
	poemId?: number;
	poemSlug?: string;
	poemTitle?: string;
	commentId?: number;
	parentCommentId?: number;
	commenterNickname?: string;
	likerNickname?: string;
	dedicatorNickname?: string;
	requesterId?: number;
	requesterNickname?: string;
	newFriendId?: number;
	newFriendNickname?: string;
	replierId?: number;
	replierNickname?: string;
	removalReason?: string | null;
};

export type NotificationItem = {
	id: number;
	userId: number;
	type: string;
	actorId: number | null;
	entityId: number | null;
	entityType: 'POEM' | 'COMMENT' | 'USER' | null;
	aggregatedCount: number;
	data: NotificationPayload | null;
	createdAt: string;
	updatedAt: string;
	readAt: string | null;
};

export type NotificationsPage = {
	notifications: NotificationItem[];
	hasMore: boolean;
	nextCursor?: number;
};

export type GetNotificationsParams = {
	onlyUnread?: boolean;
	limit?: number;
	nextCursor?: string;
};

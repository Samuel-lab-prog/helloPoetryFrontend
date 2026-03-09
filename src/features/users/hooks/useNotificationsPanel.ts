import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import { useEffect } from 'react';
import { useAuthClientStore } from '@features/auth';

type NotificationPayload = {
	title?: string;
	body?: string;
	poemId?: number;
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

export type NotificationsPageType = {
	notifications: NotificationItem[];
	hasMore: boolean;
	nextCursor?: number;
};

export function useNotificationsPanel(onlyUnread: boolean) {
	const queryClient = useQueryClient();
	const setUnreadNotificationsCount = useAuthClientStore(
		(state) => state.setUnreadNotificationsCount,
	);
	const decrementUnreadNotificationsCount = useAuthClientStore(
		(state) => state.decrementUnreadNotificationsCount,
	);

	const query = useQuery({
		queryKey: ['notifications', { onlyUnread }],
		staleTime: 1000 * 60 * 5,
		queryFn: () =>
			createHTTPRequest<NotificationsPageType>({
				path: '/notifications',
				query: { onlyUnread, limit: 50 },
			}),
	});

	const markAsReadMutation = useMutation({
		mutationFn: (id: number) =>
			createHTTPRequest<NotificationItem>({
				path: '/notifications',
				params: [id, 'read'],
				method: 'PATCH',
			}),
		onSuccess: (_, notificationId) => {
			const cachedNotifications = queryClient.getQueriesData<NotificationsPageType>({
				queryKey: ['notifications'],
			});
			const wasUnread = cachedNotifications.some(([, cachedPage]) =>
				cachedPage?.notifications.some(
					(notification) => notification.id === notificationId && !notification.readAt,
				),
			);

			if (wasUnread) decrementUnreadNotificationsCount(1);

			queryClient.invalidateQueries({
				queryKey: ['notifications'],
			});
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: () =>
			createHTTPRequest<void>({
				path: '/notifications/mark-all-read',
				method: 'PATCH',
			}),
		onSuccess: () => {
			setUnreadNotificationsCount(0);
			queryClient.invalidateQueries({
				queryKey: ['notifications'],
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			createHTTPRequest<NotificationItem>({
				path: '/notifications',
				params: [id],
				method: 'DELETE',
			}),
		onSuccess: (notification) => {
			if (!notification.readAt) decrementUnreadNotificationsCount(1);
			queryClient.invalidateQueries({
				queryKey: ['notifications'],
			});
		},
	});

	useEffect(() => {
		if (!query.data) return;
		if (onlyUnread) return;
		const unreadCount = query.data.notifications.filter((item) => !item.readAt).length;
		setUnreadNotificationsCount(unreadCount);
	}, [onlyUnread, query.data, setUnreadNotificationsCount]);

	return {
		notifications: query.data?.notifications ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		markAsRead: markAsReadMutation.mutateAsync,
		markAllAsRead: markAllReadMutation.mutateAsync,
		deleteNotification: deleteMutation.mutateAsync,
		isMarkingAsRead: markAsReadMutation.isPending,
		isMarkingAllAsRead: markAllReadMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}

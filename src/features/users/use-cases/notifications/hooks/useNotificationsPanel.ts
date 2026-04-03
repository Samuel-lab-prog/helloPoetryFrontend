import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { notifications } from '@root/features/notifications/api/endpoints';
import { notificationsKeys } from '@root/features/notifications/api/keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

type NotificationPayload = {
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
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const setUnreadNotificationsCount = useAuthClientStore(
		(state) => state.setUnreadNotificationsCount,
	);
	const decrementUnreadNotificationsCount = useAuthClientStore(
		(state) => state.decrementUnreadNotificationsCount,
	);

	const query = useQuery({
		queryKey: notificationsKeys.page({ onlyUnread, limit: 50 }),
		enabled: !!clientId,
		staleTime: 1000 * 60 * 5,
		queryFn: () =>
			notifications.getNotifications
				.query({ onlyUnread, limit: 50 })
				.queryFn() as Promise<NotificationsPageType>,
	});

	const markAsReadMutation = useMutation({
		mutationFn: (id: number) =>
			notifications.markNotificationAsRead.mutate(String(id)) as Promise<NotificationItem>,
		onSuccess: (_, notificationId) => {
			const cachedNotifications = queryClient.getQueriesData<NotificationsPageType>({
				queryKey: notificationsKeys.all(),
			});
			const wasUnread = cachedNotifications.some(([, cachedPage]) =>
				cachedPage?.notifications.some(
					(notification) => notification.id === notificationId && !notification.readAt,
				),
			);

			if (wasUnread) decrementUnreadNotificationsCount(1);

			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all(),
			});
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: () => notifications.markAllAsRead.mutate(),
		onSuccess: () => {
			setUnreadNotificationsCount(0);
			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all(),
			});
		},
	});

	const deleteAllMutation = useMutation({
		mutationFn: () => notifications.deleteAllNotifications.mutate(),
		onSuccess: () => {
			setUnreadNotificationsCount(0);
			queryClient.setQueriesData<NotificationsPageType>(
				{ queryKey: notificationsKeys.all() },
				(old) =>
					old
						? {
								...old,
								notifications: [],
								hasMore: false,
								nextCursor: undefined,
							}
						: old,
			);
			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all(),
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			notifications.deleteNotification.mutate(String(id)) as Promise<NotificationItem>,
		onSuccess: (notification) => {
			if (!notification.readAt) decrementUnreadNotificationsCount(1);
			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all(),
			});
		},
	});

	useEffect(() => {
		if (!clientId) return;
		if (!query.data) return;
		if (onlyUnread) return;
		const unreadCount = query.data.notifications.filter((item) => !item.readAt).length;
		setUnreadNotificationsCount(unreadCount);
	}, [clientId, onlyUnread, query.data, setUnreadNotificationsCount]);

	return {
		notifications: query.data?.notifications ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		markAsRead: markAsReadMutation.mutateAsync,
		markAllAsRead: markAllReadMutation.mutateAsync,
		deleteAllNotifications: deleteAllMutation.mutateAsync,
		deleteNotification: deleteMutation.mutateAsync,
		isMarkingAsRead: markAsReadMutation.isPending,
		isMarkingAllAsRead: markAllReadMutation.isPending,
		isDeletingAll: deleteAllMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}

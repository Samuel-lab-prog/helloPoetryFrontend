import { notifications } from '@Api/notifications/endpoints';
import { notificationsKeys } from '@Api/notifications/keys';
import type { NotificationItem, NotificationsPage } from '@Api/notifications/types';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

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
				.queryFn() as Promise<NotificationsPage>,
	});

	const markAsReadMutation = useMutation({
		mutationFn: (id: number) =>
			notifications.markNotificationAsRead.mutate(String(id)) as Promise<NotificationItem>,
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: notificationsKeys.all() });

			const previousPages = queryClient.getQueriesData<NotificationsPage>({
				queryKey: notificationsKeys.all(),
			});

			let markedWasUnread = false;
			queryClient.setQueriesData<NotificationsPage>(
				{ queryKey: notificationsKeys.all() },
				(old) => {
					if (!old) return old;
					const nowIso = new Date().toISOString();
					return {
						...old,
						notifications: old.notifications.map((notification) => {
							if (notification.id !== id) return notification;
							if (!notification.readAt) markedWasUnread = true;
							return notification.readAt
								? notification
								: {
										...notification,
										readAt: nowIso,
									};
						}),
					};
				},
			);

			if (markedWasUnread) decrementUnreadNotificationsCount(1);

			return { previousPages, markedWasUnread };
		},
		onError: (_error, _id, context) => {
			if (!context) return;
			context.previousPages.forEach(([key, data]) => {
				if (!data) return;
				queryClient.setQueryData(key, data);
			});
			if (context.markedWasUnread) {
				const unreadCount =
					context.previousPages
						.flatMap(([, page]) => page?.notifications ?? [])
						.filter((item) => !item.readAt).length ?? 0;
				setUnreadNotificationsCount(unreadCount);
			}
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: () => notifications.markAllAsRead.mutate(),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: notificationsKeys.all() });

			const previousPages = queryClient.getQueriesData<NotificationsPage>({
				queryKey: notificationsKeys.all(),
			});

			queryClient.setQueriesData<NotificationsPage>(
				{ queryKey: notificationsKeys.all() },
				(old) => {
					if (!old) return old;
					const nowIso = new Date().toISOString();
					return {
						...old,
						notifications: old.notifications.map((notification) =>
							notification.readAt ? notification : { ...notification, readAt: nowIso },
						),
					};
				},
			);

			setUnreadNotificationsCount(0);

			return { previousPages };
		},
		onError: (_error, _variables, context) => {
			if (!context) return;
			context.previousPages.forEach(([key, data]) => {
				if (!data) return;
				queryClient.setQueryData(key, data);
			});
			const unreadCount =
				context.previousPages
					.flatMap(([, page]) => page?.notifications ?? [])
					.filter((item) => !item.readAt).length ?? 0;
			setUnreadNotificationsCount(unreadCount);
		},
	});

	const deleteAllMutation = useMutation({
		mutationFn: () => notifications.deleteAllNotifications.mutate(),
		onSuccess: () => {
			setUnreadNotificationsCount(0);
			queryClient.setQueriesData<NotificationsPage>({ queryKey: notificationsKeys.all() }, (old) =>
				old
					? {
							...old,
							notifications: [],
							hasMore: false,
							nextCursor: undefined,
						}
					: old,
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			notifications.deleteNotification.mutate(String(id)) as Promise<NotificationItem>,
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: notificationsKeys.all() });

			const previousPages = queryClient.getQueriesData<NotificationsPage>({
				queryKey: notificationsKeys.all(),
			});

			let removedWasUnread = false;
			queryClient.setQueriesData<NotificationsPage>(
				{ queryKey: notificationsKeys.all() },
				(old) => {
					if (!old) return old;
					const existsUnread = old.notifications.some(
						(notification) => notification.id === id && !notification.readAt,
					);
					if (existsUnread) removedWasUnread = true;
					return {
						...old,
						notifications: old.notifications.filter((notification) => notification.id !== id),
						hasMore: old.hasMore,
						nextCursor: old.nextCursor,
					};
				},
			);

			if (removedWasUnread) decrementUnreadNotificationsCount(1);

			return { previousPages, removedWasUnread };
		},
		onError: (_error, _id, context) => {
			if (!context) return;
			context.previousPages.forEach(([key, data]) => {
				if (!data) return;
				queryClient.setQueryData(key, data);
			});
			if (context.removedWasUnread) {
				const unreadCount =
					context.previousPages
						.flatMap(([, page]) => page?.notifications ?? [])
						.filter((item) => !item.readAt).length ?? 0;
				setUnreadNotificationsCount(unreadCount);
			}
		},
		onSuccess: (notification, _id, context) => {
			if (!context?.removedWasUnread && !notification.readAt) {
				decrementUnreadNotificationsCount(1);
			}
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

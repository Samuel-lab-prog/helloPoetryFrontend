import { notifications } from '@Api/notifications/endpoints';
import {
	type NotificationsInfiniteData,
	notificationsInfiniteQueryOptions,
} from '@Api/notifications/infiniteQuery';
import { notificationsKeys } from '@Api/notifications/keys';
import type { NotificationItem, NotificationsPage } from '@Api/notifications/types';
import { type OptimisticSnapshot, restoreSnapshots, snapshotQueriesData } from '@Api/optimistic';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function getNotificationsFromPage(page: NotificationsPage | undefined): NotificationItem[] {
	const maybePage = page as Partial<NotificationsPage> | undefined;
	return Array.isArray(maybePage?.notifications) ? maybePage.notifications : [];
}

function normalizeNotificationsPage(page: NotificationsPage | undefined): NotificationsPage {
	return {
		...page,
		notifications: getNotificationsFromPage(page),
		hasMore: Boolean(page?.hasMore),
		nextCursor: page?.nextCursor,
	};
}

export function useNotificationsPanel(onlyUnread: boolean) {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const setUnreadNotificationsCount = useAuthClientStore(
		(state) => state.setUnreadNotificationsCount,
	);
	const decrementUnreadNotificationsCount = useAuthClientStore(
		(state) => state.decrementUnreadNotificationsCount,
	);

	const query = useInfiniteQuery({
		...notificationsInfiniteQueryOptions({ onlyUnread }),
		enabled: !!clientId,
	});

	function updateNotificationPages(
		updater: (notification: NotificationItem) => NotificationItem | null,
	) {
		queryClient.setQueriesData<NotificationsInfiniteData>(
			{ queryKey: notificationsKeys.infinitePage() },
			(old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => {
						const normalizedPage = normalizeNotificationsPage(page);
						return {
							...normalizedPage,
							notifications: normalizedPage.notifications
								.map((notification) => updater(notification))
								.filter((notification): notification is NotificationItem => notification !== null),
						};
					}),
				};
			},
		);
	}

	function getUnreadCountFromSnapshots(snapshots: Array<OptimisticSnapshot<NotificationsInfiniteData>>) {
		return snapshots
			.flatMap((snapshot) => snapshot.data?.pages ?? [])
			.flatMap((page) => getNotificationsFromPage(page))
			.filter((item) => !item.readAt).length;
	}

	const markAsReadMutation = useMutation({
		mutationFn: (id: number) =>
			notifications.markNotificationAsRead.mutate(String(id)) as Promise<NotificationItem>,
		onMutate: async (id) => {
			const previousPages = await snapshotQueriesData<NotificationsInfiniteData>(
				queryClient,
				notificationsKeys.infinitePage(),
			);

			let markedWasUnread = false;
			const nowIso = new Date().toISOString();
			updateNotificationPages((notification) => {
				if (notification.id !== id) return notification;
				if (!notification.readAt) markedWasUnread = true;
				return notification.readAt ? notification : { ...notification, readAt: nowIso };
			});

			if (markedWasUnread) decrementUnreadNotificationsCount(1);

			return { previousPages, markedWasUnread };
		},
		onError: (_error, _id, context) => {
			if (!context) return;
			restoreSnapshots(queryClient, context.previousPages);
			if (context.markedWasUnread) {
				setUnreadNotificationsCount(getUnreadCountFromSnapshots(context.previousPages));
			}
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: () => notifications.markAllAsRead.mutate(),
		onMutate: async () => {
			const previousPages = await snapshotQueriesData<NotificationsInfiniteData>(
				queryClient,
				notificationsKeys.infinitePage(),
			);

			const nowIso = new Date().toISOString();
			updateNotificationPages((notification) =>
				notification.readAt ? notification : { ...notification, readAt: nowIso },
			);

			setUnreadNotificationsCount(0);

			return { previousPages };
		},
		onError: (_error, _variables, context) => {
			if (!context) return;
			restoreSnapshots(queryClient, context.previousPages);
			setUnreadNotificationsCount(getUnreadCountFromSnapshots(context.previousPages));
		},
	});

	const deleteAllMutation = useMutation({
		mutationFn: () => notifications.deleteAllNotifications.mutate(),
		onSuccess: () => {
			setUnreadNotificationsCount(0);
			queryClient.setQueriesData<NotificationsInfiniteData>(
				{ queryKey: notificationsKeys.infinitePage() },
				(old) =>
					old
						? {
								...old,
								pages: [
									{
										notifications: [],
										hasMore: false,
										nextCursor: undefined,
									},
								],
								pageParams: [undefined],
							}
						: old,
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			notifications.deleteNotification.mutate(String(id)) as Promise<NotificationItem>,
		onMutate: async (id) => {
			const previousPages = await snapshotQueriesData<NotificationsInfiniteData>(
				queryClient,
				notificationsKeys.infinitePage(),
			);

			let removedWasUnread = false;
			updateNotificationPages((notification) => {
				if (notification.id !== id) return notification;
				if (!notification.readAt) removedWasUnread = true;
				return null;
			});

			if (removedWasUnread) decrementUnreadNotificationsCount(1);

			return { previousPages, removedWasUnread };
		},
		onError: (_error, _id, context) => {
			if (!context) return;
			restoreSnapshots(queryClient, context.previousPages);
			if (context.removedWasUnread) {
				setUnreadNotificationsCount(getUnreadCountFromSnapshots(context.previousPages));
			}
		},
		onSuccess: (notification, _id, context) => {
			if (!context?.removedWasUnread && !notification.readAt) {
				decrementUnreadNotificationsCount(1);
			}
		},
	});

	const notificationsList = Array.isArray(query.data?.pages)
		? query.data.pages.flatMap((page) => getNotificationsFromPage(page))
		: [];
	const safeNotificationsList = Array.isArray(notificationsList) ? notificationsList : [];

	return {
		notifications: safeNotificationsList,
		hasMoreNotifications: query.hasNextPage ?? false,
		isLoading: query.isLoading,
		isLoadingMoreNotifications: query.isFetchingNextPage,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		loadMoreNotifications: () => query.fetchNextPage(),
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

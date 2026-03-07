import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';

type NotificationType = {
	id: number;
	userId: number;
	type: string;
	actorId: number | null;
	entityId: number | null;
	entityType: 'POEM' | 'COMMENT' | 'USER' | null;
	aggregatedCount: number;
	data: unknown;
	createdAt: string;
	updatedAt: string;
	readAt: string | null;
};

type NotificationsPageType = {
	notifications: NotificationType[];
	hasMore: boolean;
	nextCursor?: number;
};

export function useNotificationsPanel(onlyUnread: boolean) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['notifications', { onlyUnread }],
		queryFn: () =>
			createHTTPRequest<NotificationsPageType>({
				path: '/notifications',
				query: { onlyUnread, limit: 50 },
			}),
	});

	const markAsReadMutation = useMutation({
		mutationFn: (id: number) =>
			createHTTPRequest<NotificationType>({
				path: '/notifications',
				params: [id, 'read'],
				method: 'PATCH',
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ['notifications'],
			}),
	});

	const markAllReadMutation = useMutation({
		mutationFn: () =>
			createHTTPRequest<void>({
				path: '/notifications/mark-all-read',
				method: 'PATCH',
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ['notifications'],
			}),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			createHTTPRequest<NotificationType>({
				path: '/notifications',
				params: [id],
				method: 'DELETE',
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ['notifications'],
			}),
	});

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

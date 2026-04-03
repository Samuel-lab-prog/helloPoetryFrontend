import { notificationsKeys } from '@features/notifications/api/keys';
import type { QueryClient } from '@tanstack/react-query';

export async function clearNotificationsSessionQueries(queryClient: QueryClient): Promise<void> {
	const key = notificationsKeys.all();
	await queryClient.cancelQueries({ queryKey: key });
	queryClient.removeQueries({ queryKey: key });
}

import { poems } from '@features/poems/api/endpoints';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onUserLoggedIn(
	queryClient: QueryClient,
	payload: AppEvents['userLoggedIn'],
): Promise<void> {
	void queryClient;
	void payload;
	await Promise.allSettled([
		poems.getMyPoems.prefetch(),
		poems.getSavedPoems.prefetch(),
		poems.getCollections.prefetch(),
	]);
}

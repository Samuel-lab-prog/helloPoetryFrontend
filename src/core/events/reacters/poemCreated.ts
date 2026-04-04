import { feedKeys } from '@Api/feed/keys';
import { poemKeys } from '@Api/poems/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onPoemCreated(
	queryClient: QueryClient,
	payload: AppEvents['poemCreated'],
): Promise<void> {
	void payload;

	await Promise.all([
		queryClient.invalidateQueries({ queryKey: feedKeys.all() }),
		queryClient.invalidateQueries({ queryKey: poemKeys.all() }),
		queryClient.invalidateQueries({ queryKey: poemKeys.minimal() }),
	]);
}

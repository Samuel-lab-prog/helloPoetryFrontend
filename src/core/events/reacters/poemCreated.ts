import type { QueryClient } from '@tanstack/react-query';
import { apiKeys } from '@root/core/api';
import type { AppEvents } from '../eventBus';

export async function onPoemCreated(
	queryClient: QueryClient,
	payload: AppEvents['poemCreated'],
): Promise<void> {
	void payload;
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: apiKeys.poems.all() }),
		queryClient.invalidateQueries({ queryKey: apiKeys.poems.minimal() }),
		queryClient.invalidateQueries({ queryKey: apiKeys.feed.all() }),
	]);
}

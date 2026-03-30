import type { QueryClient } from '@tanstack/react-query';
import { apiKeys } from '@root/core/api';
import type { AppEvents } from '../eventBus';

export async function onPoemLiked(
	queryClient: QueryClient,
	payload: AppEvents['poemLiked'],
): Promise<void> {
	const poemKey = apiKeys.poems.byId(String(payload.poemId));

	await Promise.all([
		queryClient.invalidateQueries({ queryKey: poemKey }),
		queryClient.invalidateQueries({ queryKey: apiKeys.poems.all() }),
		queryClient.invalidateQueries({ queryKey: apiKeys.feed.all() }),
	]);
}

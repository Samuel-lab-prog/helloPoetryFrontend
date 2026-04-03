import { feedKeys } from '@features/feed/api/keys';
import { poemKeys } from '@features/poems/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onPoemLiked(
	queryClient: QueryClient,
	payload: AppEvents['poemLiked'],
): Promise<void> {
	const poemKey = poemKeys.byId(String(payload.poemId));

	await Promise.all([
		queryClient.invalidateQueries({ queryKey: poemKey }),
		queryClient.invalidateQueries({ queryKey: poemKeys.all() }),
		queryClient.invalidateQueries({ queryKey: feedKeys.all() }),
	]);
}

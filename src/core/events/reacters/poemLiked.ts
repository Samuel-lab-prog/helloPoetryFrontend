import { feedKeys } from '@features/feed/api/keys';
import { poemKeys } from '@features/poems/api/keys';
import type { QueryClient } from '@tanstack/react-query';

import type { AppEvents } from '../eventBus';

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

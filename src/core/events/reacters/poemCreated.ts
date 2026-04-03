import { feedKeys } from '@features/feed/api/keys';
import { poemKeys } from '@features/poems/api/keys';
import type { QueryClient } from '@tanstack/react-query';

import type { AppEvents } from '../eventBus';

export async function onPoemCreated(
	queryClient: QueryClient,
	payload: AppEvents['poemCreated'],
): Promise<void> {
	void payload;
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: poemKeys.all() }),
		queryClient.invalidateQueries({ queryKey: poemKeys.minimal() }),
		queryClient.invalidateQueries({ queryKey: feedKeys.all() }),
	]);
}

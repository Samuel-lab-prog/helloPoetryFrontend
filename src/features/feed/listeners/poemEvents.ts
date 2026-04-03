import { feedKeys } from '@features/feed/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onPoemCreated(
	queryClient: QueryClient,
	payload: AppEvents['poemCreated'],
): Promise<void> {
	void payload;
	await queryClient.invalidateQueries({ queryKey: feedKeys.all() });
}

export async function onPoemLiked(
	queryClient: QueryClient,
	payload: AppEvents['poemLiked'],
): Promise<void> {
	void payload;
	await queryClient.invalidateQueries({ queryKey: feedKeys.all() });
}

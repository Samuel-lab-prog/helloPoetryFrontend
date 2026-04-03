import { poemKeys } from '@features/poems/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onCommentCreated(
	queryClient: QueryClient,
	payload: AppEvents['commentCreated'],
): Promise<void> {
	const poemKey = poemKeys.byId(String(payload.poemId));
	await queryClient.refetchQueries({ queryKey: poemKey });
}

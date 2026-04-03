import { interactionsKeys } from '@features/interactions/api/keys';
import type { AppEvents } from '@root/core/events/eventBus';
import type { QueryClient } from '@tanstack/react-query';

export async function onCommentCreated(
	queryClient: QueryClient,
	payload: AppEvents['commentCreated'],
): Promise<void> {
	const baseCommentsKey = interactionsKeys.commentsByPoem(String(payload.poemId));
	const parentCommentsKey =
		payload.parentId !== undefined
			? interactionsKeys.commentsByPoem(String(payload.poemId), String(payload.parentId))
			: null;

	const keysToInvalidate = [
		baseCommentsKey as readonly unknown[],
		parentCommentsKey as readonly unknown[] | null,
	].filter(Boolean) as ReadonlyArray<readonly unknown[]>;

	await Promise.all(keysToInvalidate.map((queryKey) => queryClient.refetchQueries({ queryKey })));
}

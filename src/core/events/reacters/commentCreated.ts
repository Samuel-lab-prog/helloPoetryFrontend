import { interactionsKeys } from '@Api/interactions/keys';
import { poemKeys } from '@Api/poems/keys';
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

	const keysToRefetch = [
		baseCommentsKey as readonly unknown[],
		parentCommentsKey as readonly unknown[] | null,
		poemKeys.byId(String(payload.poemId)),
	].filter(Boolean) as ReadonlyArray<readonly unknown[]>;

	await Promise.all(keysToRefetch.map((queryKey) => queryClient.refetchQueries({ queryKey })));
}

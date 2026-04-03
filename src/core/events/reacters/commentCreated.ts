import { interactionsKeys } from '@root/features/interactions/api/keys';
import { poemKeys } from '@root/features/poems/api/keys';
import type { QueryClient } from '@tanstack/react-query';

import type { AppEvents } from '../eventBus';

export async function onCommentCreated(
	queryClient: QueryClient,
	payload: AppEvents['commentCreated'],
): Promise<void> {
	const poemKey = poemKeys.byId(String(payload.poemId));
	const baseCommentsKey = interactionsKeys.commentsByPoem(String(payload.poemId));
	const parentCommentsKey =
		payload.parentId !== undefined
			? interactionsKeys.commentsByPoem(String(payload.poemId), String(payload.parentId))
			: null;

	const keysToInvalidate = [
		poemKey as readonly unknown[],
		baseCommentsKey as readonly unknown[],
		parentCommentsKey as readonly unknown[] | null,
	].filter(Boolean) as ReadonlyArray<readonly unknown[]>;

	await Promise.all(keysToInvalidate.map((queryKey) => queryClient.refetchQueries({ queryKey })));
}

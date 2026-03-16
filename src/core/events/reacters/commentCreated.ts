import type { QueryClient } from '@tanstack/react-query';
import { apiKeys } from '@root/core/api';
import type { AppEvents } from '../eventBus';

export async function onCommentCreated(
	queryClient: QueryClient,
	payload: AppEvents['commentCreated'],
): Promise<void> {
	const poemKey = apiKeys.poems.byId(String(payload.poemId));
	const baseCommentsKey = apiKeys.interactions.commentsByPoem(String(payload.poemId));
	const parentCommentsKey =
		payload.parentId !== undefined
			? apiKeys.interactions.commentsByPoem(String(payload.poemId), String(payload.parentId))
			: null;

	const keysToInvalidate = [
		poemKey as readonly unknown[],
		baseCommentsKey as readonly unknown[],
		parentCommentsKey as readonly unknown[] | null,
	].filter(Boolean) as ReadonlyArray<readonly unknown[]>;

	await Promise.all(
		keysToInvalidate.map((queryKey) => queryClient.refetchQueries({ queryKey })),
	);
}

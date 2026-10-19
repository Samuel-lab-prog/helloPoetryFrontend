import { interactions } from '@Api/interactions/endpoints';
import { interactionsKeys } from '@Api/interactions/keys';
import { useQuery } from '@tanstack/react-query';

const REPLIES_PAGE_LIMIT = 30;
export const REPLIES_STALE_TIME = 1000 * 60 * 5;

export function buildCommentsKey(poemId: number, authScope: string, parentId?: number) {
	return parentId
		? interactionsKeys.commentsByPoem(String(poemId), {
				authScope,
				parentId: String(parentId),
			})
		: interactionsKeys.commentsByPoem(String(poemId), { authScope });
}

export function fetchPoemCommentReplies(poemId: number, parentId: number) {
	return interactions.getPoemComments
		.query(String(poemId), {
			parentId: String(parentId),
			limit: REPLIES_PAGE_LIMIT,
		})
		.queryFn();
}

export function usePoemCommentReplies(poemId: number, authScope: string, parentId: number) {
	const query = useQuery({
		queryKey: buildCommentsKey(poemId, authScope, parentId),
		queryFn: () => fetchPoemCommentReplies(poemId, parentId),
		enabled: false,
		staleTime: REPLIES_STALE_TIME,
	});

	return {
		replies: query.data?.comments ?? [],
		hasLoadedReplies: query.data !== undefined,
		isLoadingReplies: query.isFetching,
	};
}

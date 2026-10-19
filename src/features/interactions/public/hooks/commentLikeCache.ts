import type { QueryClient, QueryKey } from '@tanstack/react-query';

import type { CommentPage, InfiniteComments, PoemCommentType } from './commentTypes';

export type CommentLikeParams = {
	id: number;
	parentId?: number;
	liked: boolean;
};

type CommentLikeState = Pick<PoemCommentType, 'likesCount' | 'likedByCurrentUser'>;

export type CommentLikeContext = {
	params: CommentLikeParams;
	baseKey: QueryKey;
	repliesKey: QueryKey | null;
	previousBaseState: CommentLikeState | undefined;
	previousRepliesState: CommentLikeState | undefined;
};

function getLikeState(list: PoemCommentType[], id: number): CommentLikeState | undefined {
	const comment = list.find((item) => item.id === id);
	return comment
		? { likesCount: comment.likesCount, likedByCurrentUser: comment.likedByCurrentUser }
		: undefined;
}

function updateLikeState(list: PoemCommentType[], id: number, likedByCurrentUser: boolean) {
	return list.map((comment) =>
		comment.id === id
			? {
					...comment,
					likesCount: Math.max(
						0,
						comment.likesCount +
							(comment.likedByCurrentUser === likedByCurrentUser ? 0 : likedByCurrentUser ? 1 : -1),
					),
					likedByCurrentUser,
				}
			: comment,
	);
}

function updatePages(
	data: InfiniteComments | undefined,
	updater: (comments: PoemCommentType[]) => PoemCommentType[],
) {
	if (!data) return data;
	return {
		...data,
		pages: data.pages.map((page) => ({ ...page, comments: updater(page.comments) })),
	};
}

export async function optimisticallyUpdateCommentLike(
	queryClient: QueryClient,
	params: CommentLikeParams,
	baseKey: QueryKey,
	repliesKey: QueryKey | null,
): Promise<CommentLikeContext> {
	await Promise.all([
		queryClient.cancelQueries({ queryKey: baseKey }),
		...(repliesKey ? [queryClient.cancelQueries({ queryKey: repliesKey })] : []),
	]);
	const baseData = queryClient.getQueryData<InfiniteComments>(baseKey);
	const repliesData = repliesKey ? queryClient.getQueryData<CommentPage>(repliesKey) : undefined;
	const context: CommentLikeContext = {
		params,
		baseKey,
		repliesKey,
		previousBaseState: baseData
			? baseData.pages.reduce<CommentLikeState | undefined>(
					(state, page) => state ?? getLikeState(page.comments, params.id),
					undefined,
				)
			: undefined,
		previousRepliesState: repliesData ? getLikeState(repliesData.comments, params.id) : undefined,
	};
	queryClient.setQueryData<InfiniteComments>(baseKey, (current) =>
		updatePages(current, (comments) => updateLikeState(comments, params.id, params.liked)),
	);
	if (repliesKey) {
		queryClient.setQueryData<CommentPage>(repliesKey, (current) =>
			current
				? {
						...current,
						comments: updateLikeState(current.comments, params.id, params.liked),
					}
				: current,
		);
	}
	return context;
}

export function rollbackCommentLike(queryClient: QueryClient, context: CommentLikeContext) {
	const { params, baseKey, repliesKey, previousBaseState, previousRepliesState } = context;
	if (previousBaseState) {
		queryClient.setQueryData<InfiniteComments>(baseKey, (current) =>
			updatePages(current, (comments) =>
				comments.map((comment) =>
					comment.id === params.id ? { ...comment, ...previousBaseState } : comment,
				),
			),
		);
	}
	if (previousRepliesState && repliesKey) {
		queryClient.setQueryData<CommentPage>(repliesKey, (current) =>
			current
				? {
						...current,
						comments: current.comments.map((comment) =>
							comment.id === params.id ? { ...comment, ...previousRepliesState } : comment,
						),
					}
				: current,
		);
	}
}

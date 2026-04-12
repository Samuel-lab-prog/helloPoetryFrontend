import { interactions } from '@Api/interactions/endpoints';
import { interactionsKeys } from '@Api/interactions/keys';
import { getPoemsCachePort } from '@core/ports/poems';
import { eventBus } from '@root/core/events/eventBus';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';

export type PoemCommentType = {
	id: number;
	poemId: number;
	content: string;
	createdAt: string;
	status: 'visible' | 'deletedByAuthor' | 'deletedByModerator';
	parentId: number | null;
	aggregateChildrenCount: number;
	likesCount: number;
	likedByCurrentUser: boolean;
	author: {
		id: number;
		nickname: string;
		avatarUrl: string | null;
	};
};

type UsePoemCommentsOptions = {
	enabled?: boolean;
};

type CommentMutationParams = {
	id: number;
	parentId?: number;
};

type CreateCommentParams = {
	content: string;
	parentId?: number;
};

const COMMENTS_PAGE_LIMIT = 30;
const REPLIES_PAGE_LIMIT = 30;
const REPLIES_STALE_TIME = 1000 * 60 * 5;

function buildCommentsKey(poemId: number, parentId?: number) {
	return parentId
		? interactionsKeys.commentsByPoem(String(poemId), { parentId: String(parentId) })
		: interactionsKeys.commentsByPoem(String(poemId));
}

type CommentPage = {
	comments: PoemCommentType[];
	hasMore: boolean;
	nextCursor?: number;
};

type InfiniteComments = {
	pages: CommentPage[];
	pageParams: unknown[];
};

function updatePages(
	data: InfiniteComments | undefined,
	updater: (list: PoemCommentType[]) => PoemCommentType[],
) {
	if (!data) return data;
	return {
		...data,
		pages: data.pages.map((page) => ({
			...page,
			comments: updater(page.comments),
		})),
	};
}

async function prepareCommentQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	poemId: number,
	parentId?: number,
) {
	const baseKey = buildCommentsKey(poemId);
	const repliesKey = parentId ? buildCommentsKey(poemId, parentId) : null;

	await queryClient.cancelQueries({ queryKey: baseKey });
	if (repliesKey) await queryClient.cancelQueries({ queryKey: repliesKey });

	const previousBase = queryClient.getQueryData<InfiniteComments>(baseKey);
	const previousReplies = repliesKey
		? queryClient.getQueryData<CommentPage>(repliesKey)
		: undefined;

	return { previousBase, previousReplies, baseKey, repliesKey };
}

function restoreCommentQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	context?: {
		previousBase?: InfiniteComments;
		previousReplies?: CommentPage;
		baseKey: ReturnType<typeof buildCommentsKey>;
		repliesKey: ReturnType<typeof buildCommentsKey> | null;
	},
) {
	if (!context) return;
	queryClient.setQueryData(context.baseKey, context.previousBase);
	if (context.repliesKey) {
		queryClient.setQueryData(context.repliesKey, context.previousReplies);
	}
}

function removeCommentFromList(list: PoemCommentType[], params: CommentMutationParams) {
	return list
		.filter((comment) => comment.id !== params.id)
		.map((comment) =>
			params.parentId && comment.id === params.parentId
				? {
						...comment,
						aggregateChildrenCount: Math.max(0, comment.aggregateChildrenCount - 1),
					}
				: comment,
		);
}

function updateLikeState(
	list: PoemCommentType[],
	params: CommentMutationParams,
	delta: number,
	likedByCurrentUser: boolean,
) {
	return list.map((comment) =>
		comment.id === params.id
			? {
					...comment,
					likesCount: Math.max(0, comment.likesCount + delta),
					likedByCurrentUser,
				}
			: comment,
	);
}

function getCreateCommentErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 404) return 'Poem not found.';
	if (error.statusCode === 403) return 'You cannot comment on this poem.';
	if (error.statusCode === 422) return 'Invalid comment (1-3000 chars).';
	return 'Error sending comment.';
}

function getDeleteCommentErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 403) return 'You cannot delete this comment.';
	if (error.statusCode === 404) return 'Comment not found.';
	return 'Error deleting comment.';
}

function getToggleLikeErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 404) return 'Comment not found.';
	if (error.statusCode === 409) return '';
	return 'Error updating comment like.';
}

export function usePoemComments(poemId: number, options: UsePoemCommentsOptions = {}) {
	const queryClient = useQueryClient();
	const poemsCachePort = getPoemsCachePort();
	const isEnabled = options.enabled ?? true;
	const poemKey = poemsCachePort.getPoemKey(poemId);
	const [updatingLikeCommentId, setUpdatingLikeCommentId] = useState<number | null>(null);

	const query = useInfiniteQuery({
		queryKey: buildCommentsKey(poemId),
		enabled: isEnabled && !!poemId,
		queryFn: ({ pageParam }) =>
			interactions.getPoemComments
				.query(String(poemId), {
					limit: COMMENTS_PAGE_LIMIT,
					cursor: typeof pageParam === 'number' ? pageParam : undefined,
				})
				.queryFn(),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
	});

	const mutation = useMutation({
		mutationFn: (params: CreateCommentParams) =>
			interactions.commentPoem.mutate({
				poemId,
				content: params.content,
				parentId: params.parentId,
			}),
		onSuccess: (_, variables) =>
			eventBus.publish('commentCreated', {
				poemId,
				parentId: variables.parentId,
				createdAt: new Date().toISOString(),
			}),
	});

	const deleteMutation = useMutation({
		mutationFn: (params: CommentMutationParams) =>
			interactions.deleteComment.mutate(String(params.id)),
		onMutate: async (params) => {
			const context = await prepareCommentQueries(queryClient, poemId, params.parentId);
			if (context.previousBase) {
				queryClient.setQueryData<InfiniteComments>(
					context.baseKey,
					updatePages(context.previousBase, (list) => removeCommentFromList(list, params)),
				);
			}
			if (context.repliesKey && context.previousReplies) {
				queryClient.setQueryData<CommentPage>(context.repliesKey, {
					...context.previousReplies,
					comments: context.previousReplies.comments.filter((comment) => comment.id !== params.id),
				});
			}
			return context;
		},
		onError: (_, __, context) => restoreCommentQueries(queryClient, context),
		onSuccess: (_, params) => {
			const baseKey = buildCommentsKey(poemId);
			const repliesKey = params.parentId ? buildCommentsKey(poemId, params.parentId) : null;

			queryClient.invalidateQueries({ queryKey: baseKey });
			if (repliesKey) queryClient.invalidateQueries({ queryKey: repliesKey });
			queryClient.invalidateQueries({ queryKey: poemKey });
		},
	});

	const likeCommentMutation = useMutation({
		mutationFn: (params: CommentMutationParams) =>
			interactions.likeComment.mutate(String(params.id)),
		onMutate: async (params) => {
			setUpdatingLikeCommentId(params.id);
			const context = await prepareCommentQueries(queryClient, poemId, params.parentId);
			if (context.previousBase) {
				queryClient.setQueryData(
					context.baseKey,
					updatePages(context.previousBase, (list) => updateLikeState(list, params, 1, true)),
				);
			}
			if (context.repliesKey && context.previousReplies) {
				queryClient.setQueryData(context.repliesKey, {
					...context.previousReplies,
					comments: updateLikeState(context.previousReplies.comments, params, 1, true),
				});
			}
			return context;
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			restoreCommentQueries(queryClient, context);
		},
		onSettled: (_data, _error, params) => {
			if (!params?.id) return;
			setUpdatingLikeCommentId((current) => (current === params.id ? null : current));
		},
	});

	const unlikeCommentMutation = useMutation({
		mutationFn: (params: CommentMutationParams) =>
			interactions.unlikeComment.mutate(String(params.id)),
		onMutate: async (params) => {
			setUpdatingLikeCommentId(params.id);
			const context = await prepareCommentQueries(queryClient, poemId, params.parentId);
			if (context.previousBase) {
				queryClient.setQueryData(
					context.baseKey,
					updatePages(context.previousBase, (list) => updateLikeState(list, params, -1, false)),
				);
			}
			if (context.repliesKey && context.previousReplies) {
				queryClient.setQueryData(context.repliesKey, {
					...context.previousReplies,
					comments: updateLikeState(context.previousReplies.comments, params, -1, false),
				});
			}
			return context;
		},
		onError: (error, _variables, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) return;
			restoreCommentQueries(queryClient, context);
		},
		onSettled: (_data, _error, params) => {
			if (!params?.id) return;
			setUpdatingLikeCommentId((current) => (current === params.id ? null : current));
		},
	});

	function fetchReplies(parentId: number, options?: { force?: boolean }) {
		return queryClient
			.fetchQuery({
				queryKey: buildCommentsKey(poemId, parentId),
				queryFn: () =>
					interactions.getPoemComments
						.query(String(poemId), {
							parentId: String(parentId),
							limit: REPLIES_PAGE_LIMIT,
						})
						.queryFn(),
				staleTime: options?.force ? 0 : REPLIES_STALE_TIME,
			})
			.then((page) => page.comments);
	}

	function prefetchReplies(parentId: number) {
		return queryClient.prefetchQuery({
			queryKey: buildCommentsKey(poemId, parentId),
			queryFn: () =>
				interactions.getPoemComments
					.query(String(poemId), {
						parentId: String(parentId),
						limit: REPLIES_PAGE_LIMIT,
					})
					.queryFn(),
			staleTime: REPLIES_STALE_TIME,
		});
	}

	return {
		comments: query.data?.pages.flatMap((page) => page.comments) ?? [],
		isLoadingComments: query.isLoading,
		isCommentsError: query.isError,
		hasMoreComments: query.hasNextPage ?? false,
		isLoadingMoreComments: query.isFetchingNextPage,
		loadMoreComments: () => query.fetchNextPage(),
		createComment: mutation.mutateAsync,
		isCreatingComment: mutation.isPending,
		createCommentError: getCreateCommentErrorMessage(
			mutation.error as unknown as AppErrorType | null,
		),
		deleteComment: (args: CommentMutationParams) => deleteMutation.mutateAsync(args),
		isDeletingComment: (commentId: number) =>
			deleteMutation.isPending && deleteMutation.variables?.id === commentId,
		deleteCommentError: getDeleteCommentErrorMessage(
			deleteMutation.error as unknown as AppErrorType | null,
		),
		likeComment: (args: CommentMutationParams) => likeCommentMutation.mutateAsync(args),
		unlikeComment: (args: CommentMutationParams) => unlikeCommentMutation.mutateAsync(args),
		updatingLikeCommentId,
		likeCommentError: getToggleLikeErrorMessage(
			(likeCommentMutation.error || unlikeCommentMutation.error) as unknown as AppErrorType | null,
		),
		fetchReplies,
		prefetchReplies,
		refetchComments: query.refetch,
	};
}

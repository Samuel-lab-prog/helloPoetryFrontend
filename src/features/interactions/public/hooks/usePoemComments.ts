import { interactions } from '@Api/interactions/endpoints';
import { type OptimisticSnapshot, restoreSnapshot, snapshotQueryData } from '@Api/optimistic';
import { getPoemsCachePort } from '@core/ports/poems';
import {
	getAccessDeniedMessage,
	getBannedPrivilegeMessage,
	isBannedAccessError,
	useAuthCacheScope,
} from '@features/auth/public';
import { eventBus } from '@root/core/events/eventBus';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useRef, useState } from 'react';

import {
	type CommentLikeParams,
	optimisticallyUpdateCommentLike,
	rollbackCommentLike,
} from './commentLikeCache';
import { buildCommentsKey, fetchPoemCommentReplies, REPLIES_STALE_TIME } from './commentQueries';
import type { CommentPage, InfiniteComments, PoemCommentType } from './commentTypes';

export type { PoemCommentType } from './commentTypes';

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
export { usePoemCommentReplies } from './commentQueries';

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
	authScope: string,
	parentId?: number,
) {
	const baseKey = buildCommentsKey(poemId, authScope);
	const repliesKey = parentId ? buildCommentsKey(poemId, authScope, parentId) : null;

	const previousBase = await snapshotQueryData<InfiniteComments>(queryClient, baseKey);
	const previousReplies = repliesKey
		? await snapshotQueryData<CommentPage>(queryClient, repliesKey)
		: undefined;

	return { previousBase, previousReplies, baseKey, repliesKey };
}

type CommentQueryContext = {
	previousBase: OptimisticSnapshot<InfiniteComments>;
	previousReplies?: OptimisticSnapshot<CommentPage>;
	baseKey: ReturnType<typeof buildCommentsKey>;
	repliesKey: ReturnType<typeof buildCommentsKey> | null;
};

function restoreCommentQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	context?: CommentQueryContext,
) {
	if (!context) return;
	restoreSnapshot(queryClient, context.previousBase);
	restoreSnapshot(queryClient, context.previousReplies);
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

function getCreateCommentErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 401 && isBannedAccessError(error)) {
		return getBannedPrivilegeMessage('write comments');
	}
	if (error.statusCode === 404) return 'Poem not found.';
	if (error.statusCode === 403) {
		return getAccessDeniedMessage({
			fallback: 'You cannot comment on this poem.',
			suspendedAction: 'write comments',
		});
	}
	if (error.statusCode === 422) return 'Invalid comment (1-3000 chars).';
	return 'Error sending comment.';
}

function getCommentsErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 401 && isBannedAccessError(error)) {
		return getBannedPrivilegeMessage('view comments');
	}
	if (error.statusCode === 403) {
		return getAccessDeniedMessage({
			fallback: 'You cannot view comments for this poem.',
			suspendedAction: 'view comments',
		});
	}
	if (error.statusCode === 404) return 'Poem not found.';
	return 'We could not load comments right now. Please try again in a moment, or refresh the page.';
}

function getDeleteCommentErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 401 && isBannedAccessError(error)) {
		return getBannedPrivilegeMessage('delete comments');
	}
	if (error.statusCode === 403) {
		return getAccessDeniedMessage({
			fallback: 'You cannot delete this comment.',
			suspendedAction: 'delete comments',
		});
	}
	if (error.statusCode === 404) return 'Comment not found.';
	return 'Error deleting comment.';
}

function getToggleLikeErrorMessage(error: AppErrorType | null) {
	if (!error) return '';
	if (error.statusCode === 401 && isBannedAccessError(error)) {
		return getBannedPrivilegeMessage('like comments');
	}
	if (error.statusCode === 404) return 'Comment not found.';
	if (error.statusCode === 409) return '';
	if (error.statusCode === 403) {
		return getAccessDeniedMessage({
			fallback: 'You cannot like this comment.',
			suspendedAction: 'like comments',
		});
	}
	return 'Error updating comment like.';
}

export function usePoemComments(poemId: number, options: UsePoemCommentsOptions = {}) {
	const queryClient = useQueryClient();
	const poemsCachePort = getPoemsCachePort();
	const authScope = useAuthCacheScope();
	const isEnabled = options.enabled ?? true;
	const canUseCommentData = isEnabled && !!poemId;
	const poemKey = poemsCachePort.getPoemKey(poemId);
	const [updatingLikeCommentIds, setUpdatingLikeCommentIds] = useState<ReadonlySet<number>>(
		() => new Set(),
	);
	const pendingLikeIds = useRef(new Set<number>());
	const commentsToReconcile = useRef(new Set<number>());

	const query = useInfiniteQuery({
		queryKey: buildCommentsKey(poemId, authScope),
		enabled: canUseCommentData,
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
			const context = await prepareCommentQueries(queryClient, poemId, authScope, params.parentId);
			if (context.previousBase.data) {
				queryClient.setQueryData<InfiniteComments>(
					context.baseKey,
					updatePages(context.previousBase.data, (list) => removeCommentFromList(list, params)),
				);
			}
			if (context.repliesKey && context.previousReplies?.data) {
				queryClient.setQueryData<CommentPage>(context.repliesKey, {
					...context.previousReplies.data,
					comments: context.previousReplies.data.comments.filter(
						(comment) => comment.id !== params.id,
					),
				});
			}
			return context;
		},
		onError: (_, __, context) => restoreCommentQueries(queryClient, context),
		onSuccess: (_, params) => {
			const baseKey = buildCommentsKey(poemId, authScope);
			const repliesKey = params.parentId
				? buildCommentsKey(poemId, authScope, params.parentId)
				: null;

			queryClient.invalidateQueries({ queryKey: baseKey });
			if (repliesKey) queryClient.invalidateQueries({ queryKey: repliesKey });
			queryClient.invalidateQueries({ queryKey: poemKey });
		},
	});

	const commentLikeMutationKey = ['comment-like', poemId, authScope] as const;
	const commentLikeMutation = useMutation({
		mutationKey: commentLikeMutationKey,
		mutationFn: (params: CommentLikeParams) =>
			params.liked
				? interactions.likeComment.mutate(String(params.id))
				: interactions.unlikeComment.mutate(String(params.id)),
		onMutate: (params) => {
			const baseKey = buildCommentsKey(poemId, authScope);
			const repliesKey = params.parentId
				? buildCommentsKey(poemId, authScope, params.parentId)
				: null;
			return optimisticallyUpdateCommentLike(queryClient, params, baseKey, repliesKey);
		},
		onError: (error, params, context) => {
			const appError = error as unknown as AppErrorType;
			if (appError?.statusCode === 409) {
				commentsToReconcile.current.add(params.parentId ?? 0);
				return;
			}
			if (!context) return;
			rollbackCommentLike(queryClient, context);
		},
		onSettled: async () => {
			if (queryClient.isMutating({ mutationKey: commentLikeMutationKey }) !== 1) return;
			const parentsToReconcile = [...commentsToReconcile.current];
			if (parentsToReconcile.length === 0) return;
			commentsToReconcile.current.clear();
			await queryClient.invalidateQueries({
				queryKey: buildCommentsKey(poemId, authScope),
				exact: true,
			});
			await Promise.allSettled(
				parentsToReconcile
					.filter((parentId) => parentId > 0)
					.map((parentId) => fetchReplies(parentId, { force: true })),
			);
		},
	});

	async function toggleCommentLike(params: CommentMutationParams, liked: boolean) {
		if (!canUseCommentData || pendingLikeIds.current.has(params.id)) return;
		pendingLikeIds.current.add(params.id);
		setUpdatingLikeCommentIds(new Set(pendingLikeIds.current));
		try {
			await commentLikeMutation.mutateAsync({ ...params, liked });
		} finally {
			pendingLikeIds.current.delete(params.id);
			setUpdatingLikeCommentIds(new Set(pendingLikeIds.current));
		}
	}

	function fetchReplies(parentId: number, options?: { force?: boolean }) {
		if (!canUseCommentData) return Promise.resolve([]);

		return queryClient
			.fetchQuery({
				queryKey: buildCommentsKey(poemId, authScope, parentId),
				queryFn: () => fetchPoemCommentReplies(poemId, parentId),
				staleTime: options?.force ? 0 : REPLIES_STALE_TIME,
			})
			.then((page) => page.comments);
	}

	function prefetchReplies(parentId: number) {
		if (!canUseCommentData) return Promise.resolve();

		return queryClient.prefetchQuery({
			queryKey: buildCommentsKey(poemId, authScope, parentId),
			queryFn: () => fetchPoemCommentReplies(poemId, parentId),
			staleTime: REPLIES_STALE_TIME,
		});
	}

	return {
		comments: canUseCommentData ? (query.data?.pages.flatMap((page) => page.comments) ?? []) : [],
		isLoadingComments: canUseCommentData && query.isLoading,
		isCommentsError: canUseCommentData && query.isError,
		commentsError: getCommentsErrorMessage(query.error as unknown as AppErrorType | null),
		hasMoreComments: canUseCommentData ? (query.hasNextPage ?? false) : false,
		isLoadingMoreComments: canUseCommentData && query.isFetchingNextPage,
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
		likeComment: (args: CommentMutationParams) => toggleCommentLike(args, true),
		unlikeComment: (args: CommentMutationParams) => toggleCommentLike(args, false),
		updatingLikeCommentIds,
		likeCommentError: getToggleLikeErrorMessage(
			commentLikeMutation.error as unknown as AppErrorType | null,
		),
		authScope,
		fetchReplies,
		prefetchReplies,
		refetchComments: query.refetch,
	};
}

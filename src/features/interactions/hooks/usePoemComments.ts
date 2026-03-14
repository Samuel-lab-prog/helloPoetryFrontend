import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@features/base';
import { api, apiKeys, interactionsKeys } from '@root/core/api';
import { eventBus } from '@root/core/events/eventBus';

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

export function usePoemComments(poemId: number, options: UsePoemCommentsOptions = {}) {
	const queryClient = useQueryClient();
	const isEnabled = options.enabled ?? true;
	const poemKey = apiKeys.poems.byId(String(poemId));

	const query = useQuery({
		queryKey: interactionsKeys.commentsByPoem(String(poemId)),
		enabled: isEnabled && !!poemId,
		queryFn: () => api.interactions.getPoemComments.query(String(poemId)).queryFn(),
	});

	const mutation = useMutation({
		mutationFn: (params: { content: string; parentId?: number }) =>
			api.interactions.commentPoem.mutate({
				poemId: String(poemId),
				content: params.content,
				parentId: params.parentId ? String(params.parentId) : undefined,
			}),
		onSuccess: (_, variables) =>
			eventBus.publish('commentCreated', {
				poemId,
				parentId: variables.parentId,
				createdAt: new Date().toISOString(),
			}),
	});

	const deleteMutation = useMutation({
		mutationFn: (params: { id: number; parentId?: number }) =>
			api.interactions.deleteComment.mutate(String(params.id)),
		onMutate: async (params) => {
			const baseKey = interactionsKeys.commentsByPoem(String(poemId));
			const repliesKey = params.parentId
				? interactionsKeys.commentsByPoem(String(poemId), String(params.parentId))
				: null;

			await queryClient.cancelQueries({ queryKey: baseKey });
			if (repliesKey) await queryClient.cancelQueries({ queryKey: repliesKey });

			const previousBase = queryClient.getQueryData<PoemCommentType[]>(baseKey);
			const previousReplies = repliesKey
				? queryClient.getQueryData<PoemCommentType[]>(repliesKey)
				: undefined;

			if (previousBase) {
				queryClient.setQueryData<PoemCommentType[]>(
					baseKey,
					previousBase
						.filter((comment) => comment.id !== params.id)
						.map((comment) =>
							params.parentId && comment.id === params.parentId
								? {
										...comment,
										aggregateChildrenCount: Math.max(0, comment.aggregateChildrenCount - 1),
									}
								: comment,
						),
				);
			}

			if (repliesKey && previousReplies) {
				queryClient.setQueryData<PoemCommentType[]>(
					repliesKey,
					previousReplies.filter((comment) => comment.id !== params.id),
				);
			}

			return { previousBase, previousReplies, baseKey, repliesKey };
		},
		onError: (_, __, context) => {
			if (!context) return;
			queryClient.setQueryData(context.baseKey, context.previousBase);
			if (context.repliesKey) {
				queryClient.setQueryData(context.repliesKey, context.previousReplies);
			}
		},
		onSuccess: (_, params) => {
			const baseKey = interactionsKeys.commentsByPoem(String(poemId));
			const repliesKey = params.parentId
				? interactionsKeys.commentsByPoem(String(poemId), String(params.parentId))
				: null;

			queryClient.invalidateQueries({ queryKey: baseKey });
			if (repliesKey) queryClient.invalidateQueries({ queryKey: repliesKey });
			queryClient.invalidateQueries({ queryKey: poemKey });
		},
	});

	const likeCommentMutation = useMutation({
		mutationFn: (params: { id: number; parentId?: number }) =>
			api.interactions.likeComment.mutate(String(params.id)),
		onMutate: async (params) => {
			const baseKey = interactionsKeys.commentsByPoem(String(poemId));
			const repliesKey = params.parentId
				? interactionsKeys.commentsByPoem(String(poemId), String(params.parentId))
				: null;

			await queryClient.cancelQueries({ queryKey: baseKey });
			if (repliesKey) await queryClient.cancelQueries({ queryKey: repliesKey });

			const previousBase = queryClient.getQueryData<PoemCommentType[]>(baseKey);
			const previousReplies = repliesKey
				? queryClient.getQueryData<PoemCommentType[]>(repliesKey)
				: undefined;

			const applyLike = (list?: PoemCommentType[]) =>
				list?.map((comment) =>
					comment.id === params.id
						? {
								...comment,
								likesCount: comment.likesCount + 1,
								likedByCurrentUser: true,
							}
						: comment,
				);

			if (previousBase) queryClient.setQueryData(baseKey, applyLike(previousBase));
			if (repliesKey && previousReplies)
				queryClient.setQueryData(repliesKey, applyLike(previousReplies));

			return { previousBase, previousReplies, baseKey, repliesKey };
		},
		onError: (_, __, context) => {
			if (!context) return;
			queryClient.setQueryData(context.baseKey, context.previousBase);
			if (context.repliesKey) {
				queryClient.setQueryData(context.repliesKey, context.previousReplies);
			}
		},
		onSuccess: (_, params) => {
			const baseKey = interactionsKeys.commentsByPoem(String(poemId));
			const repliesKey = params.parentId
				? interactionsKeys.commentsByPoem(String(poemId), String(params.parentId))
				: null;
			queryClient.invalidateQueries({ queryKey: baseKey });
			if (repliesKey) queryClient.invalidateQueries({ queryKey: repliesKey });
		},
	});

	const unlikeCommentMutation = useMutation({
		mutationFn: (params: { id: number; parentId?: number }) =>
			api.interactions.unlikeComment.mutate(String(params.id)),
		onMutate: async (params) => {
			const baseKey = interactionsKeys.commentsByPoem(String(poemId));
			const repliesKey = params.parentId
				? interactionsKeys.commentsByPoem(String(poemId), String(params.parentId))
				: null;

			await queryClient.cancelQueries({ queryKey: baseKey });
			if (repliesKey) await queryClient.cancelQueries({ queryKey: repliesKey });

			const previousBase = queryClient.getQueryData<PoemCommentType[]>(baseKey);
			const previousReplies = repliesKey
				? queryClient.getQueryData<PoemCommentType[]>(repliesKey)
				: undefined;

			const applyUnlike = (list?: PoemCommentType[]) =>
				list?.map((comment) =>
					comment.id === params.id
						? {
								...comment,
								likesCount: Math.max(0, comment.likesCount - 1),
								likedByCurrentUser: false,
							}
						: comment,
				);

			if (previousBase) queryClient.setQueryData(baseKey, applyUnlike(previousBase));
			if (repliesKey && previousReplies)
				queryClient.setQueryData(repliesKey, applyUnlike(previousReplies));

			return { previousBase, previousReplies, baseKey, repliesKey };
		},
		onError: (_, __, context) => {
			if (!context) return;
			queryClient.setQueryData(context.baseKey, context.previousBase);
			if (context.repliesKey) {
				queryClient.setQueryData(context.repliesKey, context.previousReplies);
			}
		},
		onSuccess: (_, params) => {
			const baseKey = interactionsKeys.commentsByPoem(String(poemId));
			const repliesKey = params.parentId
				? interactionsKeys.commentsByPoem(String(poemId), String(params.parentId))
				: null;
			queryClient.invalidateQueries({ queryKey: baseKey });
			if (repliesKey) queryClient.invalidateQueries({ queryKey: repliesKey });
		},
	});

	function fetchReplies(parentId: number) {
		return queryClient.fetchQuery({
			queryKey: interactionsKeys.commentsByPoem(String(poemId), String(parentId)),
			queryFn: () =>
				api.interactions.getPoemComments.query(String(poemId), String(parentId)).queryFn(),
			staleTime: 1000 * 30,
		});
	}

	function getErrorMessage() {
		const error = mutation.error as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 404) return 'Poema não encontrado.';
		if (error.statusCode === 403) return 'Você não pode comentar neste poema.';
		if (error.statusCode === 422) return 'Comentário inválido (1-300 chars).';
		return 'Erro ao enviar comentário.';
	}

	function getDeleteErrorMessage() {
		const error = deleteMutation.error as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 403) return 'Você não pode deletar este comentário.';
		if (error.statusCode === 404) return 'Comentário não encontrado.';
		return 'Erro ao deletar comentário.';
	}

	function getLikeCommentErrorMessage() {
		const error = (likeCommentMutation.error || unlikeCommentMutation.error) as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 404) return 'Comentário não encontrado.';
		if (error.statusCode === 409) return 'Estado de curtida inválido.';
		return 'Erro ao atualizar curtida do comentário.';
	}

	return {
		comments: query.data ?? [],
		isLoadingComments: query.isLoading,
		isCommentsError: query.isError,
		createComment: mutation.mutateAsync,
		isCreatingComment: mutation.isPending,
		createCommentError: getErrorMessage(),
		deleteComment: (args: { id: number; parentId?: number }) => deleteMutation.mutateAsync(args),
		isDeletingComment: deleteMutation.isPending,
		deleteCommentError: getDeleteErrorMessage(),
		likeComment: (args: { id: number; parentId?: number }) => likeCommentMutation.mutateAsync(args),
		unlikeComment: (args: { id: number; parentId?: number }) =>
			unlikeCommentMutation.mutateAsync(args),
		isUpdatingCommentLike: likeCommentMutation.isPending || unlikeCommentMutation.isPending,
		likeCommentError: getLikeCommentErrorMessage(),
		fetchReplies,
		refetchComments: query.refetch,
	};
}

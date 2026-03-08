import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

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

export function usePoemComments(poemId: number) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['poem-comments', poemId],
		enabled: !!poemId,
		queryFn: () =>
			createHTTPRequest<PoemCommentType[]>({
				path: '/interactions/poems',
				params: [poemId, 'comments'],
			}),
	});

	const mutation = useMutation({
		mutationFn: (params: { content: string; parentId?: number }) =>
			createHTTPRequest<void, { content: string; parentId?: number }>({
				path: '/interactions/poems',
				params: [poemId, 'comments'],
				method: 'POST',
				body: params,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['poem-comments', poemId] });
			queryClient.invalidateQueries({
				queryKey: ['poem-comments-replies', poemId],
			});
			queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (commentId: number) =>
			createHTTPRequest<void>({
				path: '/interactions/comments',
				params: [commentId],
				method: 'DELETE',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['poem-comments', poemId] });
			queryClient.invalidateQueries({
				queryKey: ['poem-comments-replies', poemId],
			});
			queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
		},
	});

	const likeCommentMutation = useMutation({
		mutationFn: (commentId: number) =>
			createHTTPRequest<void>({
				path: '/interactions/comments',
				params: [commentId, 'like'],
				method: 'POST',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['poem-comments', poemId] });
			queryClient.invalidateQueries({
				queryKey: ['poem-comments-replies', poemId],
			});
		},
	});

	const unlikeCommentMutation = useMutation({
		mutationFn: (commentId: number) =>
			createHTTPRequest<void>({
				path: '/interactions/comments',
				params: [commentId, 'like'],
				method: 'DELETE',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['poem-comments', poemId] });
			queryClient.invalidateQueries({
				queryKey: ['poem-comments-replies', poemId],
			});
		},
	});

	function fetchReplies(parentId: number) {
		return queryClient.fetchQuery({
			queryKey: ['poem-comments-replies', poemId, parentId],
			queryFn: () =>
				createHTTPRequest<PoemCommentType[]>({
					path: '/interactions/poems',
					params: [poemId, 'comments'],
					query: { parentId },
				}),
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
		deleteComment: deleteMutation.mutateAsync,
		isDeletingComment: deleteMutation.isPending,
		deleteCommentError: getDeleteErrorMessage(),
		likeComment: likeCommentMutation.mutateAsync,
		unlikeComment: unlikeCommentMutation.mutateAsync,
		isUpdatingCommentLike: likeCommentMutation.isPending || unlikeCommentMutation.isPending,
		likeCommentError: getLikeCommentErrorMessage(),
		fetchReplies,
		refetchComments: query.refetch,
	};
}

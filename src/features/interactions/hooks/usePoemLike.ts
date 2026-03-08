import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

export function usePoemLike(poemId: number) {
	const queryClient = useQueryClient();

	const likeMutation = useMutation({
		mutationFn: () =>
			createHTTPRequest<void>({
				path: '/interactions/poems',
				params: [poemId, 'like'],
				method: 'POST',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
		},
	});

	const unlikeMutation = useMutation({
		mutationFn: () =>
			createHTTPRequest<void>({
				path: '/interactions/poems',
				params: [poemId, 'like'],
				method: 'DELETE',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
		},
	});

	function getErrorMessage() {
		const error = (likeMutation.error || unlikeMutation.error) as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 404) return 'Poema não encontrado.';
		if (error.statusCode === 409) return 'Poema ja curtido.';
		return 'Erro ao atualizar curtida.';
	}

	return {
		likePoem: likeMutation.mutateAsync,
		unlikePoem: unlikeMutation.mutateAsync,
		isUpdatingLike: likeMutation.isPending || unlikeMutation.isPending,
		likeError: getErrorMessage(),
	};
}

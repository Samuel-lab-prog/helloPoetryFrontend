import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

export function useFriendRequestActions() {
	const queryClient = useQueryClient();

	const acceptMutation = useMutation({
		mutationFn: (requesterId: number) =>
			createHTTPRequest<unknown>({
				path: '/friends/accept',
				params: [requesterId],
				method: 'PATCH',
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
	});

	const rejectMutation = useMutation({
		mutationFn: (requesterId: number) =>
			createHTTPRequest<unknown>({
				path: '/friends/reject',
				params: [requesterId],
				method: 'PATCH',
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
	});

	function getErrorMessage() {
		const err = (acceptMutation.error || rejectMutation.error) as
			| AppErrorType
			| undefined;
		if (!err) return '';
		if (err.statusCode === 404) return 'Solicitacao nao encontrada.';
		if (err.statusCode === 403) return 'Voce nao pode executar esta acao.';
		return 'Erro ao processar solicitacao.';
	}

	return {
		acceptRequest: acceptMutation.mutateAsync,
		rejectRequest: rejectMutation.mutateAsync,
		isAccepting: acceptMutation.isPending,
		isRejecting: rejectMutation.isPending,
		errorMessage: getErrorMessage(),
	};
}

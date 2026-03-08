import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

type FriendRequestResult = {
	id: number;
	requesterId: number;
	addresseeId: number;
	createdAt: string;
};

export function useSendFriendRequest() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (authorId: number) =>
			createHTTPRequest<FriendRequestResult>({
				path: '/friends',
				params: [authorId],
				method: 'POST',
			}),
		onSuccess: (_, authorId) => {
			queryClient.invalidateQueries({ queryKey: ['author-profile', authorId] });
		},
	});

	function getErrorMessage() {
		const err = mutation.error as AppErrorType | null;
		if (!err) return '';

		if (err.statusCode === 409) return 'Pedido ja enviado ou relação ja existe.';
		if (err.statusCode === 403) return 'Você não pode enviar pedido para este usuário.';
		if (err.statusCode === 404) return 'Autor não encontrado.';
		return 'Erro ao enviar pedido de amizade.';
	}

	return {
		sendFriendRequest: mutation.mutateAsync,
		isSending: mutation.isPending,
		isSuccess: mutation.isSuccess,
		errorMessage: getErrorMessage(),
		reset: mutation.reset,
	};
}

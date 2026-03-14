import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@features/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';

export function useFriendRequestActions() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const profileKey = clientId
		? apiKeys.users.profile(String(clientId))
		: (['users', 'profile'] as const);

	const acceptMutation = useMutation({
		mutationFn: (requesterId: number) =>
			api.friends.acceptFriendRequest.mutate(String(requesterId)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
			queryClient.invalidateQueries({ queryKey: apiKeys.friends.requests() });
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (requesterId: number) =>
			api.friends.rejectFriendRequest.mutate(String(requesterId)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
			queryClient.invalidateQueries({ queryKey: apiKeys.friends.requests() });
		},
	});

	function getErrorMessage() {
		const err = (acceptMutation.error || rejectMutation.error) as AppErrorType | undefined;
		if (!err) return '';
		if (err.statusCode === 404) return 'Solicitação não encontrada.';
		if (err.statusCode === 403) return 'Você não pode executar esta ação.';
		return 'Erro ao processar solicitação.';
	}

	return {
		acceptRequest: acceptMutation.mutateAsync,
		rejectRequest: rejectMutation.mutateAsync,
		isAccepting: acceptMutation.isPending,
		isRejecting: rejectMutation.isPending,
		errorMessage: getErrorMessage(),
	};
}

/* eslint-disable no-restricted-imports */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AppErrorType } from '@features/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';

type UpdateMyProfileInput = {
	name?: string;
	nickname?: string;
	bio?: string;
	avatarUrl?: string;
};

type ConflictField = 'nickname' | null;

export function useUpdateMyProfile() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const profileKey = clientId
		? apiKeys.users.profile(String(clientId))
		: (['users', 'profile'] as const);

	const mutation = useMutation({
		mutationFn: (data: UpdateMyProfileInput) =>
			api.users.updateUser.mutate({
				id: String(clientId),
				name: data.name,
				nickname: data.nickname,
				bio: data.bio,
				avatarUrl: data.avatarUrl,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey });
		},
	});

	function getErrorMessage() {
		const error = mutation.error as AppErrorType | null;
		if (!error) return '';
		if (error.statusCode === 401) return 'Faca login para editar seu perfil.';
		if (error.statusCode === 403) return 'Voce nao tem permissao para editar este perfil.';
		if (error.statusCode === 409) return 'Este apelido ja esta em uso.';
		if (error.statusCode === 422) return 'Dados invalidos. Revise os campos.';
		return 'Erro ao atualizar perfil.';
	}

	function getConflictField(): ConflictField {
		const error = mutation.error as AppErrorType | null;
		if (!error || error.statusCode !== 409) return null;
		const message = error.message?.toLowerCase() ?? '';
		if (message.includes('nickname') || message.includes('apelido')) {
			return 'nickname';
		}
		return null;
	}

	return {
		updateMyProfile: mutation.mutateAsync,
		isUpdatingProfile: mutation.isPending,
		updateProfileError: getErrorMessage(),
		conflictField: getConflictField(),
		canEditProfile: !!clientId,
	};
}

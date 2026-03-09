/* eslint-disable no-restricted-imports */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';

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

	const mutation = useMutation({
		mutationFn: (data: UpdateMyProfileInput) =>
			createHTTPRequest<void, UpdateMyProfileInput>({
				path: '/users',
				params: [clientId!],
				method: 'PATCH',
				body: data,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['my-profile'] });
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

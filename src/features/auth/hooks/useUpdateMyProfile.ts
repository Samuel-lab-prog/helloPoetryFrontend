import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppErrorType } from '@features/base';

type UpdateMyProfileInput = {
	name?: string;
	nickname?: string;
	bio?: string;
	avatarUrl?: string;
};

type ConflictField = 'nickname' | null;

function getClientId() {
	try {
		const raw = localStorage.getItem('auth-client');
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { id?: number };
		return parsed.id ?? null;
	} catch {
		return null;
	}
}

export function useUpdateMyProfile() {
	const queryClient = useQueryClient();
	const clientId = getClientId();

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
		if (error.statusCode === 401) return 'Faça login para editar seu perfil.';
		if (error.statusCode === 403)
			return 'Você não tem permissão para editar este perfil.';
		if (error.statusCode === 409) return 'Este apelido já está em uso.';
		if (error.statusCode === 422) return 'Dados inválidos. Revise os campos.';
		return 'Erro ao atualizar perfil.';
	}

	function getConflictField(): ConflictField {
		const error = mutation.error as AppErrorType | null;
		if (!error || error.statusCode !== 409) return null;
		const message = error.errorMessages?.join(' ').toLowerCase() ?? '';
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

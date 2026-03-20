import { useEffect, useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { registerSchema, type RegisterDataType } from '../components/registerSchema';
import { api } from '@root/core/api';
import {
	getAvatarFileError,
	uploadAvatarFile,
	MAX_AVATAR_SIZE_MB,
} from '@features/users/utils/avatarUpload';
import type { CreateUserBody } from '@root/core/api/users/types';
import type { AppErrorType } from '@root/core/base';

export function useRegisterForm() {
	const [generalError, setGeneralError] = useState('');
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
	const [avatarError, setAvatarError] = useState('');
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const navigate = useNavigate();

	useEffect(
		() => () => {
			if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
		},
		[avatarPreviewUrl],
	);

	const form = useForm<RegisterDataType>({
		resolver: zodResolver(registerSchema),
		mode: 'onChange',
		defaultValues: {
			bio: '',
		},
	});

	const registerMutation = useMutation({
		mutationFn: (data: CreateUserBody) => api.users.createUser.mutate(data),

		onSuccess: () => {
			navigate('/login');
		},

		onError: (err: unknown) => {
			handleRegisterError(err, form.setError, setGeneralError);
		},
	});

	function onSubmit(data: RegisterDataType) {
		setGeneralError('');
		setAvatarError('');

		if (!form.formState.isValid) return;

		void (async () => {
			setIsUploadingAvatar(true);
			const payload: CreateUserBody = { ...data };

			if (avatarFile) {
				const fileError = getAvatarFileError(avatarFile);
				if (fileError) {
					setAvatarError(fileError);
					setIsUploadingAvatar(false);
					return;
				}

				try {
					payload.avatarUrl = await uploadAvatarFile(avatarFile);
				} catch (error) {
					const statusCode =
						typeof error === 'object' && error !== null && 'statusCode' in error
							? Number((error as { statusCode?: number }).statusCode)
							: null;

					if (statusCode === 401 || statusCode === 403) {
						setAvatarError(
							'Faça login para enviar avatar. Você pode concluir o cadastro e adicionar depois.',
						);
					} else {
						const message = error instanceof Error ? error.message : 'Erro ao enviar avatar.';
						setAvatarError(message);
						setIsUploadingAvatar(false);
						return;
					}
				}
			}

			registerMutation.mutate(payload);
			setIsUploadingAvatar(false);
		})();
	}

	function onPickAvatar(file: File | null) {
		setAvatarFile(file);
		setAvatarPreviewUrl((current) => {
			if (current) URL.revokeObjectURL(current);
			return file ? URL.createObjectURL(file) : null;
		});

		if (!file) {
			setAvatarError('');
			return;
		}

		const error = getAvatarFileError(file);
		setAvatarError(error ?? '');
	}

	return {
		onSubmit,
		generalError,
		handleSubmit: form.handleSubmit,
		formState: form.formState,
		control: form.control,
		isPending: registerMutation.isPending || isUploadingAvatar,
		setError: form.setError,
		clearErrors: form.clearErrors,
		avatarFile,
		avatarPreviewUrl,
		onPickAvatar,
		avatarError,
		maxAvatarSizeMb: MAX_AVATAR_SIZE_MB,
	};
}
//------------------------------
// HELPERS
//------------------------------
function handleRegisterError(
	err: unknown,
	setError: UseFormSetError<RegisterDataType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = error?.message.toLowerCase();

	if (status === 409) {
		let mapped = false;

		if (message.includes('nickname')) {
			setError('nickname', {
				type: 'manual',
				message: 'Apelido já está em uso',
			});
			mapped = true;
		}

		if (message.includes('email')) {
			setError('email', {
				type: 'manual',
				message: 'E-mail já está em uso',
			});
			mapped = true;
		}

		if (mapped) return;

		setGeneralError('Conflito ao criar conta. Revise os dados e tente novamente.');
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	if (status === 429) {
		setGeneralError('Muitas tentativas. Tente novamente mais tarde.');
		return;
	}

	setGeneralError('Erro de rede. Tente novamente.');
}
